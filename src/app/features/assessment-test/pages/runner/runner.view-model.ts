import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  EMPTY,
  Subject,
  catchError,
  defer,
  exhaustMap,
  finalize,
  merge,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import type {
  AttemptQuestionsDto,
  LearnerAttemptDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentStore, AnswerSave } from '../../state/assessment.store';
import { apiError } from '../../utils/assessment-error';
import { DraftStorage } from '../../state/draft-storage.service';

/** A runner session owns unsaved choices and form state, never the HTTP client. */
@Injectable()
export class RunnerViewModel {
  private readonly store = inject(AssessmentStore);
  private readonly storage = inject(DraftStorage);
  private readonly destroy = inject(DestroyRef);
  private readonly sessions = new Subject<{ attempt: LearnerAttemptDto; review: boolean; question: number | null }>();
  private readonly submissions = new Subject<void>();
  private readonly completions = new Subject<string>();
  readonly finished$ = this.completions.asObservable();
  private saves = new Subject<AnswerSave>();
  private attempt: LearnerAttemptDto | null = null;
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
  readonly answered = computed(() => this.answers().filter(Boolean).length);
  readonly question = computed(() => this.questions()?.testQuestions[this.current()]);
  readonly canSubmit = computed(() => !!this.questions() && !this.loading() &&
    this.answers().length > 0 && this.answered() === this.answers().length &&
    !this.pending() && !this.saveError() && !this.submitting());

  constructor() {
    this.sessions.pipe(switchMap(({ attempt, review, question }) => {
      this.attempt = attempt;
      this.questions.set(null);
      this.answers.set([]);
      this.pending.set(0);
      this.saveError.set('');
      this.error.set('');
      this.storageWarning.set('');
      this.loading.set(true);
      this.review.set(false);
      this.current.set(0);
      this.control.enable({ emitEvent: false });
      this.saves = new Subject<AnswerSave>();
      // Loading first establishes ownership before restoring browser recovery.
      return this.store.questions(attempt._id).pipe(
        switchMap(data => {
          const draft = this.storage.restore(attempt, data);
          this.questions.set(data);
          this.answers.set(draft.answers);
          this.storageWarning.set(draft.warning);
          const index = question !== null && question < draft.answers.length ? question : Math.max(0, draft.answers.findIndex(answer => !answer));
          this.go(index);
          this.review.set(review);
          this.loading.set(false);
          if (draft.recovered) this.pending.set(1);
          const saves$ = draft.recovered
            ? this.saves.pipe(startWith({ id: attempt._id, answers: [...draft.answers] }))
            : this.saves;
          const persistence$ = this.store.persistAnswers(saves$).pipe(tap(outcome => {
            this.saveError.set(outcome.error);
            this.pending.update(count => count - 1);
          }));
          const submission$ = this.submissions.pipe(exhaustMap(() => defer(() => {
            if (!this.canSubmit()) return EMPTY;
            this.submitting.set(true);
            this.control.disable({ emitEvent: false });
            this.error.set('');
            return this.store.submit(attempt._id, [...this.answers()]).pipe(
              tap(id => { this.storage.clear(id); this.completions.next(id); }),
              catchError(error => { this.error.set(apiError(error)); return EMPTY; }),
              finalize(() => {
                this.submitting.set(false);
                this.control.enable({ emitEvent: false });
              }),
            );
          })));
          return merge(persistence$, submission$);
        }),
        catchError(error => { this.error.set(apiError(error)); this.loading.set(false); return EMPTY; }),
      );
    }), takeUntilDestroyed(this.destroy)).subscribe();
    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroy)).subscribe(value => {
      if (!this.questions() || this.loading() || this.submitting() || !this.attempt) return;
      const choices = this.question()?.choices ?? [];
      if (!choices.some(choice => choice.value === value)) return;
      this.answers.update(answers => answers.map((answer, index) => index === this.current() ? value : answer));
      this.storageWarning.set(this.storage.remember(this.attempt._id, this.answers()));
      this.save();
    });
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (this.pending() || this.saveError() || this.submitting()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    this.destroy.onDestroy(() => window.removeEventListener('beforeunload', beforeUnload));
  }
  load(attempt: LearnerAttemptDto, review = false, question: number | null = null) { this.sessions.next({ attempt, review, question }); }
  canLeave() { return !this.pending() && !this.saveError() && !this.submitting(); }
  save() {
    if (!this.attempt || !this.questions() || this.submitting()) return;
    this.pending.update(count => count + 1);
    this.saves.next({ id: this.attempt._id, answers: [...this.answers()] });
  }
  go(index: number) {
    if (this.submitting() || index < 0 || index >= this.answers().length) return;
    this.current.set(index);
    this.review.set(false);
    this.control.setValue(this.answers()[index] ?? '', { emitEvent: false });
  }
  submit() { if (this.canSubmit()) this.submissions.next(); }
}
