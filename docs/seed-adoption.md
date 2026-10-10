# Workflow adoption — learner assessments

Updated 2026-10-09. The learner journey is implemented; the old CRUD scaffold is
removed. The original seed adoption/readiness review is historical context.

The current Markdown workflow and reusable templates were migrated from
`mfe-user-journey-admin-document-editor/.specify` and adapted to learner assessment
contracts and boundaries. Document authoring reviews, service-document ownership,
editor dependencies and unavailable helper assumptions were removed. No unrelated
editor feature history, runtime dependency or helper scripts were imported.

This checkout independently owns AGENTS.md, constitution, workflow, six templates,
architecture, development and feature history. Component HTML/SCSS is inline;
MVVM boundaries and RxJS lifetimes are maintained in the constitution.

Existing federation identity remains ngx-seed-mfe for compatibility with the host.
The generated assessment DTO archive remains vendored at 0.0.19. Optional producer
registry publication and production rollout are separate release work, not blockers
for this local refactor. See [002 handoff](../specs/002-mvvm-refactor/handoff.md).
