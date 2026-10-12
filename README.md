# Learner assessment journey

Angular learner remote for Ngx-Workshop: subject discovery, eligible assessments, saved progress, review and submission, historical results and proficiency. Uses the authenticated `/api/assessment-test` service boundary; assessment authoring remains in the admin journey.

Start with [AGENTS.md](AGENTS.md), [architecture](docs/architecture.md), [development](docs/development.md), and the [learner handoff](specs/001-learner-journey/handoff.md). The [MVVM refactor plan](specs/002-mvvm-refactor/plan.md) and [handoff](specs/002-mvvm-refactor/handoff.md) describe the current boundaries. The local [workflow](.specify/README.md) and [feature index](specs/README.md) track requirements and verification.

## Local commands
Use Node 22 and `npm ci`. `npm run dev:bundle` runs the development watcher and static bundle server on 4201. Existing hosted local overrides can consume the bundle; API requests still use the host's origin. Do not start a competing server.

`npm run build` produces the production federation bundle. `npm test -- --watch=false --browsers=ChromeHeadless` runs learner component/store regression tests.

For a disposable integrated review, build with `npm run build -- --output-path dist/learner-verification`, then run `npm run preview:learner` in the companion service checkout. Open http://localhost:4203/. This uses synthetic records and a regular learner identity in a unique local database, with the actual frontend/service. See [development](docs/development.md) for details and limitations.

The generated contract package 0.0.19 is vendored until its registry release. Producer service/gateway must be updated before releasing the learner. Federation identity, exposures, public overview route and deployment configuration remain compatible. No deployment or registry publication was performed in this implementation.

Implementation is grouped under `src/app/features/assessment-test`; test files
mirror application folders under `testing/app`. See [testing](testing/README.md).

Assessment navigation uses Angular routes beneath /take-assessment-test: overview (default), subjects/:subjectId, history, attempts/:attemptId, attempts/:attemptId/review and results/:attemptId. Existing overview query links migrate to canonical paths. Workshop links target the encoded subject path with an exact test ID and return context; the learner remote starts/resumes the owned attempt. See [routing handoff](specs/006-journey-routing/handoff.md).
