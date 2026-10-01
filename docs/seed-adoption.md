# Seed adoption status — learner assessments

The Markdown workflow is adopted from `seed-mfe-remote`; workflow instructions and
four templates are copied unchanged. The entry point, constitution and context are
adapted to this repository. The runtime scaffold is **not** yet adopted to assessments.

| Area | Current state | Future implementation work |
| --- | --- | --- |
| Repo/package/build/deploy target | Assessment-specific | Preserve unless an explicit migration requires changes |
| Federation/root/HTML identity | Still `ngx-seed-mfe` / `NgxSeedMfe` | Agree unique remote identity and host registration |
| Routes | `overview` → example CRUD | Specify learner routes and mount behavior |
| Components/forms/API types | Example documents and seed contracts | Replace with learner views and verified assessment contracts |
| Backend integration | None for assessments | Agree auth, gateway prefix, ownership and response redaction |
| Tests | Seed app scaffold | Replace stale assumptions with observable learner behavior |
| Documentation | Local workflow and source baseline present | Keep current as features are implemented |

Use [readiness](assessment-readiness.md) to start the next specification. Do not copy
Coding Labs feature specs, local bypasses, execution runner assumptions or draft/publish
rules into this different domain. No runtime renaming or deployment was performed
as part of this documentation migration.
