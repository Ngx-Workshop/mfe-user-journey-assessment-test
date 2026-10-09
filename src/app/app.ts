import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';
import type {
  LearnerAttemptDto,
  LearnerSubjectDto,
  LearnerTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  AssessmentApi,
  Subject,
  apiError,
} from './assessment/assessment-api.service';
import { CatalogComponent } from './assessment/catalog.component';
import { RunnerComponent } from './assessment/runner.component';
import { ResultComponent } from './assessment/result.component';

@Component({
  selector: 'ngx-seed-mfe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    CatalogComponent,
    RunnerComponent,
    ResultComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly api = inject(AssessmentApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly content = viewChild<ElementRef<HTMLElement>>('content');
  readonly subjects = signal<LearnerSubjectDto[]>([]);
  readonly attempts = signal<LearnerAttemptDto[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly view = signal('overview');
  readonly subject = signal<string | null>(null);
  readonly attemptId = signal<string | null>(null);
  readonly selected = computed(
    () =>
      this.subjects().find((s) => s.subject === this.subject()) ??
      null
  );
  readonly active = computed(
    () =>
      this.attempts().find((a) => a._id === this.attemptId()) ?? null
  );
  readonly completedCount = computed(
    () => this.attempts().filter((a) => a.completed).length
  );
  readonly passedCount = computed(
    () =>
      this.attempts().filter((a) => a.completed && a.passed).length
  );
  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((params) => {
        const view = params.get('view') ?? 'overview';
        this.view.set(
          [
            'overview',
            'subject',
            'history',
            'attempt',
            'result',
          ].includes(view)
            ? view
            : 'overview'
        );
        this.subject.set(params.get('subject'));
        this.attemptId.set(params.get('attempt'));
        this.error.set('');
        afterNextRender(
          () => {
            const target =
              this.view() === 'overview'
                ? this.host.nativeElement
                : this.content()?.nativeElement;
            target?.scrollIntoView({ block: 'start' });
            this.content()?.nativeElement.focus({
              preventScroll: true,
            });
          },
          { injector: this.injector }
        );
      });
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      subjects: this.api.catalog(),
      attempts: this.api.history(),
    })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          this.subjects.set(data.subjects);
          this.attempts.set(data.attempts);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(apiError(error));
          this.loading.set(false);
        },
      });
  }
  navigate(
    view: string,
    subject: string | null = null,
    attempt: string | null = null
  ) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        view: view === 'overview' ? null : view,
        subject,
        attempt,
      },
    });
  }
  openSubject(subject: Subject) {
    this.navigate('subject', subject);
  }
  openAttempt(attempt: LearnerAttemptDto) {
    this.navigate(
      attempt.completed ? 'result' : 'attempt',
      attempt.subject,
      attempt._id
    );
  }
  openTest(event: { subject: Subject; test: LearnerTestDto }) {
    if (this.busy() || event.test.status === 'locked') return;
    if (event.test.attemptId) {
      this.navigate(
        event.test.status === 'completed' ? 'result' : 'attempt',
        event.subject,
        event.test.attemptId
      );
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api
      .start({
        subject: event.subject,
        assessmentTestId: event.test.id,
      })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (attempt) => {
          this.busy.set(false);
          this.navigate('attempt', event.subject, attempt._id);
          this.load();
        },
        error: (error) => {
          this.error.set(apiError(error));
          this.busy.set(false);
        },
      });
  }
  finish(id: string) {
    this.navigate('result', this.subject(), id);
    this.load();
  }
  exit() {
    this.navigate('subject', this.subject());
    this.load();
  }
}
export default App;
