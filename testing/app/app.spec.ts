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
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
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
});
