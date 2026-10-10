# Handoff: Assessment MVVM refactor

Status: Complete (local refactor acceptance)
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-10-09

## Delivered behavior

Migrated the document editor's reusable Markdown workflow and templates into
assessment-specific context without copying its feature history or runtime.
Corrected stale CRUD descriptions and documented Angular MVVM quality rules.
Baseline: 8755cb5; working tree was clean before implementation.

AssessmentApi now contains HTTP/DTO mapping only. Root AssessmentStore owns shared
catalog/history, refresh/start state, ordered captured-ID saves and completed-result
submission reconciliation. Journey/runner/result view models are scoped to their
orchestration components. DraftStorage isolates optional browser recovery.

Catalog views, hero, progress navigation, question choices, review, result summary
and feedback are focused presentation components with inline templates and SCSS.
Shared SCSS is a foundation mixin that emits requested BEM elements only. Component
files range from 37 to 230 lines including inline styles/templates (App is largest).
No component injects the API; only the store consumes it, and only API uses HttpClient.

Retained routes, outputs, DTO version, URLs/payloads, theme tokens and learner rules.
Fixed incomplete/empty question submission and incomplete-result reconciliation.
Replaceable requests cancel on newer input/refresh; runner teardown cancels requests
and removes the browser unload listener. Recovered choices remain gated by an owned
question response and valid choice/count/timestamp checks.

## Acceptance and verification evidence

| Scenario/check | Command or method | Result | Scope |
| --- | --- | --- | --- |
| AC-001/002/004 | `CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test -- --watch=false --browsers=ChromeHeadless` | PASS: 18 tests | HTTP doubles; no real attempt mutation |
| AC-003 | `npm run build -- --output-path dist/learner-verification` | PASS, no Angular/style-budget warnings | Optimized federation build; unchanged budgets |
| AC-003 | `npm run build -- --configuration development --output-path dist/learner-verification-dev` | PASS | Independent watcher-safe output |
| AC-003 | `npm run build -- --configuration development` | PASS | Refreshed bundle served by the existing server on 4201 after independent checks |
| AC-001/003 | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` | PASS | Type and unused-import checks |
| AC-003 | Synthetic read-only standalone preview of production bundle, 1280px and 390px | PASS | Overview, subject, resume, review, history, result/feedback; mobile page width 390px |
| AC-003 | Authenticated supplied beta page | Observed earlier bundle | New presentation selectors absent; not proof of refactor host integration |
| AC-005 | Relative documentation links and source-boundary/BEM/inline audit | PASS | Templates' future artifact links excluded |
| AC-005 | `git diff --check` | PASS | Whitespace |

Regression suite adds stale refresh/results/attempt cancellation, duplicate starts,
ordered failed-save recovery, incomplete reconciliation, zero-question submit guard,
destruction cleanup, invalid browser drafts and storage failure coverage.

Browser preview used a temporary loopback-only fixture server with GET endpoints,
no database and no mutation handlers. It was stopped after inspection. This is visual
verification with synthetic data, not a new real-service integration test. The beta
host still loaded the prior bundle during this session. No deploy/publication or
real learner answer/submission mutation was performed.

## Contract and consumer handoff

No producer, gateway, shell, DTO or registry changes required. Default App, named
Routes, federation identity/exposures, overview route and query navigation remain
compatible. The existing local server's bundle has been rebuilt. Ensure the host selects the
local remote override and reload to display this refactor;
verify authenticated host behavior before release. That release smoke check is
separate from completed local refactor acceptance.

## Remaining work and context maintenance

No local implementation tasks remain. AGENTS.md, constitution, workflow/templates,
architecture, development, adoption, README and feature index reflect the delivered
structure. Historical readiness/001 feature records are retained as earlier evidence.
