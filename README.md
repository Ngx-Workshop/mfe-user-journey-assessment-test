# Learner assessment journey

Angular remote intended for learner assessments in Ngx-Workshop. **The current
implementation is still the example-document CRUD scaffold**, not a test-taking
experience. It calls `/api/example-crud/`; it is not wired to `service-assessment-test`.

Start with [AGENTS.md](AGENTS.md), [architecture](docs/architecture.md),
[development](docs/development.md), and [assessment readiness](docs/assessment-readiness.md).
The adopted [specification workflow](.specify/README.md) and [feature index](specs/README.md)
keep future requirements, plans, tasks and handoffs in this repository.

## Local commands

Use Node 22 and `npm ci`. `npm start` serves on port 4201; `npm run dev:bundle`
runs a development watch build and a CORS-enabled static server on that same port.
These commands do not supply an API proxy or backend. Check for another remote
already using 4201 before starting one.

`npm run build` produces `dist/mfe-user-journey-assessment-test`.
`npm test -- --watch=false --browsers=ChromeHeadless` uses Karma/Chrome; the inherited
app tests need correction before they are a reliable baseline.

Pushing `main` triggers the existing production deployment. Documentation adoption
has not changed runtime code, federation identity, deployment settings or API behavior.
