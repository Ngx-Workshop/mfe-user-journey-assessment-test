import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { AttemptQuestionsDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { subjectInfo } from '../../models/assessment.models';

@Component({
  selector: 'ngx-runner-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @let data = questions();
    <span class="assessment-ui__eyebrow">THE FINAL CHECK</span>
    <h3>Ready to see how you did?</h3>
    <p class="assessment-runner__intro">
      Review your answers before submitting. Once submitted, your
      responses are final.
    </p>
    <div class="assessment-runner__review-list">
      @for (q of data.testQuestions; track $index) {
        <button
          class="assessment-runner__review-row"
          (click)="go.emit($index)"
          [disabled]="submitting()"
        >
          <span class="assessment-runner__number">{{
            $index + 1
          }}</span
          ><span
            ><strong>{{ q.question }}</strong
            ><span
              [class.assessment-runner__answer--unanswered]="
                !answers()[$index]
              "
              >{{ answers()[$index] || 'Not answered yet' }}</span
            ></span
          ><mat-icon>edit</mat-icon>
        </button>
      }
    </div>
    @if (answered() < answers().length) {
      <p class="assessment-runner__notice" role="status">
        Answer all {{ answers().length }} questions before submitting.
        {{ answers().length - answered() }} remaining.
      </p>
    }
    <div class="assessment-runner__workspace-footer">
      <span>{{ answered() }} of {{ answers().length }} answered</span
      ><button
        mat-flat-button
        (click)="submit.emit()"
        [disabled]="
          !canSubmit() ||
          pending() > 0 ||
          !!saveError() ||
          submitting()
        "
      >
        {{ submitting() ? 'Submitting…' : 'Submit assessment'
        }}<mat-icon>arrow_forward</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      @use '../../styles/shared' as ui;
      @include ui.foundation(('eyebrow'));
      .assessment-runner__number {
        display: grid;
        place-items: center;
        width: 23px;
        height: 23px;
        border-radius: 7px;
        background: var(--soft);
        font-size: 11px;
        flex-shrink: 0;
      }
      .assessment-runner__intro {
        font-size: 13px;
        margin: 12px 0 28px;
      }
      .assessment-runner__workspace-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        border-top: 1px solid var(--line);
        padding-top: 25px;
        margin-top: 35px;
      }
      .assessment-runner__workspace-footer > span {
        font-size: 12px;
        color: var(--muted);
      }
      .assessment-runner__review-list {
        display: grid;
      }
      .assessment-runner__review-row {
        display: flex;
        gap: 14px;
        align-items: center;
        text-align: left;
        background: none;
        border: 0;
        border-bottom: 1px solid var(--line);
        padding: 20px 0;
        color: inherit;
      }
      .assessment-runner__review-row > span:nth-child(2) {
        flex: 1;
        display: grid;
        gap: 10px;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .assessment-runner__review-row strong {
        font-size: 14px;
        line-height: 1.5;
      }
      .assessment-runner__review-row span span {
        font-size: 13px;
        color: var(--muted);
      }
      .assessment-runner__review-row
        span
        .assessment-runner__answer--unanswered {
        color: var(--mat-sys-error);
      }
      .assessment-runner__review-row mat-icon {
        font-size: 18px;
      }
      .assessment-runner__notice {
        background: var(--error-soft);
        padding: 16px;
        border-radius: 12px;
        font-size: 13px;
        color: var(--on-error-soft);
        margin: 20px 0;
      }
      @media (max-width: 600px) {
        .assessment-runner__workspace-footer {
          flex-wrap: wrap;
        }
        .assessment-runner__workspace-footer button {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class RunnerReviewComponent {
  readonly info = subjectInfo;

  readonly questions = input.required<AttemptQuestionsDto>();
  readonly answers = input.required<string[]>();
  readonly answered = input.required<number>();
  readonly pending = input(0);
  readonly saveError = input('');
  readonly submitting = input(false);
  readonly canSubmit = input(false);
  readonly go = output<number>();
  readonly submit = output<void>();
}
