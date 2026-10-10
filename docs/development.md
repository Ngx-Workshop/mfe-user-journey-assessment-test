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
