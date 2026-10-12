import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { LearnerAttemptDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { subjectInfo } from '../../models/assessment.models';
import { JourneyNavigation } from '../journey/journey-navigation';
import { RunnerViewModel } from './runner.view-model';
import { RunnerProgressComponent } from '../../components/runner/runner-progress.component';
import { RunnerQuestionComponent } from '../../components/runner/runner-question.component';
import { RunnerReviewComponent } from '../../components/runner/runner-review.component';

@Component({
  selector: 'ngx-assessment-runner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RunnerViewModel],
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, RunnerProgressComponent, RunnerQuestionComponent, RunnerReviewComponent],
  template: `
<div class="assessment-runner__runner-heading">
  <div>
    <span class="assessment-ui__eyebrow">{{ info(attempt()).name }} · LEVEL
      {{ attempt().level }}</span>
    <h2>{{ attempt().testName }}</h2>
  </div>
  <button
    mat-stroked-button
    [disabled]="pending() > 0 || !!saveError() || submitting()"
    (click)="exit.emit()">
    <mat-icon>pause</mat-icon>Save & exit
  </button>
</div>
@if (loading()) {
  <mat-progress-bar
    mode="indeterminate"
    aria-label="Loading questions"
  />
}
@if (storageWarning()) {
  <p role="status">{{ storageWarning() }}</p>
}
@if (error()) {
  <div class="assessment-runner__error" role="alert">
    <p>{{ error() }}</p>
    @if (!questions()) {
      <button mat-button (click)="load()">Try again</button>
    }
  </div>
}
@if (questions(); as data) {
  <div class="assessment-runner__runner-layout">
    <ngx-runner-progress [questions]="data" [answers]="answers()" [answered]="answered()"
      [current]="current()" [review]="review()" [pending]="pending()" [saveError]="saveError()"
      [submitting]="submitting()" (go)="go($event)" (showReview)="reviewChange.emit({ review: true })" (save)="save()" />
    <div class="assessment-runner__workspace" [attr.aria-busy]="submitting()">
      @if (review()) {
        <ngx-runner-review [questions]="data" [answers]="answers()" [answered]="answered()"
          [pending]="pending()" [saveError]="saveError()" [submitting]="submitting()"
          [canSubmit]="vm.canSubmit()" (go)="go($event)" (submit)="submit()" />
      } @else if (question(); as q) {
        <ngx-runner-question [question]="q" [current]="current()" [answers]="answers()"
          [submitting]="submitting()" [control]="control" (go)="go($event)" (showReview)="reviewChange.emit({ review: true })" />
      }
    </div>
  </div>
}
  `,
  styles: [`@use '../../styles/shared' as ui; @include ui.foundation(('eyebrow',));
.assessment-runner__runner-heading {
    display: flex; justify-content: space-between; gap: 20px; align-items: center; margin-bottom: 30px;
  }
.assessment-runner__runner-heading h2 { font-size: 27px; }
.assessment-runner__runner-heading button { white-space: nowrap; }
.assessment-runner__runner-layout {
    display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 25px; align-items: start;
  }
.assessment-runner__workspace {
    min-width: 0; padding: 35px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 20px; min-height: 430px;
  }
.assessment-runner__error {
    background: var(--error-soft); padding: 16px; border-radius: 12px; font-size: 13px;
    color: var(--on-error-soft); margin: 20px 0;
  }
.assessment-runner__error p { color: inherit; }
@media (max-width: 850px) {
.assessment-runner__runner-layout { grid-template-columns: minmax(0, 1fr); }
.assessment-runner__workspace { min-width: 0; padding: 24px; }
}
@media (max-width: 600px) {
.assessment-runner__runner-heading { align-items: flex-start; flex-direction: column; }
.assessment-runner__runner-heading h2 { font-size: 23px; }
}
  `],
})
export class RunnerComponent implements OnChanges {
  readonly vm = inject(RunnerViewModel);
  readonly attempt = input.required<LearnerAttemptDto>();
  readonly reviewMode = input(false);
  readonly questionIndex = input<number | null>(null);
  readonly reviewChange = output<{ review: boolean; question?: number }>();
  readonly finished = output<string>();
  readonly exit = output<void>();
  readonly info = subjectInfo;
  readonly questions = this.vm.questions;
  readonly loading = this.vm.loading;
  readonly error = this.vm.error;
  readonly saveError = this.vm.saveError;
  readonly storageWarning = this.vm.storageWarning;
  readonly answers = this.vm.answers;
  readonly current = this.vm.current;
  readonly review = this.vm.review;
  readonly pending = this.vm.pending;
  readonly submitting = this.vm.submitting;
  readonly control = this.vm.control;
  readonly answered = this.vm.answered;
  readonly question = this.vm.question;
  constructor() {
    const navigation = inject(JourneyNavigation);
    const destroy = inject(DestroyRef);
    const canLeave = () => this.vm.canLeave();
    navigation.runnerCanLeave = canLeave;
    destroy.onDestroy(() => { if (navigation.runnerCanLeave === canLeave) navigation.runnerCanLeave = null; });
    this.vm.finished$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(id => this.finished.emit(id));
  }
  ngOnChanges() { this.load(); }
  load() { this.vm.load(this.attempt(), this.reviewMode(), this.questionIndex()); }
  go(index: number) {
    if (this.reviewMode()) this.reviewChange.emit({ review: false, question: index });
    else this.vm.go(index);
  }
  save() { this.vm.save(); }
  submit() { this.vm.submit(); }
}
