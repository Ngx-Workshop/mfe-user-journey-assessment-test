import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AttemptQuestionsDto,
  LearnerAttemptDto,
  LearnerResultDto,
  LearnerSubjectDto,
  StartTestDto,
  UserAssessmentTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

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
