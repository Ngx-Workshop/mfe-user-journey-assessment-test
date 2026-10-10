# Feature: Assessment MVVM refactor

Status: Complete (local refactor acceptance)
Feature ID: 002-mvvm-refactor
Created: 2026-10-09
Updated: 2026-10-09
Request/source: User code quality and Spec Kit migration request.

## Problem and scope

Learners already discover subjects, resume assessments, save answers, review,
submit and inspect feedback. App and runner mix HTTP, state, navigation and UI;
separate templates/styles and stale seed documentation obscure the boundaries.
Refactor this repository and migrate the document editor workflow/templates into
assessment-specific context. Preserve learner behavior and public contracts.
No service changes, deployment, dependency upgrades or authoring features.

## Requirements

- FR-001: Stateless AssessmentApi owns HTTP and generated DTO mapping only;
  a root singleton AssessmentStore owns shared server state and data orchestration.
- FR-002: Scoped view models own route/view/form state and communicate through
  the store; orchestration components compose input/output presentation components.
- FR-003: Inline component templates and SCSS; BEM class names; aim for about
  230 lines per component with documented justified exceptions.
- FR-004: Preserve sequential saves, retry, owned draft recovery, incomplete-answer
  guards, submission reconciliation, scores, feedback and deep links.
- FR-005: Migrate reusable workflow/templates, update current architecture and
  constitution, and retain historical feature records without unrelated editor specs.

## Acceptance scenarios

- AC-001 (FR-001/002): Discovery/retry/start update shared data and navigate with
  the same subject and definition ID; components never inject AssessmentApi.
- AC-002 (FR-002/004): Resumed drafts save in order; failures retain answers and
  block submit; retry succeeds; interrupted submit reconciles completed results only.
- AC-003 (FR-003/004): Overview, subject, history, question/review and feedback
  retain labels, keyboard controls and responsive layout with inline BEM styles.
- AC-004 (FR-004): Missing owned attempts do not load questions; changing attempt
  or result cancels stale loads; destruction detaches listeners/subscriptions.
- AC-005 (FR-005): Local docs describe implemented assessments and new boundaries.

## Data and compatibility

Keep default App, named Routes, ngx-seed-mfe, federation exposures, overview route,
query parameters, shell theme/session providers and contract archive 0.0.19.
Service owns ownership, scoring and progression; no persistence schema change.
Host integration is checked where available; unit HTTP doubles are local evidence.

## Constitution check and decisions

All six principles apply. RxJS switchMap handles superseded reads, concatMap
serializes saves, exhaustMap prevents duplicate starts/submissions. Signals expose
state to zoneless OnPush views. Drafts/forms remain scoped to one runner; they must
not leak between attempts in the shared singleton. Shared SCSS foundations may
remain a reusable mixin; component-specific HTML/SCSS must be inline.
