import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { AnswerSave, AssessmentStore } from './assessment.store';

const base = '/api/assessment-test';
describe('Shared assessment data orchestration', () => {
  let store: AssessmentStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(AssessmentStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('cancels a stale refresh and keeps the latest catalog/history snapshot', () => {
    store.refresh();
    const catalog = http.expectOne(`${base}/learner/catalog`);
    const history = http.expectOne(`${base}/learner/history`);
    store.refresh();
    expect(catalog.cancelled).toBeTrue();
    expect(history.cancelled).toBeTrue();
    expect(store.loading()).toBeTrue();
    http.expectOne(`${base}/learner/catalog`).flush([]);
    http.expectOne(`${base}/learner/history`).flush([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBe('');
  });

  it('ignores duplicate starts and exposes completion after refreshing shared data', () => {
    const started = jasmine.createSpy('started');
    store.started$.subscribe(started);
    const payload = { subject: 'ANGULAR' as const, assessmentTestId: 'definition' };
    store.start(payload);
    store.start(payload);
    const start = http.expectOne(`${base}/start-test`);
    expect(start.request.body).toEqual(payload);
    expect(store.busy()).toBeTrue();
    start.flush({ _id: 'owned' });
    expect(store.busy()).toBeFalse();
    expect(started).toHaveBeenCalledOnceWith({ id: 'owned', subject: 'ANGULAR' });
    http.expectOne(`${base}/learner/catalog`).flush([]);
    http.expectOne(`${base}/learner/history`).flush([]);
  });

  it('serializes captured answer snapshots and continues after a failed save', () => {
    const requests = new Subject<AnswerSave>();
    const outcomes: string[] = [];
    const subscription = store.persistAnswers(requests).subscribe(outcome => outcomes.push(outcome.error));
    requests.next({ id: 'first', answers: ['A', ''] });
    requests.next({ id: 'second', answers: ['A', 'B'] });
    const first = http.expectOne(`${base}/attempts/first/answers`);
    http.expectNone(`${base}/attempts/second/answers`);
    first.flush({ message: 'Save interrupted' }, { status: 503, statusText: 'Unavailable' });
    const second = http.expectOne(`${base}/attempts/second/answers`);
    expect(second.request.body.answers).toEqual(['A', 'B']);
    second.flush({});
    expect(outcomes).toEqual(['Save interrupted', '']);
    subscription.unsubscribe();
  });

  it('does not treat an incomplete reconciliation result as a successful submission', () => {
    const completed = jasmine.createSpy('completed');
    const failed = jasmine.createSpy('failed');
    store.submit('owned', ['A']).subscribe({ next: completed, error: failed });
    http.expectOne(`${base}/submit-test`).flush({}, { status: 504, statusText: 'Lost response' });
    http.expectOne(`${base}/attempts/owned/result`).flush({ attempt: { completed: false }, questions: [] });
    expect(completed).not.toHaveBeenCalled();
    expect(failed).toHaveBeenCalled();
  });
});
