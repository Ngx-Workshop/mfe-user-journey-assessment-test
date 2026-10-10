# Tasks
- [x] T001 Add safe learner service endpoints and regenerate contracts (FR-001–005).
- [x] T002 Implement subject catalog, runner, review, results and history (FR-001–004).
- [x] T003 Verify ownership, scoring, draft persistence and UI outcomes with automated checks (AC-001–005).
- [x] T004 Build and inspect responsive UI; update context and handoff.
- [x] T005 Replace fixed learner colors with inherited Material tokens; verify light/dark alternate palette (AC-006).
- [ ] X001 Verify deployed service/gateway and hosted shell with the new endpoints after release.

## Evidence
2026-10-09: service/OpenAPI and regenerated contracts compile; 3 auth unit tests, 7 disposable-Mongo HTTP scenarios and 8 frontend tests pass. Optimized browser startup, 1366/390 px layouts, exact start, refresh/resume, save/exit, review, submit, dated feedback/history and proficiency were exercised against real local persistence with a synthetic identity. Style warning budgets remain nonfatal. X001 is pending deployment/live auth-gateway verification.

Theme follow-up: production build and all 8 frontend tests pass. Temporary compiled blue-palette fixtures verified light/dark catalog colors, dark historical results, and themed runner styles. Existing 4 kB style warnings remain; all styles are below the unchanged 8 kB error limit. No fixed color literals or Material control overrides remain in learner source.
