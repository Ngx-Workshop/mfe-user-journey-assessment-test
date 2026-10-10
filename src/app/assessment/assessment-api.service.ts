import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AttemptQuestionsDto,
  LearnerAttemptDto,
  LearnerResultDto,
  LearnerSubjectDto,
  StartTestDto,
  UserAssessmentTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

export type Subject = LearnerSubjectDto['subject'];
export const subjectInfo: Record<
  Subject,
  { name: string; mark: string; description: string; color: string }
> = {
  ANGULAR: {
    name: 'Angular',
    mark: 'A',
    description:
      'Components, templates, and the building blocks of modern applications.',
    color: 'var(--mat-sys-primary)',
  },
  NESTJS: {
    name: 'NestJS',
    mark: 'N',
    description:
      'APIs, dependency injection, and scalable server-side architecture.',
    color: 'var(--mat-sys-secondary)',
  },
  RXJS: {
    name: 'RxJS',
    mark: 'Rx',
    description:
      'Streams, operators, and thinking in reactive patterns.',
    color: 'var(--mat-sys-tertiary)',
  },
};
export function apiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401)
      return 'Your session has expired. Sign in again to continue.';
    if (error.status === 403)
      return 'Your account does not have access to this assessment.';
    if (error.status === 0)
      return 'We couldn’t reach the assessment service. Check your connection and try again.';
    const message: unknown = error.error?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('. ');
  }
  return 'Something went wrong. Please try again.';
}
@Injectable({ providedIn: 'root' })
export class AssessmentApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/assessment-test';
  catalog() {
    return this.http.get<LearnerSubjectDto[]>(
      `${this.base}/learner/catalog`
    );
  }
  history() {
    return this.http.get<LearnerAttemptDto[]>(
      `${this.base}/learner/history`
    );
  }
  start(payload: StartTestDto) {
    return this.http.post<UserAssessmentTestDto>(
      `${this.base}/start-test`,
      payload
    );
  }
  questions(id: string) {
    return this.http.get<AttemptQuestionsDto>(
      `${this.base}/attempts/${id}/questions`
    );
  }
  save(id: string, answers: string[]) {
    return this.http.patch<LearnerAttemptDto>(
      `${this.base}/attempts/${id}/answers`,
      { answers }
    );
  }
  submit(testId: string, answers: string[]) {
    return this.http.post<UserAssessmentTestDto>(
      `${this.base}/submit-test`,
      { testId, answers }
    );
  }
  result(id: string) {
    return this.http.get<LearnerResultDto>(
      `${this.base}/attempts/${id}/result`
    );
  }
}
