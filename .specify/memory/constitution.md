# Constitution — Learner assessment journey

Version: 1.1.1 · Adopted: 2026-09-30 · Updated: 2026-10-09

These are durable requirements. Current implementation and verification evidence
live in the architecture/development guides and feature handoffs.

## 1. One learner journey, one responsibility

Ngx-Workshop is a learning platform using independently maintained repositories.
A remote owns a focused user journey or a structural element. The host shell
loads and composes remotes. Do not nest remotes or assume ownership of global
navigation, authentication, or other journeys. This remote owns learner assessment
interaction; authoring belongs to the separate admin remote. The learner specifications describe implemented behavior and compatibility.

## 2. Preserve integration contracts

Treat `remoteEntry.js`, exposed modules, exported symbols, route behavior, shared
singletons, and HTTP contracts as public interfaces. Document compatibility and
consumer impact before changing them. The gateway owns routing from browser API
paths to services; this remote does not choose production service addresses.

## 3. Angular MVVM and reactive data flow

Use standalone OnPush components, zoneless-compatible signals, Angular Material,
typed reactive forms and RxJS streams. The stateless HTTP client owns transport and
generated DTO mapping. A root singleton store owns shared server state and data
orchestration; it never depends on components, forms or Router. Scoped view models
own route/view/form state and call the store. Orchestration components manage
composition/lifecycle; presentation components receive inputs and emit user intent.
Nested orchestration is allowed when it reflects distinct responsibilities.

Keep runtime feature code under `src/app/features/assessment-test`, grouped by
responsibility into api, models, state, utils, styles, pages and components.
Group page/presentation folders by journey, catalog, runner and result. Keep tests
outside production source in `testing/app`, mirroring their application folders.
Public federation entry points remain at `src/app`.

Use switchMap for replaceable reads, concatMap for ordered saves and exhaustMap
for duplicate-sensitive commands. Bind subscriptions/listeners to their lifetime.
Browser draft recovery is an adapter, restored only after owned questions load.
Never put an active runner's mutable form/unsaved answers in shared singleton state.

Inline component HTML and SCSS in TypeScript; shared SCSS foundations may remain
mixins. Use BEM class naming and shell theme tokens. Aim for approximately 230
lines per component; a justified larger cohesive component is permitted. Avoid
splitting merely to meet a line count or hiding logic in templates. Keep Angular
and federation dependency versions compatible with the consuming shell.

## 4. Put data ownership on the server

Use published DTO contracts and explicit request mapping. Frontend visibility and
route guards support the user experience; backend authorization remains necessary. The service owns attempt identity,
eligibility, answer validation and scoring. Define when feedback becomes visible;
do not treat answer keys returned by an old endpoint as an approved learner contract.
Keep credentials and privileged operations out of browser assets. Do not infer
authorization rules from the seed's demonstration CRUD interface.

## 5. Make behavior observable and verifiable

Specify acceptance scenarios before nontrivial implementation. Cover loading,
empty, success, validation, and failure states appropriate to the feature. Preserve
keyboard access, useful labels, and responsive behavior. Test observable outcomes
and integration boundaries; do not treat a successful build as end-to-end proof.

## 6. Keep knowledge local and current

An agent with this checkout alone must be able to understand its responsibilities,
contracts, and verification steps. Record external dependencies and handoffs in the
feature folder. Distinguish assumptions, source observations, and verified results.

## Amendments

Change these principles intentionally with a rationale and version/date update.
Review affected architecture docs and templates at the same time. A justified
feature-specific exception belongs in its plan, with impact and follow-up stated.
