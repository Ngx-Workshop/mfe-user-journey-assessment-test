# Plan: Angular assessment journey routes
Status: Implemented; hosted integration pending · 2026-10-11

Baseline: app.routes.ts only exports overview; bootstrap renders App directly. JourneyViewModel reads query selectors; RunnerViewModel owns review and ordered saves. Workshop assessmentUrl currently targets overview?view=subject&subject=….

FR-001–003: Route data/path params drive the existing scoped App composition. Read settled NavigationEnd snapshots with initial snapshot deduplication. Add standalone RouterOutlet bootstrap. Migrate legacy entry query state using UrlTrees preserving host prefix/context; retain plain overview as canonical. Reconcile completed/unfinished attempt paths against owned history; missing attempts never render a runner.
FR-004: Root navigation coordinator holds active journey/runner guard callbacks only, cleared on destruction. canDeactivate and activation for reused route params prevent pending/failed saves or submissions from being torn down. Confirmed starts/completions approve their own transitions. Review route initializes the runner after owned questions load; return-to-question carries its index as a query hint.
FR-005: Workshop URL builder uses encoded subjects/:subjectId, with assignment/context query parameters; existing outline/next-activity builders inherit this route.

Constitution: no API/store routing dependency, no form answers in singleton state, OnPush/inline styles and mirrored tests preserved. Default/named exports remain. Route contract changes are requested and old links retain redirects. No architecture script is currently configured in assessment; source review/types/tests/build provide its checks. Workshop retains its architecture check.

Validation: real Angular RouterTestingHarness with HTTP/Location doubles for host prefixes, redirects, review reload, answer guards/Back, start/resume/completion and errors. Existing runner/store/result regressions; workshop link regression; source type/unused checks and isolated builds for both repositories. Signed-in shell walkthrough remains pending, no deployment.
