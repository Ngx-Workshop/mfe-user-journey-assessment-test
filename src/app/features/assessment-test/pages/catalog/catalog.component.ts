import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type {
  LearnerAttemptDto,
  LearnerSubjectDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  Subject,
  TestSelection,
} from '../../models/assessment.models';
import { CatalogOverviewComponent } from '../../components/catalog/catalog-overview.component';
import { CatalogActivityComponent } from '../../components/catalog/catalog-activity.component';
import { CatalogSubjectComponent } from '../../components/catalog/catalog-subject.component';
import { CatalogHistoryComponent } from '../../components/catalog/catalog-history.component';

@Component({
  selector: 'ngx-learner-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CatalogOverviewComponent,
    CatalogActivityComponent,
    CatalogSubjectComponent,
    CatalogHistoryComponent,
  ],
  template: `
    @if (history()) {
      <ngx-catalog-history
        [subjects]="subjects()"
        [attempts]="attempts()"
        (openAttempt)="openAttempt.emit($event)"
      />
    } @else if (selected(); as subject) {
      <ngx-catalog-subject
        [selected]="subject"
        [busy]="busy()"
        (openTest)="openTest.emit($event)"
      />
    } @else {
      <ngx-catalog-overview
        [subjects]="subjects()"
        (openSubject)="openSubject.emit($event)"
      />
      <ngx-catalog-activity
        [attempts]="attempts()"
        (openAttempt)="openAttempt.emit($event)"
      />
    }
  `,
  styles: [':host { display: block; min-width: 0; }'],
})
export class CatalogComponent {
  readonly subjects = input.required<LearnerSubjectDto[]>();
  readonly attempts = input.required<LearnerAttemptDto[]>();
  readonly selected = input<LearnerSubjectDto | null>(null);
  readonly history = input(false);
  readonly busy = input(false);
  readonly openSubject = output<Subject>();
  readonly openTest = output<TestSelection>();
  readonly openAttempt = output<LearnerAttemptDto>();
}
