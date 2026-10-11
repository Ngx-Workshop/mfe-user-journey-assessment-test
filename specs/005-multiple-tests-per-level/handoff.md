# Handoff
Status: Implemented; hosted integration pending · 2026-10-11
See [spec.md](spec.md), [plan.md](plan.md), [tasks.md](tasks.md).

## Delivered behavior
Admin create/update accepts sibling definitions. Learner start uses the selected ID;
ambiguous ID-less starts return a selection-required 409. Catalog and eligibility
share consecutive-level unlocking. Siblings remain available after completion and
do not advance multiple levels. Existing ownership, active-attempt resume, scoring,
used-definition guards and legacy identities are preserved. Learner copy explains
selection and a rendered component test proves second-row ID mapping.

## Verification
ChromeHeadless component/store suite and production build to /tmp/assessment-multi-test-learner-build passed. The new rendered-row test selects the second test at level 1 and verifies its definition ID in the POST.
Tests use synthetic identity providers/HTTP doubles, not production auth. Service
HTTP tests used real isolated MongoDB and dropped their database. Existing unrelated
working-tree changes were preserved.

## Rollout
Deploy service first, then learner. No Mongo migration or production record changes
are required. Existing contract 0.0.20 wire shapes remain compatible; generated
OpenAPI start-ID description was updated without registry publication. Legacy
callers omitting the definition ID must handle 409 when selection is ambiguous.
Subject eligibility levelCount now reports consecutive completed levels, not test
count; totalCount remains definition count. Verify admin creates another angular/1
definition and learners can select it through hosted auth/gateway after deployment.
X001 remains external; this change has not been deployed.
