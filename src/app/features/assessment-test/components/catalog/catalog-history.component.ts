import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type {
  LearnerAttemptDto,
  LearnerSubjectDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import { subjectInfo } from '../../models/assessment.models';

@Component({
  selector: 'ngx-catalog-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  template: `
<div class="assessment-ui__section-heading">
    <div>
      <span class="assessment-ui__eyebrow">YOUR LEARNING RECORD</span>
      <h2>Every attempt. More insight.</h2>
      <p>See what you’ve learned and where to focus next.</p>
    </div>
    <span class="assessment-catalog__count">{{ completed().length }} completed</span>
  </div>
  <div class="assessment-catalog__proficiency-grid">
    @for (subject of subjects(); track subject.subject) {
      <article class="assessment-catalog__proficiency">
        <span class="assessment-catalog__subject-label"><span
            class="assessment-ui__mini-mark"
            [style.color]="info(subject).color">{{ info(subject).mark }}</span>{{ info(subject).name }}</span>
        <h3>
          {{
            subject.highestPassedLevel
              ? 'Level ' + subject.highestPassedLevel + ' passed'
              : 'No passed levels yet'
          }}
        </h3>
        <p>
          {{ subject.completedCount }} completed ·
          {{ subject.passedCount }} passed
        </p>
        <div class="assessment-catalog__accuracy">
          <span>Overall accuracy</span><strong>{{
            subject.accuracy === null ? '—' : subject.accuracy + '%'
          }}</strong>
        </div>
      </article>
    }
  </div>
  <p class="assessment-ui__explanation">
    Proficiency reflects your highest passed level. Accuracy includes
    all completed tests. A test is passed when every answer is
    correct.
  </p>
  <div class="assessment-catalog__history-list">
    @for (attempt of completed(); track attempt._id) {
      <button class="assessment-catalog__history-row" (click)="openAttempt.emit(attempt)">
        <span
          class="assessment-ui__mini-mark"
          [style.color]="info(attempt).color">{{ info(attempt).mark }}</span><span class="assessment-ui__row-title"><strong>{{ attempt.testName }}</strong><span>{{ info(attempt).name }} ·
            {{
              attempt.level
                ? 'Level ' + attempt.level
                : 'Level unavailable'
            }}
            · {{ attempt.lastUpdated | date: 'mediumDate' }}</span></span><span class="assessment-catalog__score">{{
          percent(attempt) === null ? '—' : percent(attempt) + '%'
        }}</span><span class="assessment-ui__badge" [class.assessment-ui__badge--success]="attempt.passed">{{
          attempt.passed ? 'Passed' : 'Needs practice'
        }}</span><mat-icon>arrow_forward</mat-icon>
      </button>
    } @empty {
      <div class="assessment-ui__empty">
        <mat-icon>history</mat-icon>
        <h3>Your story starts with one test</h3>
        <p>
          Completed assessments and your proficiency will appear here.
        </p>
      </div>
    }
  </div>
  `,
  styles: [`
    @use '../../styles/shared' as ui;
    @include ui.foundation(('badge', 'empty', 'explanation', 'eyebrow', 'mini-mark', 'row-title', 'section-heading',));
.assessment-catalog__count { font-size: 12px; color: var(--muted); white-space: nowrap; }
.assessment-catalog__proficiency-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.assessment-catalog__proficiency {
    padding: 22px; border: 1px solid var(--line); border-radius: 18px; background: var(--panel);
  }
.assessment-catalog__subject-label { display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 650; }
.assessment-catalog__proficiency h3 { font-size: 17px; margin: 23px 0 10px; }
.assessment-catalog__proficiency p { font-size: 12px; }
.assessment-catalog__accuracy {
    display: flex; justify-content: space-between; margin-top: 25px; padding-top: 16px;
    border-top: 1px solid var(--line); font-size: 12px; color: var(--muted);
  }
.assessment-catalog__accuracy strong { color: var(--accent); }
.assessment-catalog__history-list { display: grid; gap: 10px; }
.assessment-catalog__history-row {
    display: flex; align-items: center; gap: 18px; background: var(--panel);
    border: 1px solid var(--line); padding: 21px; border-radius: 14px; color: inherit;
  }
.assessment-catalog__history-row:hover { border-color: var(--accent); }
.assessment-catalog__score { font-size: 20px; font-weight: 700; min-width: 50px; }
@media (max-width: 1000px) {
.assessment-catalog__proficiency-grid { gap: 12px; }
}
@media (max-width: 720px) {
.assessment-catalog__proficiency-grid { grid-template-columns: 1fr; }
.assessment-catalog__history-row { flex-wrap: wrap; gap: 12px; }
.assessment-catalog__history-row .assessment-ui__row-title { flex-basis: calc(100% - 55px); }
.assessment-catalog__history-row .assessment-catalog__score { margin-left: 50px; }
.assessment-ui__section-heading { align-items: flex-start; }
}
  `],
})
export class CatalogHistoryComponent {
  readonly info = subjectInfo;

  readonly subjects = input.required<LearnerSubjectDto[]>();
  readonly attempts = input.required<LearnerAttemptDto[]>();
  readonly completed = computed(() => this.attempts().filter(attempt => attempt.completed));
  readonly openAttempt = output<LearnerAttemptDto>();
  percent(attempt: LearnerAttemptDto) {
    return attempt.questionCount ? Math.round(100 * attempt.score / attempt.questionCount) : null;
  }
}
