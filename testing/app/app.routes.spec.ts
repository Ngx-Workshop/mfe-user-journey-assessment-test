import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  NavigationCancel,
  Router,
  provideRouter,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import {
  LearnerAttemptDto,
  LearnerSubjectDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import App from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';
import { RunnerComponent } from '../../src/app/features/assessment-test/pages/runner/runner.component';
import { By } from '@angular/platform-browser';

const attempt: LearnerAttemptDto = {
  _id: 'owned',
  assessmentTestId: 'definition',
  uuid: 'learner',
  subject: 'angular',
  sectionTitle: 'Angular',
  testName: 'Foundations',
  level: 1,
  questionCount: 2,
  score: 0,
  userAnswers: [],
  draftAnswers: ['A', 'C'],
  passed: false,
  completed: false,
  lastUpdated: '2026-10-11T12:00:00Z',
  __v: 0,
};
const subjects: LearnerSubjectDto[] = [
  {
    subject: 'angular',
    sectionTitle: 'Angular',
    completedCount: 0,
    passedCount: 0,
    highestPassedLevel: 0,
    accuracy: null,
    tests: [
      {
        id: 'definition',
        name: 'Foundations',
        level: 1,
        questionCount: 2,
        status: 'available',
        attemptId: null,
      },
    ],
  },
];
const questions = {
  testId: 'owned',
  name: 'Foundations',
  testQuestions: [
    { question: 'First?', choices: [{ value: 'A' }, { value: 'B' }] },
    {
      question: 'Second?',
      choices: [{ value: 'C' }, { value: 'D' }],
    },
  ],
};

describe('Assessment Angular routes under the shell mount', () => {
  let http: HttpTestingController;
  let router: Router;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'take-assessment-test', children: Routes },
          { path: 'workshops/overview', children: [] },
        ]),
        provideLocationMocks(),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    router.setUpLocationChangeListener();
    harness = await RouterTestingHarness.create();
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });
  async function settled() {
    await harness.fixture.whenStable();
    harness.detectChanges();
  }
  async function catalog(
    attempts: LearnerAttemptDto[] = [attempt],
    catalogSubjects = subjects
  ) {
    http
      .expectOne('/api/assessment-test/learner/catalog')
      .flush(catalogSubjects);
    http
      .expectOne('/api/assessment-test/learner/history')
      .flush(attempts);
    await settled();
  }
  async function runnerQuestions(id = 'owned') {
    http
      .expectOne('/api/assessment-test/attempts/' + id + '/questions')
      .flush(questions);
    await settled();
  }
  function runner() {
    return harness.fixture.debugElement.query(
      By.directive(RunnerComponent)
    ).componentInstance as RunnerComponent;
  }
  async function result() {
    // A superseded result read may be cancelled during unfinished-result normalization.
    const reads = http.match(
      '/api/assessment-test/attempts/owned/result'
    );
    reads
      .filter((r) => !r.cancelled)
      .forEach((r) =>
        r.flush({
          attempt: { ...attempt, completed: true },
          questions: [],
        })
      );
    await settled();
  }

  it('opens overview, subject and history routes and recovers unknown paths', async () => {
    await harness.navigateByUrl('/take-assessment-test');
    await catalog([]);
    expect(router.url).toBe('/take-assessment-test/overview');
    await harness.navigateByUrl(
      '/take-assessment-test/subjects/angular'
    );
    await catalog([]);
    expect(harness.routeNativeElement?.textContent).toContain(
      'Foundations'
    );
    await harness.navigateByUrl('/take-assessment-test/history');
    await catalog([]);
    expect(harness.routeNativeElement?.textContent).toContain(
      'Your story starts with one test'
    );
    await harness.navigateByUrl('/take-assessment-test/unknown');
    await catalog([]);
    expect(router.url).toBe('/take-assessment-test/overview');
    await harness.navigateByUrl(
      '/take-assessment-test/unknown?view=history'
    );
    await catalog([]);
    expect(router.url).toBe('/take-assessment-test/history');
  });
  it('migrates legacy subject, history and attempt query links without dropping context', async () => {
    await harness.navigateByUrl(
      '/take-assessment-test/overview?view=subject&subject=section%2Fone&test=definition&workshopName=Components'
    );
    await catalog([]);
    expect(router.url).toBe(
      '/take-assessment-test/subjects/section%2Fone?test=definition&workshopName=Components'
    );
    await harness.navigateByUrl(
      '/take-assessment-test/overview?view=history'
    );
    await catalog([]);
    expect(router.url).toBe('/take-assessment-test/history');
    await harness.navigateByUrl(
      '/take-assessment-test/overview?view=attempt&attempt=owned&subject=angular&returnTo=%2Fworkshops%2Foverview'
    );
    await catalog();
    await runnerQuestions();
    expect(router.url).toBe(
      '/take-assessment-test/attempts/owned?returnTo=%2Fworkshops%2Foverview'
    );
  });
  it('initializes review from saved answers and returns to the selected question through a route', async () => {
    await harness.navigateByUrl(
      '/take-assessment-test/attempts/owned/review?workshopName=Components'
    );
    await catalog();
    await runnerQuestions();
    expect(runner().review()).toBeTrue();
    expect(runner().answers()).toEqual(['A', 'C']);
    expect(harness.routeNativeElement?.textContent).toContain(
      'Ready to see how you did?'
    );
    runner().go(1);
    await settled();
    await catalog();
    await runnerQuestions();
    expect(router.url).toBe(
      '/take-assessment-test/attempts/owned?workshopName=Components&question=1'
    );
    expect(runner().current()).toBe(1);
    expect(runner().review()).toBeFalse();
    runner().reviewChange.emit({ review: true });
    await settled();
    await catalog();
    await runnerQuestions();
    expect(router.url).toBe(
      '/take-assessment-test/attempts/owned/review?workshopName=Components'
    );
  });
  it('protects browser Back, route parameter changes and failed answer saves', async () => {
    await harness.navigateByUrl('/take-assessment-test/history');
    await catalog();
    await harness.navigateByUrl(
      '/take-assessment-test/attempts/owned'
    );
    await catalog();
    await runnerQuestions();
    runner().control.setValue('B');
    const save = http.expectOne(
      '/api/assessment-test/attempts/owned/answers'
    );
    const cancelled = firstValueFrom(
      router.events.pipe(
        filter((event) => event instanceof NavigationCancel)
      )
    );
    TestBed.inject(Location).back();
    await cancelled;
    await settled();
    expect(router.url).toBe('/take-assessment-test/attempts/owned');
    await harness.navigateByUrl(
      '/take-assessment-test/attempts/other'
    );
    expect(router.url).toBe('/take-assessment-test/attempts/owned');
    save.flush({}, { status: 503, statusText: 'Offline' });
    await settled();
    await harness.navigateByUrl('/take-assessment-test/history');
    expect(router.url).toBe('/take-assessment-test/attempts/owned');
    expect(runner().answers()).toEqual(['B', 'C']);
    runner().save();
    http
      .expectOne('/api/assessment-test/attempts/owned/answers')
      .flush({});
    await harness.navigateByUrl('/take-assessment-test/history');
    await catalog();
    expect(router.url).toBe('/take-assessment-test/history');
  });
  it('reconciles completed attempt and unfinished result paths against owned history', async () => {
    await harness.navigateByUrl(
      '/take-assessment-test/attempts/owned'
    );
    await catalog([{ ...attempt, completed: true }]);
    expect(router.url).toBe('/take-assessment-test/results/owned');
    await catalog([{ ...attempt, completed: true }]);
    await result();
    await harness.navigateByUrl('/take-assessment-test/history');
    await catalog();
    await harness.navigateByUrl(
      '/take-assessment-test/results/owned?workshopName=Components'
    );
    await catalog();
    expect(router.url).toBe(
      '/take-assessment-test/attempts/owned?workshopName=Components'
    );
    await result();
    await catalog();
    await runnerQuestions();
  });
  it('launches the exact workshop definition once and preserves the return context', async () => {
    await harness.navigateByUrl(
      '/take-assessment-test/subjects/angular?test=definition&launch=direct&returnTo=%2Fworkshops%2Foverview&workshopName=Components'
    );
    await catalog([]);
    const start = http.expectOne('/api/assessment-test/start-test');
    expect(start.request.body).toEqual({
      subject: 'angular',
      assessmentTestId: 'definition',
    });
    start.flush(attempt);
    await settled();
    await catalog();
    await runnerQuestions();
    expect(router.url).toBe(
      '/take-assessment-test/attempts/owned?test=definition&returnTo=%2Fworkshops%2Foverview&workshopName=Components'
    );
    http.expectNone('/api/assessment-test/start-test');
    runner().submit();
    http
      .expectOne('/api/assessment-test/submit-test')
      .flush({ ...attempt, completed: true });
    await settled();
    expect(router.url).toBe('/workshops/overview');
  });
  it('blocks exits during submission and opens standalone results after confirmed completion', async () => {
    await harness.navigateByUrl(
      '/take-assessment-test/attempts/owned/review'
    );
    await catalog();
    await runnerQuestions();
    runner().submit();
    const submit = http.expectOne('/api/assessment-test/submit-test');
    await harness.navigateByUrl('/take-assessment-test/history');
    expect(router.url).toBe(
      '/take-assessment-test/attempts/owned/review'
    );
    submit.flush({ ...attempt, completed: true });
    await settled();
    expect(router.url).toBe('/take-assessment-test/results/owned');
    await catalog([{ ...attempt, completed: true }]);
    await result();
  });
  it('shows missing subjects and owned attempts without fetching another learner’s questions', async () => {
    await harness.navigateByUrl(
      '/take-assessment-test/subjects/missing'
    );
    await catalog([]);
    expect(harness.routeNativeElement?.textContent).toContain(
      'Subject unavailable'
    );
    await harness.navigateByUrl(
      '/take-assessment-test/attempts/other'
    );
    await catalog([], []);
    expect(harness.routeNativeElement?.textContent).toContain(
      'Assessment unavailable'
    );
    http.expectNone('/api/assessment-test/attempts/other/questions');
  });
});
