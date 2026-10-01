# Assessment readiness review and documentation handoff

Review baseline: `5ca35f5`. Scope: read this codebase and migrate the seed's Markdown
workflow. No learner feature implementation, runtime repair, deployment or data
mutation was requested for this step.

## Findings that shape the next specification

1. This remote has no assessment journey yet. Preserve the distinction between the
   learner UI here and assessment authoring in the admin remote.
2. The service has assessment operations, but its current implementation must be
   reconciled before treating its payloads as a learner contract: `userId` versus
   required `uuid`, unscoped submission, full answer keys in definition responses,
   progression based on completion rather than passing, and generated-contract drift.
   These findings come from the companion service source review; this repo can still
   be developed independently using an agreed contract and test doubles.
3. Do not assume the frontend's repository name implies a production mount, unique
   federation identity, API mapping, or working learner tests.

## Decisions to capture in the first implementation spec

- Subject selection, level progression, pass threshold and failed-attempt retry rules.
- Start/resume, navigation/refresh persistence, duplicate submission and completion UX.
- When correctness feedback is shown and which fields are allowed before submission.
- Authenticated learner identity, ownership failures, and service/gateway contract.
- Remote name/mount, shared providers, assessment package version and local API setup.

These are planning inputs, not new requirements approved by this migration request.

## Delivered files and evidence

`AGENTS.md`, `.specify/README.md`, constitution, four templates, architecture,
development, adoption status, this review, feature index and README are local to
this repository. Generic workflow/templates retain their seed contents; factual
context describes this source snapshot rather than completed future behavior.

Verification: 29 local documentation links resolve (template links target future feature files); copied workflow/templates match the
seed; `git diff --check` passes; changes are Markdown only. No build, test run, live
API, browser integration, package publication or deployment was performed.

Next action: agree the learner behavior and service compatibility decisions, then
create the first feature's spec/plan/tasks/handoff using the local templates. No
implementation spec has been invented or marked complete during this migration.
