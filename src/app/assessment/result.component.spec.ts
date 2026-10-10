import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ResultComponent } from './result.component';

describe('Historical assessment result', () => {
  it('shows stored scores, dates, selected answers and feedback', () => {
    TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const fixture = TestBed.createComponent(ResultComponent);
    fixture.componentRef.setInput('id', 'history-id');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/assessment-test/attempts/history-id/result')
      .flush({
        attempt: {
          subject: 'ANGULAR',
          level: 1,
          score: 1,
          questionCount: 2,
          passed: false,
          completed: true,
          testName: 'Foundations',
          lastUpdated: '2026-10-09T15:00:00.000Z',
        },
        questions: [
          {
            question: 'First?',
            selectedAnswer: 'B',
            correctAnswer: 'A',
            correct: false,
            feedback: 'Use A because…',
          },
        ],
      });
    fixture.detectChanges();
    expect(fixture.componentInstance.percentage()).toBe(50);
    expect(fixture.nativeElement.textContent).toContain(
      'Needs practice'
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Use A because…'
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Correct answer'
    );
    http.verify();
  });
  it('cancels stale results on input changes and retry, retaining no previous feedback', () => {
    TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(ResultComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('id', 'first');
    fixture.detectChanges();
    const first = http.expectOne('/api/assessment-test/attempts/first/result');
    fixture.componentRef.setInput('id', 'second');
    fixture.detectChanges();
    expect(first.cancelled).toBeTrue();
    const second = http.expectOne('/api/assessment-test/attempts/second/result');
    fixture.componentInstance.load();
    expect(second.cancelled).toBeTrue();
    http.expectOne('/api/assessment-test/attempts/second/result').flush({}, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();
    expect(fixture.componentInstance.data()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('does not have access');
    http.verify();
  });

});
