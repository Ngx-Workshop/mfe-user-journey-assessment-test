# Architecture — learner assessment journey

Updated 2026-10-09 for [002 MVVM refactor](../specs/002-mvvm-refactor/spec.md).
The learner remote discovers subjects, starts/resumes assessments, saves answers,
reviews/submits attempts and displays historical results/proficiency.

## Responsibility map

| Layer | Source | Responsibility |
| --- | --- | --- |
| Model/transport | `src/app/features/assessment-test/api/assessment-api.service.ts` | Stateless HttpClient requests using generated DTOs; no UI metadata, state or orchestration |
| Shared state | `src/app/features/assessment-test/state/assessment.store.ts` | Root singleton catalog/history and loading/error state; superseded refresh cancellation, duplicate start guard, captured-ID ordered saves and completed-result submit reconciliation |
| Journey VM | `src/app/features/assessment-test/pages/journey/journey.view-model.ts` | Scoped route data/path state, derived selection/active attempt, store commands and navigation |
| Runner VM | `src/app/features/assessment-test/pages/runner/runner.view-model.ts` | Scoped answer/form/review state, input session cancellation, persistence status, submission guard and teardown |
| Result VM | `src/app/features/assessment-test/pages/result/result.view-model.ts` | Scoped result view/error state and latest-ID/retry loading |
| Browser recovery | `src/app/features/assessment-test/state/draft-storage.service.ts` | Stateless browser draft adapter with owned question/choice validation, timestamp checks and optional-storage fallback |
| Orchestration | `src/app/app.ts`, `src/app/features/assessment-test/pages/runner/runner.component.ts`, `src/app/features/assessment-test/pages/result/result.component.ts` | VM lifecycle, composition, outputs and view focus; no API injection |
| Presentation | `src/app/features/assessment-test/components/{catalog,runner,result,journey}/`, `pages/catalog/catalog.component.ts` | Inputs/outputs, inline HTML/SCSS and BEM classes; no HTTP or singleton mutation |
| Style foundations | `src/app/features/assessment-test/styles/_shared.scss`, `src/styles.scss` | Reusable foundation mixin emitting only requested BEM elements; standalone theme |

## Feature and test folders

The feature uses the same responsibility-based structure as the document editor MFE:

```text
src/app/
  app.ts                     # public federation composition entry point
  app.config.ts
  app.routes.ts
  features/assessment-test/
    api/                     # stateless HTTP client
    models/                  # DTO-derived UI models and subject metadata
    state/                   # singleton orchestration and draft adapter
    utils/                   # error mapping
    styles/                  # shared SCSS foundation
    pages/
      journey/               # journey view model used by App
      catalog/               # catalog composition
      runner/                # runner orchestration and view model
      result/                # result orchestration and view model
    components/
      journey/               # hero
      catalog/               # overview, subject, history and activity
      runner/                # progress, question and review
      result/                # summary and feedback
testing/app/
  app.spec.ts
  features/assessment-test/
    state/                   # store regression tests
    pages/runner/            # runner behavior tests
    pages/result/            # result behavior tests
```

Tests mirror application folders under `testing/app` and import production code
from `src/app`. See [testing guide](../testing/README.md) for discovery configuration.

Data flows from stateless API → singleton store → scoped VM → view. User intent
flows through component outputs → VM → store → API. Catalog is a presentation
composition layer; app/runner/result are orchestration components. VM signals keep
OnPush/zoneless rendering reactive. RxJS switchMap cancels replaceable reads,
concatMap serializes captured answer snapshots, and exhaustMap guards commands.

## Navigation and federation

Keep default App, named Routes, `ngx-seed-mfe`, `./Component` and `./Routes`.
Canonical routes are overview (default), subjects/:subjectId, history,
attempts/:attemptId, attempts/:attemptId/review and results/:attemptId.
Route data selects the view/review state; path parameters carry subject and attempt
identity. Legacy overview query selectors redirect to canonical paths while
preserving workshop context. Settled NavigationEnd snapshots are deduplicated.
Standalone bootstrap renders JourneyRootComponent's RouterOutlet using the same
exported Routes. App remains the federated journey component.
The host provides Router and HttpClient with session interceptors. Standalone
appConfig is not installed when the host loads the remote. Root styles establish
theme aliases inherited by child components; no remote theme is installed in the
shell. Scoped inline styles retain responsive behavior. View changes focus content.
Production webpack keeps module concatenation disabled for Angular federation.

## Data ownership and lifecycle

The service owns eligibility, ownership, validation and scoring. Catalog/history
are shared server snapshots; drafts/form/review/results display state are scoped
per view. Result reads go through the store and stay uncached to avoid stale
feedback. Root refresh/start command streams live until root injector teardown;
page subscriptions and runner requests end when their component is destroyed.
Changing runner input cancels its load/save/submission flow before a new session.

