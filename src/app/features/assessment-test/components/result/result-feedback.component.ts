import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { LearnerResultDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { subjectInfo } from '../../models/assessment.models';

@Component({
  selector: 'ngx-result-feedback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
@let result = data();
  <div class="assessment-ui__section-heading">
    <div>
      <span class="assessment-ui__eyebrow">MAKE THE INSIGHT COUNT</span>
      <h2>Your answers, explained</h2>
      <p>
        Revisit your reasoning and take something new into your next
        assessment.
      </p>
    </div>
    <span class="assessment-ui__badge">{{ result.questions.length }}
      {{
        result.questions.length === 1 ? 'question' : 'questions'
      }}</span>
  </div>
  <div class="assessment-result__feedback-list">
    @for (question of result.questions; track $index) {
      <article class="assessment-result__feedback" [class.assessment-result__feedback--correct]="question.correct">
        <div class="assessment-result__feedback-heading">
          <span class="assessment-ui__eyebrow">QUESTION {{ $index + 1 }}</span><span class="assessment-result__feedback-status"><mat-icon>{{
              question.correct ? 'check_circle' : 'lightbulb_outline'
            }}</mat-icon>{{
              question.correct ? 'Correct' : 'Keep learning'
            }}</span>
        </div>
        <h3>{{ question.question }}</h3>
        <div class="assessment-result__answer-grid">
          <div>
            <span>Your answer</span>
            <p>{{ question.selectedAnswer }}</p>
          </div>
          @if (!question.correct) {
            <div>
              <span>Correct answer</span>
              <p>{{ question.correctAnswer }}</p>
            </div>
          }
        </div>
        <div class="assessment-result__feedback-note">
          <mat-icon>chat_bubble_outline</mat-icon>
          <p>{{ question.feedback }}</p>
        </div>
      </article>
    }
  </div>
  `,
  styles: [`
    @use '../../styles/shared' as ui;
    @include ui.foundation(('badge', 'eyebrow', 'section-heading',));
.assessment-result__feedback-list { display: grid; gap: 18px; }
.assessment-result__feedback {
    padding: 27px; border: 1px solid var(--line); border-radius: 18px; background: var(--panel);
  }
.assessment-result__feedback.assessment-result__feedback--correct { border-color: var(--line); }
.assessment-result__feedback-heading { display: flex; align-items: center; justify-content: space-between; }
.assessment-result__feedback-heading .assessment-ui__eyebrow { margin: 0; }
.assessment-result__feedback-status {
    display: flex; gap: 6px; align-items: center; font-size: 11px; color: var(--mat-sys-error);
  }
.assessment-result__feedback--correct .assessment-result__feedback-status { color: var(--accent); }
.assessment-result__feedback-status mat-icon { font-size: 16px; height: 16px; width: 16px; }
.assessment-result__feedback h3 {
    font-size: 18px; line-height: 1.5; margin: 22px 0; white-space: pre-wrap; overflow-wrap: anywhere;
  }
.assessment-result__answer-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.assessment-result__answer-grid span {
    font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted);
  }
.assessment-result__answer-grid p {
    margin: 9px 0; font-size: 13px; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere;
  }
.assessment-result__feedback-note {
    background: var(--soft); border-radius: 12px; display: flex; gap: 12px; align-items: flex-start;
    margin-top: 20px; padding: 17px;
  }
.assessment-result__feedback-note mat-icon {
    color: var(--accent); font-size: 18px; height: 18px; width: 18px; flex-shrink: 0;
  }
.assessment-result__feedback-note p { font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere; }
@media (max-width: 700px) {
.assessment-result__answer-grid { grid-template-columns: 1fr; }
.assessment-result__feedback { padding: 20px; }
}
  `],
})
export class ResultFeedbackComponent {
  readonly info = subjectInfo;

  readonly data = input.required<LearnerResultDto>();
}
