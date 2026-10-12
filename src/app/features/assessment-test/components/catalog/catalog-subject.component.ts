import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { LearnerSubjectDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  subjectInfo,
  TestSelection,
} from '../../models/assessment.models';

@Component({
  selector: 'ngx-catalog-subject',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @let subject = selected();

    <div class="assessment-catalog__subject-intro">
      <span
        class="assessment-catalog__subject-mark"
        [style.--subject-color]="info(subject).color"
        >{{ info(subject).mark }}</span
      >
      <div>
        <span class="assessment-ui__eyebrow"
          >EXPLORE YOUR NEXT LEVEL</span
        >
        <h2>{{ info(subject).name }} assessments</h2>
        <p>{{ info(subject).description }}</p>
      </div>
    </div>
    <div class="assessment-catalog__subject-summary">
      <span
        ><strong>{{ subject.completedCount }}</strong> completed</span
      ><span
        ><strong>{{
          subject.highestPassedLevel
            ? 'Level ' + subject.highestPassedLevel
            : '—'
        }}</strong>
        highest passed</span
      ><span
        ><strong>{{
          subject.accuracy === null ? '—' : subject.accuracy + '%'
        }}</strong>
        accuracy</span
      >
    </div>
    <p class="assessment-ui__explanation">
      Choose any available test, or pick up where you left off.
      Completing one test unlocks the next level. Other tests at
      unlocked levels remain available.
    </p>
    <div class="assessment-catalog__test-list">
      @for (test of subject.tests; track test.id) {
        <article
          class="assessment-catalog__test-row"
          [class.assessment-catalog__test-row--locked]="
            test.status === 'locked'
          "
        >
          <div class="assessment-catalog__level">
            {{ test.level.toString().padStart(2, '0') }}
          </div>
          <div class="assessment-ui__row-title">
            <span class="assessment-ui__eyebrow"
              >LEVEL {{ test.level }}</span
            >
            <h3>{{ test.name }}</h3>
            <p>
              {{ test.questionCount }}
              {{
                test.questionCount === 1 ? 'question' : 'questions'
              }}
              · Untimed · One answer per question
            </p>
            @if (test.status === 'locked') {
              <small
                >Complete one test at each earlier level first, or
                resume your active test. Missing levels must be
                published before you can continue.</small
              >
            }
          </div>
          <div class="assessment-catalog__test-actions">
            <span
              class="assessment-ui__badge"
              [class.assessment-ui__badge--success]="
                test.status === 'available'
              "
              [class.assessment-ui__badge--active]="
                test.status === 'in-progress'
              "
              >{{ labels[test.status] }}</span
            >
            @if (test.status !== 'locked') {
              <button
                mat-flat-button
                [disabled]="busy()"
                (click)="
                  openTest.emit({ subject: subject.subject, test })
                "
              >
                {{
                  test.status === 'completed'
                    ? 'View result'
                    : test.status === 'in-progress'
                      ? 'Resume test'
                      : 'Start test'
                }}<mat-icon>arrow_forward</mat-icon>
              </button>
            } @else {
              <mat-icon aria-label="Locked assessment"
                >lock_outline</mat-icon
              >
            }
          </div>
        </article>
      } @empty {
        <div class="assessment-ui__empty">
          <mat-icon>auto_stories</mat-icon>
          <h3>More learning is on the way</h3>
          <p>
            No assessments have been published for this subject yet.
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @use '../../styles/shared' as ui;
      @include ui.foundation(
        ('badge', 'empty', 'explanation', 'eyebrow', 'row-title')
      );
      .assessment-catalog__subject-mark {
        display: grid;
        place-items: center;
        width: 52px;
        height: 58px;
        color: var(--subject-color);
        background: color-mix(
          in srgb,
          var(--subject-color) 9%,
          var(--panel)
        );
        font-size: 32px;
        font-weight: 800;
        border-radius: 16px;
      }
      .assessment-catalog__subject-intro {
        display: flex;
        gap: 22px;
        align-items: center;
      }
      .assessment-catalog__subject-intro p {
        font-size: 14px;
        margin-top: 10px;
      }
      .assessment-catalog__subject-summary {
        display: flex;
        gap: 35px;
        padding: 22px 0;
        margin-top: 25px;
        border-bottom: 1px solid var(--line);
        font-size: 12px;
        color: var(--muted);
      }
      .assessment-catalog__subject-summary strong {
        color: var(--accent);
        display: block;
        font-size: 22px;
        margin-bottom: 6px;
      }
      .assessment-catalog__test-list {
        display: grid;
        gap: 14px;
      }
      .assessment-catalog__test-row {
        display: flex;
        gap: 22px;
        align-items: center;
        padding: 25px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--panel);
      }
      .assessment-catalog__level {
        font-size: 28px;
        color: var(--accent);
        font-weight: 600;
        width: 45px;
        flex-shrink: 0;
      }
      .assessment-catalog__test-row h3 {
        font-size: 18px;
      }
      .assessment-catalog__test-row p,
      .assessment-catalog__test-row small {
        font-size: 12px;
        color: var(--muted);
      }
      .assessment-catalog__test-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 14px;
      }
      .assessment-catalog__test-actions button {
        font-size: 12px;
      }
      .assessment-catalog__test-row--locked {
        background: var(--soft);
      }
      .assessment-catalog__test-row--locked
        .assessment-catalog__level {
        color: var(--muted);
      }
      @media (max-width: 720px) {
        .assessment-catalog__test-row {
          flex-wrap: wrap;
          padding: 20px;
          gap: 14px;
        }
        .assessment-catalog__test-actions {
          width: 100%;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .assessment-catalog__subject-summary {
          gap: 20px;
        }
        .assessment-catalog__subject-intro {
          align-items: flex-start;
        }
        .assessment-catalog__subject-intro
          .assessment-catalog__subject-mark {
          flex-shrink: 0;
        }
      }
    `,
  ],
})
export class CatalogSubjectComponent {
  readonly info = subjectInfo;

  readonly selected = input.required<LearnerSubjectDto>();
  readonly busy = input(false);
  readonly openTest = output<TestSelection>();
  readonly labels = {
    available: 'Ready to start',
    'in-progress': 'In progress',
    completed: 'Completed',
    locked: 'Locked',
  };
}
