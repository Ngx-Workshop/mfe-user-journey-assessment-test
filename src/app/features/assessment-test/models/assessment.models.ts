import type {
  LearnerSubjectDto,
  LearnerTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';

export type Subject = LearnerSubjectDto['subject'];
const legacySubjectInfo: Partial<
  Record<
    string,
    { name: string; mark: string; description: string; color: string }
  >
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

/** Titles are display snapshots; the string subject ID remains the identity. */
export function subjectInfo(subject: {
  subject: string;
  sectionTitle?: string;
}) {
  const legacy = Object.hasOwn(legacySubjectInfo, subject.subject)
    ? legacySubjectInfo[subject.subject]
    : undefined;
  const title = subject.sectionTitle?.trim();
  const name =
    title && title !== subject.subject
      ? title
      : (legacy?.name ?? (title || subject.subject));
  return {
    name,
    mark: legacy?.mark ?? name.slice(0, 2),
    description: legacy?.description ?? `Assessments for ${name}.`,
    color: legacy?.color ?? 'var(--mat-sys-primary)',
  };
}

export type AssessmentView =
  'overview' | 'subject' | 'history' | 'attempt' | 'result';
export interface TestSelection {
  subject: Subject;
  test: LearnerTestDto;
}
