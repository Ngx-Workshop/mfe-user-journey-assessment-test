import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type {
  LearnerAttemptDto,
  LearnerSubjectDto,
  LearnerTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import { Subject, subjectInfo } from './assessment-api.service';

@Component({
  selector: 'ngx-learner-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, DatePipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  readonly subjects = input.required<LearnerSubjectDto[]>();
  readonly attempts = input.required<LearnerAttemptDto[]>();
  readonly selected = input<LearnerSubjectDto | null>(null);
  readonly history = input(false);
  readonly busy = input(false);
  readonly openSubject = output<Subject>();
  readonly openTest = output<{
    subject: Subject;
    test: LearnerTestDto;
  }>();
  readonly openAttempt = output<LearnerAttemptDto>();
  readonly info = subjectInfo;
  readonly isInProgress = (test: LearnerTestDto) =>
    test.status === 'in-progress';
  readonly isAvailable = (test: LearnerTestDto) =>
    test.status === 'available';
  readonly labels = {
    available: 'Ready to start',
    'in-progress': 'In progress',
    completed: 'Completed',
    locked: 'Locked',
  };
  completed() {
    return this.attempts().filter((a) => a.completed);
  }
  recent() {
    return this.attempts().slice(0, 3);
  }
  percent(attempt: LearnerAttemptDto) {
    return attempt.questionCount
      ? Math.round((attempt.score / attempt.questionCount) * 100)
      : null;
  }
}
