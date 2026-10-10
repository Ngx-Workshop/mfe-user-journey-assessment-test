import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, defer, finalize, switchMap, tap } from 'rxjs';
import type { LearnerResultDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentStore } from './assessment.store';
import { apiError } from './assessment-error';

@Injectable()
export class ResultViewModel {
  private readonly store = inject(AssessmentStore);
  private readonly requests = new Subject<string>();
  readonly data = signal<LearnerResultDto | null>(null);
  readonly error = signal('');
  readonly loading = signal(true);
  readonly percentage = computed(() => {
    const attempt = this.data()?.attempt;
    return attempt?.questionCount ? Math.round(100 * attempt.score / attempt.questionCount) : 0;
  });
  constructor() {
    this.requests.pipe(switchMap(id => defer(() => {
      this.data.set(null);
      this.error.set('');
      this.loading.set(true);
      return this.store.result(id).pipe(
        tap(data => this.data.set(data)),
        catchError(error => { this.error.set(apiError(error)); return EMPTY; }),
        finalize(() => this.loading.set(false)),
      );
    })), takeUntilDestroyed(inject(DestroyRef))).subscribe();
  }
  load(id: string) { this.requests.next(id); }
}
