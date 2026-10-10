# Implementation plan: Assessment MVVM refactor

Status: Complete (local refactor acceptance)
Spec: [spec.md](spec.md)
Updated: 2026-10-09

## Technical context and source baseline

TypeScript ~5.9.3 / Angular 21.1.0; Material/CDK, RxJS 7.8.2, Module Federation;
assessment DTO archive 0.0.19. Baseline 8755cb5; clean working tree at inspection.
App directly loads catalog/history and starts attempts; RunnerComponent is 265
lines before including its 245-line template and 300-line stylesheet, and combines
form state, HTTP queue, browser recovery and submission. ResultComponent directly
loads HTTP. CatalogComponent is presentational but combines three large views.
AGENTS.md incorrectly says the current source is example CRUD.

## Ordered design and requirement mapping

1. FR-005: Adapt document editor templates and workflow; update constitution and
   entry point to the learner domain; create this feature's spec/plan/tasks/handoff.
2. FR-001: Move subject metadata and error mapping out of AssessmentApi. Add
   assessment.store.ts with read refresh cancellation, shared catalog/history,
   guarded start, ordered persistence and submit reconciliation.
3. FR-002/004: Add journey.view-model.ts, runner.view-model.ts,
   result.view-model.ts and draft-storage.service.ts. Scope UI state and cleanup;
   give route orchestration thin components and lifecycle-driven input streams.
4. FR-003: Extract hero, catalog sections, runner progress/question/review and
   result summary/feedback views. Inline templates/SCSS; BEM blocks/elements/
   modifiers, shared mixin foundations; preserve theme tokens and media rules.
5. FR-004: Run existing behavior tests, add meaningful cancellation, save ordering,
   destruction and result-reconciliation regression coverage. Fix findings.
6. FR-005: Update architecture/development/README/index and verification handoff.

## Constitution check

Focused learner ownership, preserved public integration, idiomatic Angular/RxJS,
server data/scoring ownership, observable verification, local current docs: satisfied
by the proposed boundaries. No new framework or dependency needed.

## Contracts and delivery

No producer, shell or gateway changes required. Keep existing URLs/payloads and
public exports. Build into dist/learner-verification to avoid the local watcher.
Existing browser is beta with possible local override; check rendered journey
without submitting real learner attempts. Isolated local HTTP tests cover mutations.

## Verification and risks

AC-001/002/004: ChromeHeadless component and store tests with HttpTestingController.
AC-003: production/development Angular builds, inline/BEM/line-count source audit,
and read-only responsive browser inspection where available.
AC-005: documentation link checks, stale editor/CRUD context scan, git diff --check.
Main risks: stale requests overwriting new views, save queue crossing attempt IDs,
recovery before ownership, duplicate submission and style scoping after extraction.
Use captured IDs and session-scoped view models, switchMap cancellation, nonzero
question submit guard and completed-result reconciliation to address these.

## Final constitution check

All proposed responsibilities and public boundaries are delivered. Component files
remain at or below 230 lines including inline presentation; shared foundational SCSS
is the explicitly permitted mixin. No framework/dependency upgrade or external
contract change. Synthetic browser checks verify layout; the beta host retained
an earlier bundle, documented separately from local acceptance.
