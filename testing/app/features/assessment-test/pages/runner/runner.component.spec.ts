import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RunnerComponent } from '../../../../../../src/app/features/assessment-test/pages/runner/runner.component';

const attempt = {
  _id: 'owned-attempt',
  subject: 'ANGULAR',
  sectionTitle: 'Angular',
  level: 1,
  testName: 'Foundations',
  questionCount: 2,
  draftAnswers: ['A', ''],
  lastUpdated: new Date().toISOString(),
};
const questions = {
  testId: attempt._id,
  name: 'Foundations',
  testQuestions: [
    { question: 'First?', choices: [{ value: 'A' }, { value: 'B' }] },
    {
      question: 'Second?',
      choices: [{ value: 'C' }, { value: 'D' }],
    },
  ],
};

describe('Assessment runner', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [RunnerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });
  function loaded() {
    const fixture = TestBed.createComponent(RunnerComponent);
    fixture.componentRef.setInput('attempt', attempt);
    fixture.detectChanges();
    http
      .expectOne(
        `/api/assessment-test/attempts/${attempt._id}/questions`
      )
      .flush(questions);
    fixture.detectChanges();
    return fixture;
  }
  it('restores saved answers, skips to the first unanswered question and requires all answers before submit', () => {
    const fixture = loaded();
    const runner = fixture.componentInstance;
    expect(runner.current()).toBe(1);
    expect(runner.answered()).toBe(1);
    runner.review.set(true);
    fixture.detectChanges();
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'button'
      )
    ).find((b) => b.textContent?.includes('Submit assessment'))!;
    expect(button.disabled).toBeTrue();
    runner.submit();
    http.expectNone('/api/assessment-test/submit-test');
  });
  it('saves choices, retains choices on failure, retries, reviews and reconciles a lost submission response', () => {
    const fixture = loaded();
    const runner = fixture.componentInstance;
    const completed = jasmine.createSpy('finished');
    runner.finished.subscribe(completed);
    runner.control.setValue('C');
    fixture.detectChanges();
    expect(runner.pending()).toBe(1);
    const save = http.expectOne(
      `/api/assessment-test/attempts/${attempt._id}/answers`
    );
    expect(save.request.body.answers).toEqual(['A', 'C']);
    save.flush(
      { message: 'Connection interrupted' },
      { status: 503, statusText: 'Unavailable' }
    );
    expect(runner.answers()).toEqual(['A', 'C']);
    expect(runner.saveError()).toBe('Connection interrupted');
    runner.save();
    http
      .expectOne(
        `/api/assessment-test/attempts/${attempt._id}/answers`
      )
      .flush({});
    runner.review.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Ready to see how you did?'
    );
    runner.submit();
    expect(runner.control.disabled).toBeTrue();
    const submit = http.expectOne('/api/assessment-test/submit-test');
    expect(submit.request.body).toEqual({
      testId: attempt._id,
      answers: ['A', 'C'],
    });
    submit.flush({}, { status: 504, statusText: 'Lost response' });
    http
      .expectOne(
        `/api/assessment-test/attempts/${attempt._id}/result`
      )
      .flush({ attempt: { completed: true }, questions: [] });
    expect(completed).toHaveBeenCalledWith(attempt._id);
    expect(
      sessionStorage.getItem(`assessment-draft:${attempt._id}`)
    ).toBeNull();
  });
  it('recovers newer unsaved browser answers only after ownership is established', () => {
    sessionStorage.setItem(
      `assessment-draft:${attempt._id}`,
      JSON.stringify({
        updated: Date.now() + 1000,
        answers: ['B', 'D'],
      })
    );
    const fixture = loaded();
    expect(fixture.componentInstance.answers()).toEqual(['B', 'D']);
    http
      .expectOne(
        `/api/assessment-test/attempts/${attempt._id}/answers`
      )
      .flush({});
  });
  it('cancels a previous attempt load and never restores drafts before ownership is confirmed', () => {
    sessionStorage.setItem(
      `assessment-draft:${attempt._id}`,
      JSON.stringify({
        updated: Date.now() + 1000,
        answers: ['B', 'D'],
      })
    );
    const fixture = TestBed.createComponent(RunnerComponent);
    fixture.componentRef.setInput('attempt', attempt);
    fixture.detectChanges();
    const previous = http.expectOne(
      `/api/assessment-test/attempts/${attempt._id}/questions`
    );
    expect(fixture.componentInstance.answers()).toEqual([]);
    fixture.componentRef.setInput('attempt', {
      ...attempt,
      _id: 'next-owned',
      draftAnswers: ['', ''],
    });
    fixture.detectChanges();
    expect(previous.cancelled).toBeTrue();
    http
      .expectOne('/api/assessment-test/attempts/next-owned/questions')
      .flush({ ...questions, testId: 'next-owned' });
    expect(fixture.componentInstance.answers()).toEqual(['', '']);
    fixture.componentInstance.control.setValue('A');
    const save = http.expectOne(
      '/api/assessment-test/attempts/next-owned/answers'
    );
    expect(save.request.body.answers).toEqual(['A', '']);
    save.flush({});
  });

  it('does not submit before questions load or after an empty question response', () => {
    const fixture = TestBed.createComponent(RunnerComponent);
    fixture.componentRef.setInput('attempt', attempt);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.vm.canSubmit()).toBeFalse();
    http.expectNone('/api/assessment-test/submit-test');
    http
      .expectOne(
        `/api/assessment-test/attempts/${attempt._id}/questions`
      )
      .flush({ ...questions, testQuestions: [] });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.vm.canSubmit()).toBeFalse();
    http.expectNone('/api/assessment-test/submit-test');
  });

  it('cancels pending saves and removes the unload listener on destruction', () => {
    const removal = spyOn(
      window,
      'removeEventListener'
    ).and.callThrough();
    const fixture = loaded();
    fixture.componentInstance.control.setValue('C');
    const save = http.expectOne(
      `/api/assessment-test/attempts/${attempt._id}/answers`
    );
    fixture.destroy();
    expect(save.cancelled).toBeTrue();
    expect(removal).toHaveBeenCalledWith(
      'beforeunload',
      jasmine.any(Function)
    );
  });

  it('keeps server answers when a newer browser draft contains invalid choices', () => {
    sessionStorage.setItem(
      `assessment-draft:${attempt._id}`,
      JSON.stringify({
        updated: Date.now() + 1000,
        answers: ['invalid', 'D'],
      })
    );
    const fixture = loaded();
    expect(fixture.componentInstance.answers()).toEqual(['A', '']);
    http.expectNone(
      `/api/assessment-test/attempts/${attempt._id}/answers`
    );
  });

  it('continues server persistence when browser storage is unavailable', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError(
      'Storage unavailable'
    );
    const fixture = loaded();
    fixture.componentInstance.control.setValue('C');
    expect(fixture.componentInstance.storageWarning()).toContain(
      'Browser recovery is unavailable'
    );
    http
      .expectOne(
        `/api/assessment-test/attempts/${attempt._id}/answers`
      )
      .flush({});
    expect(fixture.componentInstance.pending()).toBe(0);
    expect(fixture.componentInstance.saveError()).toBe('');
  });
});
