import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, concatMap, defer, exhaustMap,
  finalize, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import type { LearnerAttemptDto, LearnerSubjectDto, StartTestDto } from
  '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentApi } from './assessment-api.service';
import { apiError } from './assessment-error';

export interface AnswerSave { id: string; answers: string[]; }
export type SaveOutcome = { error: string };

/** Shared server state. HTTP is confined to the stateless API client. */
@Injectable({ providedIn: 'root' })
export class AssessmentStore {
  private readonly api = inject(AssessmentApi);
  private readonly refreshRequests = new Subject<void>();
  private readonly startRequests = new Subject<StartTestDto>();
  private readonly startedEvents = new Subject<{ id: string; subject: StartTestDto['subject'] }>();
  readonly started$ = this.startedEvents.asObservable();
  private readonly catalogState = signal<LearnerSubjectDto[]>([]);
  private readonly historyState = signal<LearnerAttemptDto[]>([]);
  private readonly loadingState = signal(false);
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  readonly subjects = this.catalogState.asReadonly();
  readonly attempts = this.historyState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly completedCount = computed(() => this.attempts().filter(a => a.completed).length);
  readonly passedCount = computed(() => this.attempts().filter(a => a.completed && a.passed).length);

  constructor() {
    const destroy = inject(DestroyRef);
    this.refreshRequests.pipe(
      switchMap(() => defer(() => {
        this.loadingState.set(true);
        this.errorState.set('');
        return forkJoin({ subjects: this.api.catalog(), attempts: this.api.history() }).pipe(
          tap(data => {
            this.catalogState.set(data.subjects);
            this.historyState.set(data.attempts);
          }),
          catchError(error => { this.errorState.set(apiError(error)); return EMPTY; }),
          finalize(() => this.loadingState.set(false)),
        );
      })), takeUntilDestroyed(destroy),
    ).subscribe();
    this.startRequests.pipe(
      exhaustMap(payload => defer(() => {
        this.busyState.set(true);
        this.errorState.set('');
        return this.api.start(payload).pipe(
          tap(attempt => {
            this.refresh();
            this.startedEvents.next({ id: attempt._id, subject: payload.subject });
          }),
          catchError(error => { this.errorState.set(apiError(error)); return EMPTY; }),
          finalize(() => this.busyState.set(false)),
        );
      })), takeUntilDestroyed(destroy),
    ).subscribe();
  }
  refresh() { this.refreshRequests.next(); }
  clearError() { this.errorState.set(''); }
  start(payload: StartTestDto) { this.startRequests.next(payload); }
  questions(id: string) { return this.api.questions(id); }
  result(id: string) { return this.api.result(id); }

  /** Captured attempt IDs prevent queued saves from targeting a different runner. */
  persistAnswers(requests$: Observable<AnswerSave>): Observable<SaveOutcome> {
    return requests$.pipe(concatMap(({ id, answers }) => this.api.save(id, answers).pipe(
      map(() => ({ error: '' })),
      catchError(error => of({ error: apiError(error) })),
    )));
  }
  submit(id: string, answers: string[]) {
    return this.api.submit(id, answers).pipe(
      map(() => id),
      catchError(original => this.api.result(id).pipe(
        switchMap(result => result.attempt.completed ? of(id) : throwError(() => original)),
        catchError(() => throwError(() => original)),
      )),
    );
  }
}