Start sends subject plus definition ID and refreshes catalog/history. The owned
questions endpoint establishes access before browser recovery. Sequential saves
send complete answer-slot arrays; captured IDs prevent saves targeting another
attempt. Recovery validates choice values/count and newer timestamps against the
owned attempt. Save failures retain answers and block submit/Save & exit until
retry. Browser recovery is optional and clears on completion. Submission requires
loaded, nonempty, fully answered questions and no pending/failed saves. A lost
submit response succeeds only if the owned result explicitly says completed.

Passing requires every answer correct; completion advances eligibility regardless
of passing. Proficiency is highest passed level. Accuracy weights all known
completed question counts. No retry, authorization or scoring rules changed.

## External contracts

Same-origin `/api/assessment-test`: catalog/history, start-test, attempt questions,
answers PATCH, submit-test and attempt result. Generated producer DTO archive
0.0.20 remains in vendor until registry publication. Subjects are arbitrary section
IDs with sectionTitle display snapshots. Federation exports remain compatible; legacy route URLs redirect;
no deployment or publication performed.

## Document section subjects — 2026-10-09

## Contract and rollout

Definitions save `subject` as the document section `_id` and `sectionTitle` as
its display title snapshot. New authoring reads document GET /navigation/sections
(map wrapper); production /api/documents, development localhost:3007. New forms
require selection. Existing subjects absent from the catalog retain their identity
and remain editable; they are not silently reassigned by matching a title.

Legacy persisted strings and attempts are unchanged. Missing display titles fall
back to the old subject. Titles refresh from current document sections when the
admin opens a definition, then save explicitly; used-definition protection still
applies. No background title synchronization or bulk migration is performed.
The service validates string shape, not section existence through a foreign DB.
Duplicate levels, eligibility and starts compare IDs. Subjects with no definitions
or attempts no longer create empty fixed-enum learner cards.

Generated contract 0.0.20 is built locally and vendored in both consumers. Release
owners deploy the service, publish/adopt the reviewed contract and release both
consumers together before enabling new subjects. Verify real Admin creation,
section load/error states and learner start/resume/history through hosted gateways.
No publication, deployment or production data changes were performed here.

## Workshop continuity — 2026-10-11

See [004 continuity](../specs/004-workshop-continuity/handoff.md). Workshop reader route is `/workshops/overview`, matching its executable Routes. Activities accept `returnTo` (validated to that reader route and workshop/page query keys) and `workshopName`. Assessments accept an exact `test` definition ID; labs accept an exact published `lab` ID. Activity navigation merges query context; return reloads the server catalog and restores the lesson. No automatic starts or altered completion policy. Host Router owns cross-remote navigation; no nested remotes.

## Multiple tests per level — 2026-10-11

The catalog displays each definition independently, including sibling tests at the
same level. Starting a row sends its exact definition ID. The service makes all
unattempted tests at unlocked levels available, locks new starts while a subject
has an unfinished attempt and unlocks the next consecutive level after any one
test is completed. Completing siblings does not skip levels. Catalog copy now
explains this policy. No DTO shape, federation or route changes were needed.
See [005 handoff](../specs/005-multiple-tests-per-level/handoff.md).

### Automatic workshop return
Workshop context now returns automatically on confirmed assignment submission: assessment finish or a completed coding-lab submit response. Return uses the validated workshop/page destination with replaceUrl. Save-only, failures and historical loads keep their current views; ordinary result navigation remains for assignments without workshop context. Workshop return reloads authoritative progress. Learner copy explains the automatic return.

### Direct workshop assignment links
Explicit resource links include `launch=direct`. After authoritative catalog/history loading, the scoped activity VM starts or resumes the exact eligible resource once, removes launch on internal navigation, and preserves returnTo/workshopName. Assessment completed references open saved results. Missing/locked resources and failed starts do not loop; explicit Refresh retries. This supersedes discovery-only entry for workshop assignment links. Ordinary discovery and placement remain available.

## Route-driven assessment states — 2026-10-11

See [006 routing](../specs/006-journey-routing/handoff.md). Owned history reconciles completed attempt links to results and unfinished results to the attempt route. Loading and errors stay on the requested route with existing retry actions. Attempts remain accessible when the subject catalog is empty; owned history/questions still gate the runner. Review initializes after owned questions load, restoring server answers or validated browser recovery. Returning from review carries question index as a query hint.

JourneyNavigation is a root UI coordinator holding active scoped VM guard callbacks only. Destruction clears callbacks. Route deactivation and activation on reused route params block pending/failed answer saves and submissions. Confirmed start/completion explicitly approve their transition. Runner beforeunload remains in place. Answers/form state stay scoped, HTTP stays in AssessmentApi, server data orchestration stays in AssessmentStore. Host ./Component-only consumers must supply equivalent route data and subjectId/attemptId parameters; mounting ./Routes provides the canonical contract.
