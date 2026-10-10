import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type {
  LearnerSubjectDto,
  LearnerTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import { Subject, subjectInfo } from './assessment.models';

@Component({
  selector: 'ngx-catalog-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
<div class="assessment-ui__section-heading">
    <div>
      <span class="assessment-ui__eyebrow">CHOOSE YOUR FOCUS</span>
      <h2>What will you explore today?</h2>
      <p>
        Find your starting point. Build confidence, one level at a
        time.
      </p>
    </div>
    <span class="assessment-catalog__count">{{ subjects().length }} subjects</span>
  </div>
  <div class="assessment-catalog__subject-grid">
    @for (subject of subjects(); track subject.subject) {
      <button
        class="assessment-catalog__subject-card"
        [style.--subject-color]="info[subject.subject].color"
        (click)="openSubject.emit(subject.subject)">
        <div class="assessment-catalog__card-top">
          <span class="assessment-catalog__subject-mark">{{
            info[subject.subject].mark
          }}</span><span
            class="assessment-ui__badge"
            [class.assessment-ui__badge--active]="subject.tests.some(isInProgress)">{{
              subject.tests.some(isInProgress)
                ? 'Continue learning'
                : subject.tests.some(isAvailable)
                  ? 'Ready to explore'
                  : subject.tests.length
                    ? 'Up to date'
                    : 'Coming soon'
            }}</span>
        </div>
        <h3>{{ info[subject.subject].name }}</h3>
        <p>{{ info[subject.subject].description }}</p>
        <div class="assessment-catalog__card-progress">
          <div>
            <span>{{ subject.completedCount }} of
              {{ subject.tests.length }} completed</span><strong>{{
              subject.highestPassedLevel
                ? 'Level ' + subject.highestPassedLevel + ' passed'
                : 'Find your level'
            }}</strong>
          </div>
          <div class="assessment-ui__progress-track">
            <span
              [style.width.%]="
                subject.tests.length
                  ? (subject.completedCount / subject.tests.length) *
                    100
                  : 0
              "></span>
          </div>
        </div>
        <div class="assessment-catalog__card-footer">
          <span>Explore assessments</span><mat-icon>arrow_forward</mat-icon>
        </div>
      </button>
    }
  </div>
  `,
  styles: [`
    @use './shared' as ui;
    @include ui.foundation(('badge', 'eyebrow', 'progress-track', 'section-heading',));
.assessment-catalog__count { font-size: 12px; color: var(--muted); white-space: nowrap; }
.assessment-catalog__subject-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.assessment-catalog__subject-card {
    border: 1px solid var(--line); background: var(--panel); border-radius: 20px; padding: 25px;
    text-align: left; color: inherit; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
.assessment-catalog__subject-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 26px color-mix(in srgb, var(--mat-sys-shadow) 12%, transparent);
    border-color: var(--accent);
  }
.assessment-catalog__card-top {
    display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 25px;
  }
.assessment-catalog__subject-mark {
    display: grid; place-items: center; width: 52px; height: 58px; color: var(--subject-color);
    background: color-mix(in srgb, var(--subject-color) 9%, var(--panel)); font-size: 32px;
    font-weight: 800; border-radius: 16px;
  }
.assessment-catalog__subject-card h3 { font-size: 26px; margin-bottom: 12px; }
.assessment-catalog__subject-card p { font-size: 13px; min-height: 64px; }
.assessment-catalog__card-progress { margin: 28px 0 22px; }
.assessment-catalog__card-progress > div:first-child {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; font-size: 11px;
    color: var(--muted);
  }
.assessment-catalog__card-progress strong { font-size: 12px; color: var(--accent); }
.assessment-catalog__card-footer {
    border-top: 1px solid var(--line); padding-top: 18px; display: flex; justify-content: space-between;
    align-items: center; font-size: 12px; font-weight: 700;
  }
@media (max-width: 1000px) {
.assessment-catalog__subject-grid { gap: 12px; }
.assessment-catalog__subject-card { padding: 20px; }
.assessment-catalog__card-top { flex-wrap: wrap; }
.assessment-catalog__subject-card p { min-height: 85px; }
}
@media (max-width: 720px) {
.assessment-catalog__subject-grid { grid-template-columns: 1fr; }
.assessment-catalog__subject-card p { min-height: 0; }
.assessment-ui__section-heading { align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
.assessment-catalog__subject-card { transition: none; }
.assessment-catalog__subject-card:hover { transform: none; }
}
  `],
})
export class CatalogOverviewComponent {
  readonly info = subjectInfo;

  readonly subjects = input.required<LearnerSubjectDto[]>();
  readonly openSubject = output<Subject>();
  readonly isInProgress = (test: LearnerTestDto) => test.status === 'in-progress';
  readonly isAvailable = (test: LearnerTestDto) => test.status === 'available';
}
