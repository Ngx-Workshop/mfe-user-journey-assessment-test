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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'ngx-runner-question',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatRadioModule,
  ],
  template: `
    @let q = question();

    <span class="assessment-ui__eyebrow"
      >QUESTION {{ current() + 1 }} OF {{ answers().length }}</span
    >
    <h3 class="assessment-runner__question" aria-live="polite">
      {{ q.question }}
    </h3>
    <p class="assessment-runner__intro" id="choice-hint">
      Choose the one answer that fits best.
    </p>
    <mat-radio-group
      class="assessment-runner__choices"
      [formControl]="control()"
      aria-label="Answer choices"
      aria-describedby="choice-hint"
    >
      @for (choice of q.choices; track choice.value) {
        <mat-radio-button
          class="assessment-runner__choice"
          [value]="choice.value"
          [class.assessment-runner__choice--chosen]="
            control().value === choice.value
          "
          ><span class="assessment-runner__choice-letter">{{
            letters[$index] || $index + 1
          }}</span
          ><span>{{ choice.value }}</span></mat-radio-button
        >
      }
    </mat-radio-group>
    <div class="assessment-runner__workspace-footer">
      <button
        mat-button
        (click)="go.emit(current() - 1)"
        [disabled]="current() === 0 || submitting()"
      >
        <mat-icon>arrow_back</mat-icon>Previous
      </button>
      @if (current() === answers().length - 1) {
        <button
          mat-flat-button
          (click)="showReview.emit()"
          [disabled]="submitting()"
        >
          Review answers<mat-icon>arrow_forward</mat-icon>
        </button>
      } @else {
        <button
          mat-flat-button
          (click)="go.emit(current() + 1)"
          [disabled]="submitting()"
        >
          Next question<mat-icon>arrow_forward</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [
    `
      @use '../../styles/shared' as ui;
      @include ui.foundation(('eyebrow'));
      .assessment-runner__question {
        font-size: 25px;
        line-height: 1.45;
        margin: 25px 0 12px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .assessment-runner__intro {
        font-size: 13px;
        margin: 12px 0 28px;
      }
      .assessment-runner__choices {
        display: grid;
        gap: 12px;
      }
      .assessment-runner__choice {
        display: block;
        border: 1px solid var(--line);
        border-radius: 13px;
        padding: 11px 14px;
        font-size: 14px;
      }
      .assessment-runner__choice.assessment-runner__choice--chosen {
        background: var(--soft);
        border-color: var(--accent);
      }
      .assessment-runner__choice-letter {
        display: inline-flex;
        padding-right: 14px;
        font-size: 12px;
        color: var(--muted);
        font-weight: 700;
      }
      .assessment-runner__choice span:last-child {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
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
      @media (max-width: 600px) {
        .assessment-runner__question {
          font-size: 20px;
        }
        .assessment-runner__choice {
          padding: 8px;
        }
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
export class RunnerQuestionComponent {
  readonly info = subjectInfo;

  readonly question =
    input.required<AttemptQuestionsDto['testQuestions'][number]>();
  readonly current = input.required<number>();
  readonly answers = input.required<string[]>();
  readonly submitting = input(false);
  readonly control = input.required<FormControl<string>>();
  readonly go = output<number>();
  readonly showReview = output<void>();
  readonly letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
}
