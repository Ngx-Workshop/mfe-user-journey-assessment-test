# Handoff: Angular assessment journey routes
Status: Implemented; hosted integration pending · 2026-10-11
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior
Angular routes now own overview (default), subjects/:subjectId, history, attempts/:attemptId, attempts/:attemptId/review and results/:attemptId. View/identity come from route data/path parameters; old overview query links migrate while preserving assignment/workshop context and encoded IDs. Unknown paths recover to overview. Standalone bootstrap uses a RouterOutlet root and the same exported Routes as federation.

Start/resume opens the owned attempt; review can be opened directly/reloaded and restores persisted/validated recovery answers after owned questions load. Returning from review selects its question using an optional query hint. Standalone confirmed completion replaces the attempt URL with results; workshop completion still returns to its validated saved lesson. Owned history reconciles completed attempt links and unfinished result links. Missing subjects/tests/attempts and request errors retain recovery UI. The subject-catalog length no longer hides owned attempts/results.

Pending/failed answer saves and submissions block page exits, browser Back and reused-route parameter changes. A root UI coordinator retains only lifecycle-cleared scoped guard callbacks. Confirmed start/completion approves its own navigation. Answer/form/review data stay scoped; API, ownership, grading, eligibility, ordered autosaves and draft recovery contracts are preserved.

Workshop placement/assignment links now use /take-assessment-test/subjects/:subjectId, encoding section IDs and preserving exact test, launch=direct, returnTo and workshopName. Shared outline/next activity URL composition inherits that route.

## Verification evidence
- PASS: 39 assessment ChromeHeadless tests, including eight RouterTestingHarness scenarios under a shell prefix for default/subject/history/unknown paths, legacy redirects/encoding/context, saved review/direct reload/question return, Back/failed-save/parameter guards, completion reconciliation, direct workshop start/automatic return, submission guards/standalone results and missing owned attempts.
- PASS: 14 workshop ChromeHeadless tests, including rendered placement href and shared assignment/reader URL context.
- PASS: Source TypeScript/unused checks in both repositories; git diff --check in both.
- PASS: Workshop npm run check:architecture. Assessment has no architecture script; source review confirms feature/mirrored-test folders, API/store/VM boundaries, scoped teardown, inline OnPush views and existing style conventions.
- PASS: Isolated production federation builds at /tmp/assessment-journey-routing-build and /tmp/workshop-assessment-routing-links-build.

Tests use HTTP/Router/Location doubles, not hosted auth or real scoring. Angular disallows canMatch on redirect routes, so legacy overview migration uses an activation UrlTree redirect; empty entry uses RedirectFunction. Location tests explicitly install the location listener normally set up by application bootstrap.

## Consumer handoff and remaining work
X001: Deploy updated assessment/workshop remotes, then verify signed-in placement and assignment launch, direct review/results reload, Back and lesson return in the shell. Preserve /take-assessment-test mount and use exported Routes. ./Component-only consumers need equivalent view/review route data and subjectId/attemptId params. No deployment, remote registration, package publication or server data writes were performed.

Local tasks complete. Updated assessment README, architecture/development guides and feature index, and workshop architecture/continuity records. This spec supersedes historical query-selector navigation decisions; API/federation exports remain compatible.
