# Handoff: composable hero

Status: Complete · Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior

`NgxHero` is a shared OnPush layout with typed copy/tags and independent
`[heroBackground]` / `[heroArt]` Angular projection slots. It owns typography,
responsive columns, aria-hidden decoration containers and a two-way motionPaused
model. Custom components consume the inherited CSS animation-play-state property
and implement reduced-motion CSS. `motionEnabled=false` omits the toggle for
static compositions. No background or art is built into this layout.

The library `NgxJourneyHero` composes that layout with `NgxHeroEmbers` and
`NgxHeroChapterArt`, preserving original inputs, motion signal and particle data.
Assessment `JourneyHeroComponent` composes the same layout with local scanning-grid
background and assessment-sheet artwork. Learner copy/tags and the assessment's
existing selector stay compatible. No store, route, API, scoring or provider changes.
The focused components remain within the approximate 230-line guidance.

## Verification

| Check | Result |
| --- | --- |
| Producer production build | PASS |
| Shared library Vitest suite | PASS: 6 tests |
| Assessment full ChromeHeadless suite | PASS: 41 tests |
| Workshop full ChromeHeadless suite | PASS: 17 tests |
| Workshop focused suite after computed motion assertions | PASS: 3 tests |
| Both isolated production builds (`dist/composable-hero-verification`) | PASS |
| Both source type/unused checks | PASS |
| Workshop architecture guard | PASS; pre-existing size notices |
| Assessment architecture | Manual source boundary review; no guard configured |
| Final archives vs installed runtime/declarations/manifests | Identical |
| Both desktop (1366px) and phone (390px) layouts | PASS: scrollWidth equals viewport width; art hidden on phone |
| Both reduced-motion layouts | PASS: background/toggle hidden; art animation none |

Rendered optimized standalone pages were visually reviewed at desktop/phone sizes.
Temporary local preview servers supplied static assets only; the pages displayed
expected unavailable-API errors beneath the heroes. This does not establish hosted
session/gateway behavior. Screenshots are local temporary evidence under
`/tmp/composable-hero-previews`; preview servers were stopped after verification.
The first direct screenshot run used Chrome's minimum window width; a CDP viewport
check replaced those phone images with true 390px captures. Projection tests verify
actual browser computed pause states across component encapsulation.

## Package and release handoff

Both consumers use `file:vendor/tmdjr-ngx-shared-headers-21.0.3.tgz`. Public exports
include NgxHero, NgxHeroEmbers, NgxHeroChapterArt and existing NgxJourneyHero /
NgxJourneyHeroTag / NgxParticleHeader. Angular common/core and Material peers remain
^21.1.0. No sibling-source paths or new federation singleton is required.

Registry publication/deployment was outside this request. A later registry release
must publish the producer before replacing the consumer file dependencies and
rechecking both builds. Local source implementation is complete. Unrelated lockfile
entries and previous workshop changes were preserved.

Architecture/development guides, feature indexes and producer API guide are updated.
