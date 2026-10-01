# Development and verification

Use Node 22 (CI baseline) and the committed lockfile. Run commands from this repo;
registry access may be needed for private/scoped dependencies.

| Purpose | Command | Actual scope |
| --- | --- | --- |
| Install | `npm ci` | Installs locked dependencies |
| Dev server | `npm start` | Port 4201; no backend proxy configured |
| Hosted-shell development | `npm run dev:bundle` | `watch` uses development configuration, plus static serving on 4201 |
| Build | `npm run build` | Production by default; writes `dist/mfe-user-journey-assessment-test` |
| Unit tests | `npm test -- --watch=false --browsers=ChromeHeadless` | Karma; requires Chrome and repaired test setup |

The static server enables CORS for bundle loading, not for the service API. Relative
API requests use the page's origin. A local bundle override does not make requests
use a local assessment service. Do not start another server on 4201 when an existing
remote is using it. Build to a separate output path if another session relies on a
watch build's `dist` files. No lint script or configured end-to-end runner exists.

## Source-observed limitations

These are inspection findings, not executed build/test results.

- No assessment UI/API client exists. The example CRUD makes real mutations through
  `/api/example-crud/`; do not treat it as a harmless in-memory demonstration.
- `app.spec.ts` expects `Hello, ngx-seed-mfe`; the actual heading is `Example MongoDB
  Docs`. Its TestBed also lacks HTTP test providers needed by the child list. Do not
  report this as an established passing suite.
- Federation name, root selector and HTML title still identify the seed. Coordinate
  registry/host changes before renaming public integration identifiers.
- The base URL plus ID interpolation produces `//`. Define the real assessment
  prefix with the gateway owner instead of mechanically renaming that string.
- Create/patch share a mapper that omits `archived: false` and blank descriptions,
  making resets unreliable. Partial address fields are included without completeness
  validation; these are scaffold limitations, not patterns for assessment answers.
- Create/edit request errors close the dialog; `submitting` is a plain property in
  an OnPush/zoneless component. Replace with explicit recoverable state when building
  the journey. Several `any` casts remain.
- There is no local route guard, `provideRouter`, or assessment environment switch.
  No learner session, scoring, or gateway behavior has been verified here.

## Checks for future implementation

Specify learner scenarios before replacing the scaffold. Use the service contract
and HTTP doubles for unit tests; do not require a live platform for those tests.
Cover subject availability, start/resume, answer validation, submit/result/error
recovery and ownership denials once their behavior is agreed. Verify keyboard,
loading/empty/error states, refresh/navigation behavior and narrow layouts. Build
and check federation exports locally, then test through the actual host/gateway.
Record unavailable integrations separately from passing local checks.

For this Markdown-only migration, source/relative-link/whitespace checks are sufficient;
no app tests, servers or builds were run. See [review and handoff](assessment-readiness.md).
