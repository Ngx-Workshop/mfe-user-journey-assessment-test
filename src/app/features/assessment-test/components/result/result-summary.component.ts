import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { LearnerResultDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { Subject, subjectInfo } from '../../models/assessment.models';

@Component({
  selector: 'ngx-result-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  template: `
@let result = data();
  <section class="assessment-result__result-hero">
    <div>
      <span class="assessment-ui__eyebrow">{{ info(result.attempt).name }} · LEVEL
        {{ result.attempt.level }} · ASSESSMENT COMPLETE</span>
      <h2>
        {{
          result.attempt.passed
            ? 'A level worth celebrating.'
            : 'Every answer is a next step.'
        }}
      </h2>
      <p>
        {{
          result.attempt.passed
            ? 'You answered every question correctly. Your proficiency now reflects this passed level.'
            : 'Your result is a starting point. Use the feedback below to strengthen your understanding.'
        }}
      </p>
      <span class="assessment-ui__badge" [class.assessment-ui__badge--success]="result.attempt.passed">{{
        result.attempt.passed ? 'Passed' : 'Needs practice'
      }}</span>
      <div class="assessment-result__result-details">
        <strong>{{ result.attempt.testName }}</strong><span>Completed
          {{ result.attempt.lastUpdated | date: 'medium' }}</span>
      </div>
    </div>
    <div
      class="assessment-result__score-ring"
      [style.--score-angle]="percentage() * 3.6 + 'deg'">
      <div>
        <strong>{{ percentage() }}<small>%</small></strong><span>{{ result.attempt.score }} /
          {{ result.attempt.questionCount }} correct</span>
      </div>
    </div>
  </section>
  <div class="assessment-result__result-actions">
    <button
      mat-flat-button
      (click)="nextSubject.emit(result.attempt.subject)">
      Explore next assessments<mat-icon>arrow_forward</mat-icon></button><button mat-stroked-button (click)="back.emit()">
      View test history</button><span>A perfect score is required to pass. Completion advances your
      available level.</span>
  </div>
  `,
  styles: [`
    @use '../../styles/shared' as ui;
    @include ui.foundation(('badge', 'eyebrow',));
.assessment-result__result-hero {
    display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 50px; align-items: center;
    padding: 38px; border: 1px solid var(--line); background: var(--soft); border-radius: 22px;
  }
.assessment-result__result-hero h2 { font-size: clamp(28px, 4vw, 38px); margin: 18px 0; }
.assessment-result__result-hero p { max-width: 540px; font-size: 14px; }
.assessment-result__result-hero .assessment-ui__badge {
    margin-top: 18px; background: var(--tertiary-soft); color: var(--on-tertiary-soft);
  }
.assessment-result__result-hero .assessment-ui__badge.assessment-ui__badge--success {
    background: var(--primary-soft); color: var(--on-primary-soft);
  }
.assessment-result__result-details { display: grid; gap: 7px; margin-top: 28px; font-size: 13px; }
.assessment-result__result-details span { color: var(--muted); font-size: 11px; }
.assessment-result__score-ring {
    width: 200px; height: 200px;
    background: conic-gradient(var(--accent) var(--score-angle), var(--line) 0); border-radius: 50%;
    padding: 10px;
  }
.assessment-result__score-ring > div {
    background: var(--soft); border-radius: 50%; width: 100%; height: 100%; display: flex;
    flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  }
.assessment-result__score-ring strong { font-size: 50px; font-weight: 600; letter-spacing: -3px; }
.assessment-result__score-ring small { font-size: 24px; }
.assessment-result__score-ring span { font-size: 12px; color: var(--muted); }
.assessment-result__result-actions {
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 25px 0 50px;
  }
.assessment-result__result-actions > span { width: 100%; font-size: 11px; color: var(--muted); margin-top: 4px; }
@media (max-width: 700px) {
.assessment-result__result-hero { grid-template-columns: 1fr; padding: 25px; gap: 25px; }
.assessment-result__score-ring { width: 170px; height: 170px; }
.assessment-result__result-actions button { font-size: 12px; }
}
  `],
})
export class ResultSummaryComponent {
  readonly info = subjectInfo;

  readonly data = input.required<LearnerResultDto>();
  readonly percentage = input.required<number>();
  readonly back = output<void>();
  readonly nextSubject = output<Subject>();
}
