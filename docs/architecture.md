# Architecture — learner assessment remote

Source baseline: `5ca35f5`, reviewed 2026-09-30. This describes code in this checkout,
not a verified deployed learner experience.

## Responsibility and current implementation

The repository name identifies the intended learner assessment journey. Today its
root renders **Example MongoDB Docs**: list/filter, create/edit dialog, delete and
copy ID. No subject selection, attempt resume, question answering, submission,
score/result view, or assessment API client exists here. Those are future product
requirements, not completed features. Assessment authoring belongs to the separate
`mfe-user-journey-admin-assessment-test` repository.

| Concern | Source | Observed behavior |
| --- | --- | --- |
| Startup | `src/main.ts`, `src/bootstrap.ts` | Deferred standalone bootstrap |
| Providers | `src/app/app.config.ts` | Zoneless change detection, HTTP, animations, reactive forms; no standalone router provider |
| Root | `src/app/app.ts` | Named/default `App`; `ngx-seed-mfe` selector; example list |
| Routes | `src/app/app.routes.ts` | Named `Routes`; empty path redirects to `overview`, which renders `App` |
| Federation | `webpack.config.js`, `webpack.prod.config.js` | Still named `ngx-seed-mfe`; `remoteEntry.js`; `./Component` and `./Routes` |
| List | `src/app/components/example-mongodb-doc-list.component.ts` | Signals, client-side name/description/ID filtering; CRUD actions and refresh |
| Item | `src/app/components/example-mongodb-doc.component.ts` | Document card, edit/delete events, clipboard ID |
| Dialog | `src/app/components/example-mongodb-doc-create-form-modal.component.ts` | Create/edit form; request errors close dialog |
| Forms | `src/app/services/example-form.service.ts` | Typed form; same mapping reused for create and patch |
| HTTP | `src/app/services/example-crud-api.service.ts` | Uses seed contracts, not assessment contracts |
| Appearance | `src/styles.scss`, `src/index.html` | Empty global stylesheet; seed HTML title/root, hosted fonts |

Host consumption of exposed modules does not automatically apply standalone
`appConfig`. Host providers, mount path, registry entry and theme need integration
verification before a learner implementation is considered complete.

## Existing API boundary

Current dependency: `@tmdjr/seed-service-nestjs-contracts` version `0.0.7`.
The base URL is `/api/example-crud/`. GET/POST use that base; GET/PATCH/DELETE by ID
append `/${id}`, creating a double slash. Documents use example fields such as
`name`, `type`, `description`, `archived` and optional address data. There is no
assessment contracts dependency or environment-specific assessment URL in this repo.

## Assessment integration owners

| Owner | Boundary / next verification |
| --- | --- |
| `service-assessment-test` | Owns definitions, eligibility, attempts and scoring. Its native prefix is `/assessment-test`; see readiness review before consuming its current payloads. |
| `mfe-user-journey-admin-assessment-test` | Separate authoring journey; not owned by this learner remote. |
| Workshop shell and remote orchestrator | Own remote registration, mount path, providers and dev overrides. Current seed federation identity must be reconciled deliberately. |
| BFF / Nginx owners | Own the browser-facing assessment prefix and forwarding/auth behavior; no mapping is proven by this checkout. |
| Platform auth / user metadata | Supply session and shared state. Installed `@tmdjr/ngx-user-metadata` does not create a route guard or attempt ownership enforcement. |

Names identify external owners, not required sibling filesystem paths. The service's
producer package is `@tmdjr/service-nestjs-assessment-test-contracts`; choose a released
version and validate its actual exports when replacing the seed client.

## Toolchain and release

Angular/Material/CDK 21.1.0, RxJS 7.8.2, TypeScript ~5.9.3. Federation 20.0.0 and
ngx-build-plus ^20.0.0 remain inherited; shared Angular/RxJS versions are strict
singletons. Production webpack reuses the base configuration.

Build output: `dist/mfe-user-journey-assessment-test`; local serving: 4201.
`.github/workflows/deploy.yml` installs/builds using Node 22 and copies assets to
`/opt/mfe-remotes/mfe-user-journey-assessment-test/` on pushes to `main` (or manual
workflow dispatch). It does not run tests or configure remote registration.
