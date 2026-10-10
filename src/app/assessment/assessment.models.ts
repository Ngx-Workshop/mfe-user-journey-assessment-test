import type {
  LearnerSubjectDto,
  LearnerTestDto,
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

export type AssessmentView = 'overview' | 'subject' | 'history' | 'attempt' | 'result';
export interface TestSelection { subject: Subject; test: LearnerTestDto; }
