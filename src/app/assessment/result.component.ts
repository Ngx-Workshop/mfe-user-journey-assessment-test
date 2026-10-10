import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from './assessment.models';
import { ResultViewModel } from './result.view-model';
import { ResultSummaryComponent } from './result-summary.component';
import { ResultFeedbackComponent } from './result-feedback.component';

@Component({
  selector: 'ngx-assessment-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResultViewModel],
  imports: [MatButtonModule, MatProgressBarModule, ResultSummaryComponent, ResultFeedbackComponent],
  template: `
@if (loading()) {
  <mat-progress-bar
    mode="indeterminate"
    aria-label="Loading result"
  />
}
@if (error()) {
  <div class="assessment-ui__empty" role="alert">
    <h3>We couldn’t load this result</h3>
    <p>{{ error() }}</p>
    <button mat-button (click)="load()">Try again</button><button mat-button (click)="back.emit()">Back to history</button>
  </div>
}
@if (data(); as result) {
  <ngx-result-summary [data]="result" [percentage]="percentage()" (back)="back.emit()" (nextSubject)="nextSubject.emit($event)" />
  <ngx-result-feedback [data]="result" />
}
  `,
  styles: [`@use './shared' as ui; @include ui.foundation(('empty',));`],
})
export class ResultComponent implements OnChanges {
  readonly vm = inject(ResultViewModel);
  readonly id = input.required<string>();
  readonly back = output<void>();
  readonly nextSubject = output<Subject>();
  readonly data = this.vm.data;
  readonly loading = this.vm.loading;
  readonly error = this.vm.error;
  readonly percentage = this.vm.percentage;
  ngOnChanges() { this.load(); }
  load() { this.vm.load(this.id()); }
}
