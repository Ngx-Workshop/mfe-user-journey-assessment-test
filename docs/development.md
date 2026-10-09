# Development and verification
Use Node 22 (CI baseline) and the committed lockfile. The host session ran Node 24.9.0 successfully.

| Purpose | Command | Scope |
| --- | --- | --- |
| Install | `npm ci` | Includes vendored generated contracts; no unpublished registry version required |
| Watch local bundle | `npm run dev:bundle` | Existing dist/port 4201; do not start a competing server |
| Standalone dev | `npm start` | Port 4201, needs a same-origin `/api/assessment-test` gateway |
| Production build | `npm run build` | Federation bundle |
| Independent verification build | `npm run build -- --output-path dist/learner-verification` | Avoids the existing watcher output |
| Unit/component tests | `npm test -- --watch=false --browsers=ChromeHeadless` | Eight tests with HTTP doubles; set CHROME_BIN if Chrome cannot be found |

## Disposable integrated preview
With the companion service checkout and local Mongo available, build this frontend to `dist/learner-verification`. In `service-assessment-test`, run `npm run preview:learner`. Visit `http://localhost:4203/`.

This optional test harness serves the real optimized frontend and assessment module, seeds synthetic definitions/results, and uses a synthetic learner with regular role. It binds only to loopback, uses a unique `assessment_test_preview_<pid>` database, and drops that database on SIGINT/SIGTERM. It never reads .env or production records and is not part of the runtime application. Keep it local. It is for review and does not prove production auth/gateway behavior.

## Verified behavior
Eight frontend tests cover subject discovery/exact start mapping, errors/retry, empty history, missing owned attempts, persisted answers, incomplete submission prevention, saved-answer retry, lost-submit reconciliation, browser recovery and historical feedback. Production and development builds pass. Four scoped style bundles exceed the inherited 4 kB warning threshold (largest ~6.2 kB) but remain below the unchanged 8 kB error limit.

Desktop (1366 px) and mobile (390 px) browser walkthroughs exercised subject discovery, start/resume, server answer saves, full refresh, review, submission, historical feedback and proficiency. Mobile content width equals viewport width; the question navigator intentionally scrolls horizontally. The preview uses actual local Mongo/Nest persistence with a synthetic identity, not a mocked browser API.

The beta URL requires the updated service/gateway and remote release, or the user's existing local remote override. The inspected browser still used the deployed seed. No deployment, registry publication or production attempt mutation was performed.
