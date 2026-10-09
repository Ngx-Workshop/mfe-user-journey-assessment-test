# Architecture — learner assessment journey
Updated 2026-10-09 for [001 learner journey](../specs/001-learner-journey/spec.md).

The standalone OnPush `App` replaces the seed CRUD with subject discovery, level eligibility, an assessment workspace, completed results and proficiency/history. It does not own authoring, global navigation, auth, or scoring.

| Concern | Source | Behavior |
| --- | --- | --- |
| Composition/navigation | `src/app/app.ts`, `app.html`, `app.scss` | Signals, query parameter navigation, loading/errors, owner history, keyboard focus on view changes |
| Subjects/history | `src/app/assessment/catalog.component.*` | Supported subjects, eligible/in-progress/completed/locked tests, recent activity, weighted accuracy and highest passed level |
| Taking a test | `src/app/assessment/runner.component.*` | Redacted questions, typed reactive choice control, sequential saves, browser recovery, review and final submission |
| Results | `src/app/assessment/result.component.*` | Historical score/date, selected/correct answers and author feedback after completion |
| HTTP/contracts | `src/app/assessment/assessment-api.service.ts` | `/api/assessment-test`, generated producer DTOs; no direct database or admin requests |
| Standalone providers | `src/app/app.config.ts`, `src/styles.scss` | Router/HTTP/zoneless providers and standalone Material theme |
| Federation | `webpack*.config.js` | Existing `ngx-seed-mfe`, `./Component`, `./Routes`, default App and named Routes preserved |

## Navigation and host compatibility
The public `overview` route remains. Query parameters select `view=subject&subject=ANGULAR`, `view=attempt&attempt=<owned-id>`, `view=result&attempt=<owned-id>`, or `view=history`. This works with hosts consuming either exposed Component or Routes, without changing the registry/mount contract. The host must provide Router and HttpClient with its session interceptors; standalone appConfig is not installed by remote loading. Query parameter changes reset view focus. UI styles remain scoped to this journey; the shell retains its theme and structural navigation.

Production webpack disables module concatenation, preserving Angular 21 internal module identities across federation boundaries. Without this, an optimized standalone browser run failed with missing defineInjectable exports despite a successful build; the repaired optimized bundle was verified in the browser. Angular/shared dependency versions remain unchanged.

## Data ownership
The service returns safe catalog metadata and owner-scoped history. Start sends subject plus the selected definition ID, then refreshes history. The runner saves complete answer-slot arrays (empty string for unanswered) sequentially to the owned attempt. Session storage retains newer unsaved answers under the owned attempt ID for interrupted requests; they are restored only after the service returns that attempt in the authenticated user's history, validated against safe question choices, and cleared after completion. No answer keys or credentials are saved there. Save failures block submit and Save & exit until retry succeeds; navigation/refresh can recover browser drafts. Submission failures reconcile against the completed owned result to handle a lost response after grading.

Passing still requires every answer correct. Completion advances to the next numbered level regardless of passing; retries are not introduced. Proficiency is the highest passed level, while accuracy is correct answers divided by all known completed question counts. The producer retains canonical userId plus uuid-only legacy ownership; no bulk data migration.

## Contract delivery
The additive producer package 0.0.19 is generated from OpenAPI and bundled as a small archive in `vendor/` so npm ci remains reproducible before registry publication. It is not published by this task. Replace the file dependency with the released package when available. The old seed contract and CRUD source are removed.

Production requires the new service endpoints and gateway forwarding. Live beta still rendered the deployed seed remote in the inspected browser; local verification does not constitute deployment.
