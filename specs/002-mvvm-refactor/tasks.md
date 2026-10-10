# Tasks: Assessment MVVM refactor

Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Updated: 2026-10-09

- [x] T001 — Migrate .specify templates/workflow and current context (FR-005/AC-005).
- [x] T002 — Stateless HTTP, singleton assessment.store.ts, metadata/error helpers
  (FR-001/AC-001). Verify request mapping and cancellation.
- [x] T003 — Scoped journey/runner/result view models and browser draft adapter
  (FR-002/004, AC-002/004). Verify ordered saves, recovery and teardown.
- [x] T004 — Inline BEM presentation components and orchestration composition
  (FR-003/AC-003). Verify Angular templates, styles and line counts.
- [x] T005 — Meaningful behavioral regression tests and production/development
  builds (FR-004/AC-001–004). Record exact results.
- [x] T006 — Maintain docs/index and handoff (FR-005/AC-005). Verify local links
  and diff whitespace. No external implementation tasks required.

## Progress and evidence

T001/T006: assessment-adapted templates and current context maintained; local links
resolve. T002/T003: API/store/VM boundaries compile; cancellation, persistence and
reconciliation regressions covered. T004: inline/BEM audit passes, largest component
230 lines; synthetic production preview checked desktop/mobile composition.
T005: 18 tests pass, production/development builds and unused-symbol type check pass.
See [handoff](handoff.md) for the beta-host bundle limitation and verification scope.
