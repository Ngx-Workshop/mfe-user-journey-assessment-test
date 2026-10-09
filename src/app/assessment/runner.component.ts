import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  Subject as RxSubject,
  catchError,
  concatMap,
  of,
  tap,
} from 'rxjs';
import type {
  AttemptQuestionsDto,
  LearnerAttemptDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  AssessmentApi,
  apiError,
  subjectInfo,
} from './assessment-api.service';

@Component({
  selector: 'ngx-assessment-runner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule,
  ],
  templateUrl: './runner.component.html',
  styleUrl: './runner.component.scss',
})
export class RunnerComponent implements OnInit {
  readonly attempt = input.required<LearnerAttemptDto>();
  readonly finished = output<string>();
  readonly exit = output<void>();
  private readonly api = inject(AssessmentApi);
  private readonly destroy = inject(DestroyRef);
  private readonly saves = new RxSubject<string[]>();
  readonly questions = signal<AttemptQuestionsDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly saveError = signal('');
  readonly storageWarning = signal('');
  readonly answers = signal<string[]>([]);
  readonly current = signal(0);
  readonly review = signal(false);
  readonly pending = signal(0);
  readonly submitting = signal(false);
  readonly control = new FormControl('', { nonNullable: true });
  readonly answered = computed(
    () => this.answers().filter(Boolean).length
  );
  readonly question = computed(
    () => this.questions()?.testQuestions[this.current()]
  );
  readonly info = subjectInfo;
  readonly letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  ngOnInit() {
    this.saves
      .pipe(
        concatMap((answers) =>
          this.api.save(this.attempt()._id, answers).pipe(
            tap(() => {
              this.saveError.set('');
            }),
            catchError((error) => {
              this.saveError.set(apiError(error));
              return of(null);
            }),
            tap(() => this.pending.update((n) => n - 1))
          )
        ),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    this.control.valueChanges
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((value) => {
        this.answers.update((answers) =>
          answers.map((answer, i) =>
            i === this.current() ? value : answer
          )
        );
        this.remember();
        this.save();
      });
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (this.pending() || this.saveError() || this.submitting()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    this.destroy.onDestroy(() =>
      window.removeEventListener('beforeunload', beforeUnload)
    );
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api
      .questions(this.attempt()._id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          this.questions.set(data);
          let draft = this.attempt().draftAnswers;
          try {
            const local: unknown = JSON.parse(
              sessionStorage.getItem(this.key()) ?? 'null'
            );
            if (
              local &&
              typeof local === 'object' &&
              'updated' in local &&
              'answers' in local &&
              typeof local.updated === 'number' &&
              local.updated >
                Date.parse(this.attempt().lastUpdated) &&
              Array.isArray(local.answers) &&
              local.answers.length === data.testQuestions.length &&
              local.answers.every(
                (a: unknown, i: number) =>
                  typeof a === 'string' &&
                  (a === '' ||
                    data.testQuestions[i].choices.some(
                      (c) => c.value === a
                    ))
              )
            )
              draft = local.answers as string[];
          } catch {
            this.storageWarning.set(
              'Browser recovery is unavailable. Wait for “All changes saved” before leaving.'
            );
          }
          this.answers.set(
            data.testQuestions.map((_, i) => draft[i] ?? '')
          );
          this.go(
            Math.max(
              0,
              this.answers().findIndex((a) => !a)
            )
          );
          this.loading.set(false);
          if (
            JSON.stringify(draft) !==
            JSON.stringify(this.attempt().draftAnswers)
          )
            this.save();
        },
        error: (error) => {
          this.error.set(apiError(error));
          this.loading.set(false);
        },
      });
  }
  private key() {
    return `assessment-draft:${this.attempt()._id}`;
  }
  private remember() {
    try {
      sessionStorage.setItem(
        this.key(),
        JSON.stringify({
          updated: Date.now(),
          answers: this.answers(),
        })
      );
    } catch {
      this.storageWarning.set(
        'Browser recovery is unavailable. Wait for “All changes saved” before leaving.'
      );
    }
  }
  save() {
    this.pending.update((n) => n + 1);
    this.saves.next([...this.answers()]);
  }
  go(index: number) {
    this.current.set(index);
    this.review.set(false);
    this.control.setValue(this.answers()[index] ?? '', {
      emitEvent: false,
    });
  }
  submit() {
    if (
      this.answered() !== this.answers().length ||
      this.pending() ||
      this.submitting() ||
      this.saveError()
    )
      return;
    this.submitting.set(true);
    this.control.disable({ emitEvent: false });
    this.error.set('');
    this.api
      .submit(this.attempt()._id, [...this.answers()])
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => this.complete(),
        error: (error) => {
          // A response may be lost after grading. Reconcile only with an owned completed result.
          this.api
            .result(this.attempt()._id)
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe({
              next: () => this.complete(),
              error: () => {
                this.error.set(apiError(error));
                this.submitting.set(false);
                this.control.enable({ emitEvent: false });
              },
            });
        },
      });
  }
  private complete() {
    try {
      sessionStorage.removeItem(this.key());
    } catch {}
    this.submitting.set(false);
    this.finished.emit(this.attempt()._id);
  }
}
