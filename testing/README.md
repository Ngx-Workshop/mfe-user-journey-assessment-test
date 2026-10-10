# Learner assessment tests

Keep specs outside production source. `testing/app` mirrors `src/app`:

- `app.spec.ts` covers journey composition/navigation and owned attempt gates.
- `features/assessment-test/state/assessment.store.spec.ts` covers shared data
  refresh/start, ordered saves and submission reconciliation.
- `features/assessment-test/pages/runner/runner.component.spec.ts` covers
  recovery, choice persistence, submission guards, input changes and teardown.
- `features/assessment-test/pages/result/result.component.spec.ts` covers
  historical feedback, errors and stale-result cancellation.

Test files import application code from `src/app`; application code must not import
from `testing`. Move matching specs and update imports when moving app files.

Run the complete suite:

```sh
npm test -- --watch=false --browsers=ChromeHeadless
```

Run a focused suite:

```sh
npm test -- --watch=false --browsers=ChromeHeadless \
  --include='../testing/app/features/assessment-test/state/assessment.store.spec.ts'
```

Karma discovers tests relative to `src`, so `angular.json` includes
`../testing/**/*.spec.ts`. `tsconfig.spec.json` includes `testing/**/*.ts` and
source declarations; imported application modules are compiled through imports.
`tsconfig.app.json` excludes specs and the testing tree.
