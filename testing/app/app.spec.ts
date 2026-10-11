import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { App } from '../../src/app/app';

const subjects = [
  {
    subject: 'ANGULAR', sectionTitle: 'Angular',
    completedCount: 0,
    passedCount: 0,
    highestPassedLevel: 0,
    accuracy: null,
    tests: [
      {
        id: 'definition-1',
        name: 'Angular foundations',
        level: 1,
        questionCount: 1,
        status: 'available',
        attemptId: null,
      },
    ],
  },
  {
    subject: 'NESTJS', sectionTitle: 'NestJS',
    completedCount: 0,
    passedCount: 0,
    highestPassedLevel: 0,
    accuracy: null,
    tests: [],
  },
  {
    subject: 'RXJS', sectionTitle: 'RxJS',
    completedCount: 0,
    passedCount: 0,
    highestPassedLevel: 0,
    accuracy: null,
    tests: [],
  },
];

describe('Learner journey', () => {
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({}));
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    router.navigate.and.resolveTo(true);
    router.navigateByUrl.and.resolveTo(true);
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: params },
        },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function loaded() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http
      .expectOne('/api/assessment-test/learner/catalog')
      .flush(subjects);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
    fixture.detectChanges();
    return fixture;
  }
  it('starts the chosen test when several tests share a level', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const subject = { ...subjects[0], tests: [subjects[0].tests[0],
      { ...subjects[0].tests[0], id: 'definition-2', name: 'Angular components' }] };
    http.expectOne('/api/assessment-test/learner/catalog').flush([subject]);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR' }));
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.assessment-catalog__test-row');
    expect(rows.length).toBe(2);
    expect(rows[1].textContent).toContain('Angular components');
    rows[1].querySelector('button').click();
    const request = http.expectOne('/api/assessment-test/start-test');
    expect(request.request.body).toEqual({ subject: 'ANGULAR', assessmentTestId: 'definition-2' });
    request.flush({ message: 'Changed selection' }, { status: 409, statusText: 'Conflict' });
  });
  it('renders subject cards and eligible tests without authoring controls', () => {
    const fixture = loaded();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.assessment-catalog__subject-card').length).toBe(3);
    expect(element.textContent).toContain('Know your skills.');
    expect(element.textContent).not.toContain('MongoDB');
    params.next(
      convertToParamMap({ view: 'subject', subject: 'ANGULAR' })
    );
    fixture.detectChanges();
    expect(element.textContent).toContain('Angular foundations');
    expect(element.textContent).toContain('Ready to start');
    const start = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Start test')
    )!;
    start.click();
    const request = http.expectOne('/api/assessment-test/start-test');
    expect(request.request.body).toEqual({
      subject: 'ANGULAR',
      assessmentTestId: 'definition-1',
    });
    request.flush({
      _id: 'attempt-1',
      subject: 'ANGULAR', sectionTitle: 'Angular',
      completed: false,
      lastUpdated: new Date().toISOString(),
    });
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: {
          view: 'attempt',
          subject: 'ANGULAR',
          attempt: 'attempt-1',
          test: null,
          launch: null,
        },
      })
    );
    http
      .expectOne('/api/assessment-test/learner/catalog')
      .flush(subjects);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
  });
  it('renders a dynamic section title and starts using its section ID', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const rust = { ...subjects[0], subject: '670000000000000000000001', sectionTitle: 'Rust' };
    http.expectOne('/api/assessment-test/learner/catalog').flush([rust]);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Rust');
    expect(fixture.nativeElement.querySelectorAll('.assessment-catalog__subject-card').length).toBe(1);
    params.next(convertToParamMap({ view: 'subject', subject: rust.subject }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Rust assessments');
    const start = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find((button) => button.textContent?.includes('Start test'))!;
    start.click();
    const request = http.expectOne('/api/assessment-test/start-test');
    expect(request.request.body).toEqual({ subject: rust.subject, assessmentTestId: 'definition-1' });
    request.flush({}, { status: 409, statusText: 'Conflict' });
  });
  it('retains recoverable request errors and supports retry', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http
      .expectOne('/api/assessment-test/learner/catalog')
      .flush({}, { status: 503, statusText: 'Unavailable' });
    // forkJoin cancels the companion request on an error.
    http.expectOne('/api/assessment-test/learner/history');
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '[role="alert"]'
      )
    ).toBeTruthy();
    fixture.componentInstance.load();
    http
      .expectOne('/api/assessment-test/learner/catalog')
      .flush(subjects);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.assessment-catalog__subject-card'
      ).length
    ).toBe(3);
  });
  it('shows an honest empty history and proficiency summary', () => {
    const fixture = loaded();
    params.next(convertToParamMap({ view: 'history' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No passed levels yet'
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Your story starts with one test'
    );
  });
  it('does not display another user’s attempt from a deep link', () => {
    const fixture = loaded();
    params.next(
      convertToParamMap({ view: 'attempt', attempt: 'other-user' })
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Assessment unavailable'
    );
    expect(
      fixture.nativeElement.querySelector('ngx-assessment-runner')
    ).toBeNull();
  });
  it('focuses the exact workshop assessment and preserves context when starting', () => {
    const fixture = loaded();
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'definition-1', returnTo: '/workshops/overview?workshop=w1&page=p1', workshopName: 'Components' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Return to workshop');
    expect(fixture.nativeElement.querySelectorAll('.assessment-catalog__test-row').length).toBe(1);
    fixture.componentInstance.openTest({ subject: 'ANGULAR', test: subjects[0].tests[0] as import('@tmdjr/service-nestjs-assessment-test-contracts').LearnerTestDto });
    const start = http.expectOne('/api/assessment-test/start-test');
    expect(start.request.body.assessmentTestId).toBe('definition-1');
    start.flush({}, { status: 409, statusText: 'Conflict' });
    fixture.componentInstance.navigate('history');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParamsHandling: 'merge' }));
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'missing' })); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Workshop assessment unavailable');
    expect(fixture.nativeElement.querySelector('ngx-learner-catalog')).toBeNull();
  });

  it('automatically returns confirmed assessment completion to its workshop instead of opening results', () => {
    const fixture = loaded();
    params.next(convertToParamMap({ view: 'attempt', attempt: 'owned-attempt', subject: 'ANGULAR', returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    fixture.componentInstance.finish('owned-attempt');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/workshops/overview?workshop=w1&page=p1', { replaceUrl: true });
    expect(router.navigate).not.toHaveBeenCalled();
    http.expectNone('/api/assessment-test/learner/catalog');
  });
  for (const returnTo of [undefined, 'https://example.com']) it(`keeps normal assessment result navigation without valid workshop context (${returnTo})`, () => {
    const fixture = loaded();
    params.next(convertToParamMap({ view: 'attempt', attempt: 'owned-attempt', subject: 'ANGULAR', ...(returnTo ? { returnTo } : {}) }));
    fixture.componentInstance.finish('owned-attempt');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: jasmine.objectContaining({ view: 'result', attempt: 'owned-attempt' }) }));
    http.expectOne('/api/assessment-test/learner/catalog').flush(subjects);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
  });

  it('opens the exact workshop test directly once and preserves return context', () => {
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'definition-1', launch: 'direct', returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    const fixture = loaded();
    const start = http.expectOne('/api/assessment-test/start-test');
    expect(start.request.body).toEqual({ subject: 'ANGULAR', assessmentTestId: 'definition-1' });
    fixture.detectChanges(); http.expectNone('/api/assessment-test/start-test');
    start.flush({ _id: 'attempt-1', subject: 'ANGULAR', completed: false, lastUpdated: new Date().toISOString() });
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ replaceUrl: true, queryParamsHandling: 'merge', queryParams: jasmine.objectContaining({ view: 'attempt', attempt: 'attempt-1', launch: null }) }));
    http.expectOne('/api/assessment-test/learner/catalog').flush(subjects);
    http.expectOne('/api/assessment-test/learner/history').flush([]);
    fixture.detectChanges(); http.expectNone('/api/assessment-test/start-test');
  });
  for (const status of ['in-progress', 'completed']) it(`opens an existing ${status} workshop test without starting another attempt`, () => {
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'definition-1', launch: 'direct' }));
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    http.expectOne('/api/assessment-test/learner/catalog').flush([{ ...subjects[0], tests: [{ ...subjects[0].tests[0], status, attemptId: 'existing' }] }]);
    http.expectOne('/api/assessment-test/learner/history').flush([]); fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: jasmine.objectContaining({ view: status === 'completed' ? 'result' : 'attempt', attempt: 'existing', launch: null }) }));
    http.expectNone('/api/assessment-test/start-test');
  });
  it('does not launch unavailable or locked workshop tests', () => {
    const fixture = loaded();
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'missing', launch: 'direct' })); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Workshop assessment unavailable');
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'definition-1', launch: 'direct' }));
    fixture.componentInstance.load();
    http.expectOne('/api/assessment-test/learner/catalog').flush([{ ...subjects[0], tests: [{ ...subjects[0].tests[0], status: 'locked' }] }]);
    http.expectOne('/api/assessment-test/learner/history').flush([]); fixture.detectChanges();
    http.expectNone('/api/assessment-test/start-test');
  });
  it('retains a failed direct test launch and retries only on explicit refresh', () => {
    params.next(convertToParamMap({ view: 'subject', subject: 'ANGULAR', test: 'definition-1', launch: 'direct' }));
    const fixture = loaded();
    http.expectOne('/api/assessment-test/start-test').flush({}, { status: 503, statusText: 'Offline' });
    fixture.detectChanges(); fixture.detectChanges(); http.expectNone('/api/assessment-test/start-test');
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeTruthy();
    fixture.componentInstance.load();
    http.expectOne('/api/assessment-test/learner/catalog').flush(subjects);
    http.expectOne('/api/assessment-test/learner/history').flush([]); fixture.detectChanges();
    http.expectOne('/api/assessment-test/start-test').flush({}, { status: 503, statusText: 'Offline' });
  });

});
