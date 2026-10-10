# Architecture — learner assessment journey

Updated 2026-10-09 for [002 MVVM refactor](../specs/002-mvvm-refactor/spec.md).
The learner remote discovers subjects, starts/resumes assessments, saves answers,
reviews/submits attempts and displays historical results/proficiency.

## Responsibility map

| Layer | Source | Responsibility |
| --- | --- | --- |
| Model/transport | `src/app/features/assessment-test/api/assessment-api.service.ts` | Stateless HttpClient requests using generated DTOs; no UI metadata, state or orchestration |
| Shared state | `src/app/features/assessment-test/state/assessment.store.ts` | Root singleton catalog/history and loading/error state; superseded refresh cancellation, duplicate start guard, captured-ID ordered saves and completed-result submit reconciliation |
| Journey VM | `src/app/features/assessment-test/pages/journey/journey.view-model.ts` | Scoped route query state, derived selection/active attempt, store commands and navigation |
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

Keep default App, named Routes, `ngx-seed-mfe`, `./Component`, `./Routes`, overview
route and query parameter navigation: `view=subject&subject=ANGULAR`,
`view=attempt&attempt=<owned-id>`, `view=result&attempt=<owned-id>`, `view=history`.
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
0.0.19 remains in vendor until registry publication. No endpoint/payload, package,
federation, gateway or schema changes. No deployment or publication performed.
