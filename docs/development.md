# Development and verification
Use Node 22 (CI baseline) and the committed lockfile. The host session ran Node 24.9.0 successfully.

| Purpose | Command | Scope |
| --- | --- | --- |
| Install | `npm ci` | Includes vendored generated contracts; no unpublished registry version required |
| Watch local bundle | `npm run dev:bundle` | Existing dist/port 4201; do not start a competing server |
| Standalone dev | `npm start` | Port 4201, needs a same-origin `/api/assessment-test` gateway |
| Production build | `npm run build` | Federation bundle |
| Independent verification build | `npm run build -- --output-path dist/learner-verification` | Avoids the existing watcher output |
| Unit/component tests | `npm test -- --watch=false --browsers=ChromeHeadless` | Component/store regression tests with HTTP doubles; set CHROME_BIN if Chrome cannot be found |

## Disposable integrated preview
With the companion service checkout and local Mongo available, build this frontend to `dist/learner-verification`. In `service-assessment-test`, run `npm run preview:learner`. Visit `http://localhost:4203/`.

This optional test harness serves the real optimized frontend and assessment module, seeds synthetic definitions/results, and uses a synthetic learner with regular role. It binds only to loopback, uses a unique `assessment_test_preview_<pid>` database, and drops that database on SIGINT/SIGTERM. It never reads .env or production records and is not part of the runtime application. Keep it local. It is for review and does not prove production auth/gateway behavior.

## Current refactor verification

See [002 handoff](../specs/002-mvvm-refactor/handoff.md) for current command results.
The suite covers discovery/start mapping, retry, empty history, owned attempt gates,
restored answers, save retry/order, lost submission reconciliation, nonempty complete
submission guards, input cancellation, historical feedback and runner teardown.
HTTP doubles are local behavior evidence; they do not prove production auth or
server scoring. Build into separate verification output to preserve the watcher.

Inline templates and SCSS are enforced by the component structure; a reusable
_shared.scss mixin emits only requested BEM foundation elements. Keep budgets
unchanged. Existing production module-concatenation settings remain required.

The supplied beta URL can use an existing local remote override. Read-only browser
navigation is suitable for layout/result inspection; synthetic HTTP tests cover
mutations without changing real learner attempts. No deployment or package
publication is part of the refactor.

## Earlier integration evidence

The 001 handoff records synthetic local Mongo/Nest preview walkthroughs at 1366 px
and 390 px, including persistence and submission. That earlier evidence is not a
new integration test of this refactor. Preserve this distinction in future handoffs.

## Test and feature organization

Feature implementation lives in `src/app/features/assessment-test`, grouped into
api, models, state, utils, styles, pages and presentation component folders.
Tests live in the matching `testing/app` tree, outside production source. See the
[testing guide](../testing/README.md) for full-suite/focused commands and discovery.

## Document section subject verification — 2026-10-09

- PASS: 19 ChromeHeadless tests, including rendered arbitrary Rust subject
  discovery and start request with unchanged string ID/definition ID mapping.
  Existing runner, result, save, routing and ownership-view regressions pass.
- PASS: production build in /tmp/assessment-learner-section-subjects-build and
  TypeScript test compilation. Generic subject display uses sectionTitle and
  preserves legacy branded metadata as a fallback.

See [subject handoff](../specs/003-document-section-subjects/handoff.md).

## Continuity verification — 2026-10-11

22 ChromeHeadless tests and an isolated optimized build passed for this checkout. Synthetic desktop (1366px) and phone (390px) browser previews had no page errors or horizontal overflow. See [handoff](../specs/004-workshop-continuity/handoff.md) for evidence and the pending signed-in shell walkthrough. Use `/workshops/overview` for workshop returns; earlier `hello-world` workshop examples are outdated. Standalone lab providers now register exported Routes; cross-remote return paths still require host routing.

## Multiple tests per level — 2026-10-11

ChromeHeadless component/store suite and production build to /tmp/assessment-multi-test-learner-build passed. The new rendered-row test selects the second test at level 1 and verifies its definition ID in the POST. See [handoff](../specs/005-multiple-tests-per-level/handoff.md). No production deployment or data writes.

## Angular route verification — 2026-10-11

[006 routing](../specs/006-journey-routing/handoff.md) records 39 passing ChromeHeadless tests, source type/unused checks and an isolated production build. RouterTestingHarness tests use HTTP/Location doubles beneath /take-assessment-test. Location listener setup is explicit in TestBed; normal bootstrap installs it. Workshop suite has 14 passing tests plus architecture/types/build. No assessment architecture script is configured; review source boundaries alongside tests/build. Hosted sign-in/deep-link reload/workshop-return still need release verification.

## Shared hero — 2026-10-12

The remote consumes the checked-in `vendor/tmdjr-ngx-shared-headers-21.0.3.tgz`.
Library changes require a new producer build/archive, dependency and lockfile update.
Registry publication is separate release work. The focused test is
`npm test -- --watch=false --browsers=ChromeHeadless --include='../testing/app/features/assessment-test/components/journey/journey-hero.component.spec.ts'`.
The suite covers assessment-specific slot content and computed pause state across
projected component styles. Full suite: 41 passing tests; production build and
strict source type/unused checks also pass. No assessment architecture script exists;
source boundaries were reviewed. See [007 handoff](../specs/007-shared-hero/handoff.md).
