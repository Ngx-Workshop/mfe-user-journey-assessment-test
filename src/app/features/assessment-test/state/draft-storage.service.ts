import { Injectable } from '@angular/core';
import type {
  AttemptQuestionsDto,
  LearnerAttemptDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

export const recoveryWarning = 'Browser recovery is unavailable. Wait for “All changes saved” before leaving.';
@Injectable({ providedIn: 'root' })
export class DraftStorage {
  restore(attempt: LearnerAttemptDto, questions: AttemptQuestionsDto) {
    let answers = attempt.draftAnswers;
    let warning = '';
    try {
      const local: unknown = JSON.parse(sessionStorage.getItem(this.key(attempt._id)) ?? 'null');
      if (local && typeof local === 'object' && 'updated' in local && 'answers' in local &&
        typeof local.updated === 'number' && local.updated > Date.parse(attempt.lastUpdated) &&
        Array.isArray(local.answers) && local.answers.length === questions.testQuestions.length &&
        local.answers.every((answer: unknown, index: number) => typeof answer === 'string' &&
          (answer === '' || questions.testQuestions[index].choices.some(choice => choice.value === answer)))) {
        answers = local.answers as string[];
      }
    } catch { warning = recoveryWarning; }
    return { answers: questions.testQuestions.map((_, index) => answers[index] ?? ''), warning,
      recovered: answers !== attempt.draftAnswers };
  }
  remember(id: string, answers: string[]) {
    try {
      sessionStorage.setItem(this.key(id), JSON.stringify({ updated: Date.now(), answers }));
      return '';
    } catch { return recoveryWarning; }
  }
  clear(id: string) {
    try { sessionStorage.removeItem(this.key(id)); } catch { /* Recovery is optional. */ }
  }
  private key(id: string) { return `assessment-draft:${id}`; }
}
