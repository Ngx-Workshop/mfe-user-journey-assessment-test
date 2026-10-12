# Feature: Angular assessment journey routes
Status: Implemented; hosted integration pending · 2026-10-11

## Problem and scope
Assessment pages currently use view/subject/attempt query selectors under overview. Learners need direct routes and browser navigation for discovery, subject selection, history, answering, review and results. Update workshop links to the canonical subject route.

## Requirements and acceptance
- FR-001 / AC-001: overview (default), subjects/:subjectId, history, attempts/:attemptId, attempts/:attemptId/review and results/:attemptId select their own states on direct entry and reload under a host prefix.
- FR-002 / AC-002: Start/resume opens an attempt; review is navigable; standalone completion opens results; workshop completion returns to the saved lesson. Persisted completion determines attempt/result reconciliation.
- FR-003 / AC-003: Legacy overview query links redirect with context retained; unknown local paths recover to overview. Missing/locked subjects/tests/owned attempts retain honest recoverable states.
- FR-004 / AC-004: Pending/failed answer saves and submission block route exits and same-route parameter navigation. Saved answers/recovery survive review/reload. Browser Back uses guards.
- FR-005 / AC-005: Workshop placement/assignment links use subjects/:subjectId, retaining test, launch=direct, returnTo and workshopName; no assessment scoring or eligibility change.

## Boundaries and quality
Preserve App/Routes exports and federation compatibility, stateless HTTP/singleton store/scoped VM boundaries, owned-question gates, sequential autosaves and optional browser recovery. Loading and errors stay on requested routes. Question selection remains scoped runner state with a query hint when returning from review; mutable answers stay out of shared state. Host deployment/sign-in is a separate integration check.
