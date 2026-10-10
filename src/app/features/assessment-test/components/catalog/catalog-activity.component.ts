import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { LearnerAttemptDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { subjectInfo } from '../../models/assessment.models';

@Component({
  selector: 'ngx-catalog-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  template: `
<div class="assessment-catalog__lower-grid">
    <article class="assessment-catalog__how-it-works">
      <span class="assessment-ui__eyebrow">A LITTLE CLARITY BEFORE YOU BEGIN</span>
      <h3>Learn where you stand.</h3>
      <ol>
        <li>
          <span>01</span>
          <div>
            <strong>Choose a subject</strong>
            <p>Start with the next available assessment.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <strong>Take your time</strong>
            <p>Answer at your pace. Save and return anytime.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <strong>Turn results into progress</strong>
            <p>Review feedback and discover what to practise.</p>
          </div>
        </li>
      </ol>
    </article>
    <article class="assessment-catalog__recent">
      <div class="assessment-ui__section-heading">
        <h3>Recent activity</h3>
        <mat-icon>history</mat-icon>
      </div>
      @for (attempt of recent(); track attempt._id) {
        <button
          class="assessment-catalog__recent-row"
          (click)="openAttempt.emit(attempt)">
          <span
            class="assessment-ui__mini-mark"
            [style.color]="info[attempt.subject].color">{{ info[attempt.subject].mark }}</span><span class="assessment-ui__row-title"><strong>{{ attempt.testName }}</strong><span>{{ attempt.lastUpdated | date: 'mediumDate' }} ·
              {{
                attempt.completed
                  ? attempt.passed
                    ? 'Passed'
                    : 'Needs practice'
                  : 'In progress'
              }}</span></span><mat-icon>chevron_right</mat-icon>
        </button>
      } @empty {
        <div class="assessment-catalog__recent-empty">
          <mat-icon>school</mat-icon>
          <p>A fresh start, full of possibilities.</p>
          <span>Your recent assessments will appear here.</span>
        </div>
      }
    </article>
  </div>
  `,
  styles: [`
    @use '../../styles/shared' as ui;
    @include ui.foundation(('eyebrow', 'mini-mark', 'row-title', 'section-heading',));
.assessment-catalog__lower-grid { margin-top: 35px; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
.assessment-catalog__how-it-works, .assessment-catalog__recent { border-radius: 20px; padding: 27px; }
.assessment-catalog__how-it-works { background: var(--soft); }
.assessment-catalog__how-it-works h3 { margin-top: 15px; }
ol { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 20px; }
li { display: flex; gap: 15px; }
li > span { font-size: 11px; color: var(--accent); padding-top: 4px; }
li strong { font-size: 13px; }
li p { font-size: 12px; margin-top: 5px; }
.assessment-catalog__recent { background: var(--panel); border: 1px solid var(--line); }
.assessment-catalog__recent .assessment-ui__section-heading { margin-bottom: 15px; }
.assessment-catalog__recent-row {
    display: flex; gap: 12px; align-items: center; border: 0; border-top: 1px solid var(--line);
    padding: 17px 0; width: 100%; background: transparent; color: inherit;
  }
.assessment-catalog__recent-row:hover { color: var(--accent); }
.assessment-catalog__recent-empty { padding: 30px 0; text-align: center; color: var(--muted); }
.assessment-catalog__recent-empty mat-icon { height: 38px; width: 38px; font-size: 38px; color: var(--muted); }
.assessment-catalog__recent-empty p { margin: 15px 0 8px; font-size: 14px; }
.assessment-catalog__recent-empty span { font-size: 12px; }
@media (max-width: 720px) {
.assessment-catalog__lower-grid { grid-template-columns: 1fr; }
.assessment-ui__section-heading { align-items: flex-start; }
}
  `],
})
export class CatalogActivityComponent {
  readonly info = subjectInfo;

  readonly attempts = input.required<LearnerAttemptDto[]>();
  readonly recent = computed(() => this.attempts().slice(0, 3));
  readonly openAttempt = output<LearnerAttemptDto>();
}
