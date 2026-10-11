import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { LearnerAttemptDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { workshopReturn } from '../../utils/workshop-context';
import { AssessmentStore } from '../../state/assessment.store';
import { AssessmentView, Subject, TestSelection } from '../../models/assessment.models';

@Injectable()
export class JourneyViewModel {
  private readonly store = inject(AssessmentStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly subjects = this.store.subjects;
  readonly attempts = this.store.attempts;
  readonly loading = this.store.loading;
  readonly busy = this.store.busy;
  readonly error = this.store.error;
  readonly view = signal<AssessmentView>('overview');
  readonly subject = signal<string | null>(null);
  readonly attemptId = signal<string | null>(null);
  readonly returnTo = signal<string | null>(null);
  readonly workshopName = signal('Your workshops');
  readonly testId = signal<string | null>(null);
  readonly focusedSubject = computed(() => {
    const subject = this.selected();
    return subject && this.testId() ? { ...subject, tests: subject.tests.filter(t => t.id === this.testId()) } : subject;
  });
  readonly missingTest = computed(() => !!this.testId() && !!this.selected() && !this.focusedSubject()?.tests.length);
  readonly selected = computed(
    () =>
      this.subjects().find((s) => s.subject === this.subject()) ??
      null
  );
  readonly active = computed(
    () =>
      this.attempts().find((a) => a._id === this.attemptId()) ?? null
  );
  readonly completedCount = this.store.completedCount;
  readonly passedCount = this.store.passedCount;
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
            ? view as AssessmentView
            : 'overview'
        );
        this.returnTo.set(workshopReturn(params.get('returnTo')));
        this.workshopName.set(params.get('workshopName') || 'Your workshops');
        this.testId.set(params.get('test'));
        this.subject.set(params.get('subject'));
        this.attemptId.set(params.get('attempt'));
        this.store.clearError();
      });
    this.store.started$.pipe(takeUntilDestroyed(this.destroy)).subscribe(({ id, subject }) => {
      this.navigate('attempt', subject, id);
    });
    this.load();
  }
  load() { this.store.refresh(); }
  navigate(
    view: AssessmentView,
    subject: string | null = null,
    attempt: string | null = null
  ) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        view: view === 'overview' ? null : view,
        subject,
        attempt,
        test: this.testId(),
      },
      queryParamsHandling: 'merge',
    });
  }
  returnToWorkshop() {
    const url = this.returnTo();
    if (url && !this.busy() && this.view() !== 'attempt') void this.router.navigateByUrl(url);
  }
  openSubject(subject: Subject) {
    this.testId.set(null);
    this.navigate('subject', subject);
  }
  openAttempt(attempt: LearnerAttemptDto) {
    this.navigate(
      attempt.completed ? 'result' : 'attempt',
      attempt.subject,
      attempt._id
    );
  }
  openTest(event: TestSelection) {
    if (this.busy() || event.test.status === 'locked') return;
    if (event.test.attemptId) {
      this.navigate(
        event.test.status === 'completed' ? 'result' : 'attempt',
        event.subject,
        event.test.attemptId
      );
      return;
    }
    this.store.start({ subject: event.subject, assessmentTestId: event.test.id });
  }

  finish(id: string) {
    const workshop = this.returnTo();
    if (workshop) {
      void this.router.navigateByUrl(workshop, { replaceUrl: true });
      return;
    }
    this.navigate('result', this.subject(), id);
    this.load();
  }
  exit() {
    this.navigate('subject', this.subject());
    this.load();
  }
}
