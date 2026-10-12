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
  selector: 'ngx-runner-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @let data = questions();
    <aside class="assessment-runner__outline">
      <div class="assessment-runner__outline-heading">
        <strong>Your progress</strong
        ><span>{{ answered() }}/{{ answers().length }}</span>
      </div>
      <div class="assessment-ui__progress-track">
        <span
          [style.width.%]="(answered() / answers().length) * 100"
        ></span>
      </div>
      <nav
        class="assessment-runner__navigator"
        aria-label="Question navigation"
      >
        @for (q of data.testQuestions; track $index) {
          <button
            class="assessment-runner__step"
            [class.assessment-runner__step--selected]="
              !review() && current() === $index
            "
            [class.assessment-runner__step--answered]="
              !!answers()[$index]
            "
            [attr.aria-current]="
              !review() && current() === $index ? 'step' : null
            "
            [disabled]="submitting()"
            (click)="go.emit($index)"
          >
            <span class="assessment-runner__number">{{
              $index + 1
            }}</span
            >Question {{ $index + 1
            }}<mat-icon>{{
              answers()[$index]
                ? 'check_circle'
                : 'radio_button_unchecked'
            }}</mat-icon>
          </button>
        }
        <button
          class="assessment-runner__step"
          [class.assessment-runner__step--selected]="review()"
          (click)="showReview.emit()"
          [disabled]="submitting()"
        >
          <mat-icon>fact_check</mat-icon>Review answers
        </button>
      </nav>
      <div class="assessment-runner__save-status" role="status">
        <mat-icon>{{
          saveError()
            ? 'cloud_off'
            : pending()
              ? 'sync'
              : 'cloud_done'
        }}</mat-icon
        >{{
          saveError()
            ? 'Changes not saved'
            : pending()
              ? 'Saving your answers…'
              : 'All changes saved'
        }}
      </div>
      @if (saveError()) {
        <p class="assessment-runner__save-error" role="alert">
          {{ saveError() }}
        </p>
        <button
          mat-button
          (click)="save.emit()"
          [disabled]="pending() > 0"
        >
          Retry saving
        </button>
      }
      <p class="assessment-runner__tip">
        There’s no timer. Take a breath, think it through, and make it
        yours.
      </p>
    </aside>
  `,
  styles: [
    `
      @use '../../styles/shared' as ui;
      @include ui.foundation(('progress-track'));
      .assessment-runner__outline {
        min-width: 0;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 24px 16px;
        background: var(--panel);
      }
      .assessment-runner__outline-heading {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin: 0 4px 15px;
        color: var(--muted);
      }
      .assessment-runner__outline .assessment-ui__progress-track {
        margin: 0 4px 20px;
      }
      .assessment-runner__navigator {
        display: grid;
        gap: 4px;
      }
      .assessment-runner__step {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 10px;
        background: transparent;
        border: 0;
        border-radius: 10px;
        color: var(--muted);
        font-size: 12px;
        text-align: left;
      }
      .assessment-runner__step > mat-icon:last-child {
        margin-left: auto;
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
      .assessment-runner__step.assessment-runner__step--selected {
        background: var(--secondary-soft);
        color: var(--on-secondary-soft);
        font-weight: 700;
      }
      .assessment-runner__step.assessment-runner__step--answered
        mat-icon {
        color: var(--accent);
      }
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
      .assessment-runner__save-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: var(--accent);
        border-top: 1px solid var(--line);
        padding: 20px 4px 0;
        margin-top: 20px;
      }
      .assessment-runner__save-status mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
      }
      .assessment-runner__tip {
        font-size: 11px;
        padding: 18px 4px 0;
      }
      .assessment-runner__save-error {
        font-size: 12px;
        margin-top: 12px;
        color: var(--mat-sys-error);
      }
      @media (max-width: 850px) {
        .assessment-runner__outline {
          padding: 18px;
        }
        .assessment-runner__navigator {
          display: flex;
          overflow-x: auto;
        }
        .assessment-runner__step {
          flex-shrink: 0;
        }
        .assessment-runner__tip {
          display: none;
        }
        .assessment-runner__save-status {
          margin-top: 10px;
          padding-top: 12px;
        }
      }
    `,
  ],
})
export class RunnerProgressComponent {
  readonly info = subjectInfo;

  readonly questions = input.required<AttemptQuestionsDto>();
  readonly answers = input.required<string[]>();
  readonly answered = input.required<number>();
  readonly current = input.required<number>();
  readonly review = input(false);
  readonly pending = input(0);
  readonly saveError = input('');
  readonly submitting = input(false);
  readonly go = output<number>();
  readonly showReview = output<void>();
  readonly save = output<void>();
}
