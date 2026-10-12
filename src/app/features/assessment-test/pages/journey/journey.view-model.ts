import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { LearnerAttemptDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { workshopReturn } from '../../utils/workshop-context';
import { AssessmentStore } from '../../state/assessment.store';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs';
import { JourneyNavigation } from './journey-navigation';
import {
  AssessmentView,
  Subject,
  TestSelection,
} from '../../models/assessment.models';

@Injectable()
export class JourneyViewModel {
  private readonly store = inject(AssessmentStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly navigation = inject(JourneyNavigation);
  private leaving = false;
  readonly reviewMode = signal(false);
  readonly questionIndex = signal<number | null>(null);
  private handledLaunch: string | null = null;
  readonly directLaunch = signal(false);
  readonly openingAssignment = computed(
    () => this.directLaunch() && this.busy()
  );
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
    return subject && this.testId()
      ? {
          ...subject,
          tests: subject.tests.filter((t) => t.id === this.testId()),
        }
      : subject;
  });
  readonly missingTest = computed(
    () =>
      !!this.testId() &&
      !!this.selected() &&
      !this.focusedSubject()?.tests.length
  );
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
    const canLeave = () => this.canLeave();
    this.navigation.canLeave = canLeave;
    this.destroy.onDestroy(() => {
      if (this.navigation.canLeave === canLeave)
        this.navigation.canLeave = null;
    });
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        map(() => this.route.snapshot),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe((snapshot) => {
        const params = snapshot.queryParamMap;
        this.view.set(snapshot.data['view'] ?? 'overview');
        this.reviewMode.set(!!snapshot.data['review']);
        const question = Number(params.get('question'));
        this.questionIndex.set(
          params.has('question') &&
            Number.isInteger(question) &&
            question >= 0
            ? question
            : null
        );
        this.directLaunch.set(
          params.get('launch') === 'direct' &&
            !snapshot.paramMap.get('attemptId')
        );
        if (!this.directLaunch()) this.handledLaunch = null;
        this.returnTo.set(workshopReturn(params.get('returnTo')));
        this.workshopName.set(
          params.get('workshopName') || 'Your workshops'
        );
        this.testId.set(params.get('test'));
        this.subject.set(snapshot.paramMap.get('subjectId'));
        this.attemptId.set(snapshot.paramMap.get('attemptId'));
        this.store.clearError();
      });
    this.store.started$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(({ id, subject }) => {
        this.navigate('attempt', subject, id, { approved: true });
      });
    effect(() => {
      if (
        !this.directLaunch() ||
        this.loading() ||
        this.busy() ||
        this.error()
      )
        return;
      const subject = this.selected();
      const test = subject?.tests.find((t) => t.id === this.testId());
      if (!subject || !test || test.status === 'locked') return;
      const key = JSON.stringify([
        subject.subject,
        test.id,
        this.returnTo(),
      ]);
      if (this.handledLaunch === key) return;
      this.handledLaunch = key;
      untracked(() =>
        this.openTest({ subject: subject.subject, test })
      );
    });
    effect(() => {
      if (this.loading() || this.error()) return;
      const attempt = this.active();
      if (
        !attempt ||
        (this.view() !== 'attempt' && this.view() !== 'result')
      )
        return;
      this.subject.set(attempt.subject);
      const expected = attempt.completed ? 'result' : 'attempt';
      if (this.view() !== expected)
        untracked(() =>
          this.navigate(expected, attempt.subject, attempt._id, {
            replaceUrl: true,
          })
        );
    });
    if (!this.loading()) this.load();
  }
  load() {
    if (!this.canLeave()) return;
    this.handledLaunch = null;
    this.store.refresh();
  }
  canLeave() {
    return (
      this.leaving ||
      (!this.busy() && (this.navigation.runnerCanLeave?.() ?? true))
    );
  }
  navigate(
    view: AssessmentView,
    subject: string | null = null,
    attempt: string | null = null,
    options: {
      review?: boolean;
      question?: number;
      approved?: boolean;
      replaceUrl?: boolean;
    } = {}
  ) {
    if (!options.approved && !this.canLeave()) return;
    const path =
      view === 'subject' && subject
        ? ['subjects', subject]
        : (view === 'attempt' || view === 'result') && attempt
          ? [
              view === 'result' ? 'results' : 'attempts',
              attempt,
              ...(options.review ? ['review'] : []),
            ]
          : [view === 'history' ? 'history' : 'overview'];
    this.leaving = true;
    void this.router
      .navigate(path, {
        relativeTo: this.route.parent,
        queryParams: {
          view: null,
          subject: null,
          attempt: null,
          test: this.testId(),
          launch: null,
          question: options.question ?? null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: options.replaceUrl ?? this.directLaunch(),
      })
      .finally(() => (this.leaving = false));
  }
  review(review: boolean, question?: number) {
    this.navigate('attempt', this.subject(), this.attemptId(), {
      review,
      question,
    });
  }
  returnToWorkshop() {
    const url = this.returnTo();
    if (url && !this.busy() && this.view() !== 'attempt')
      void this.router.navigateByUrl(url);
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
    this.store.start({
      subject: event.subject,
      assessmentTestId: event.test.id,
    });
  }

  finish(id: string) {
    const workshop = this.returnTo();
    if (workshop) {
      this.leaving = true;
      void this.router
        .navigateByUrl(workshop, { replaceUrl: true })
        .finally(() => (this.leaving = false));
      return;
    }
    this.navigate('result', this.subject(), id, {
      approved: true,
      replaceUrl: true,
    });
  }
  exit() {
    this.navigate('subject', this.subject());
  }
}
