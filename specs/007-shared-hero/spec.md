# Composable assessment hero

Status: Complete · Created: 2026-10-12

FR-001 / AC-001: Shared layout supports independent background/art slots without
owning journey-specific decoration. Both assessment JourneyHeroComponent and the
library NgxJourneyHero compose it.
FR-002 / AC-002: Assessment retains learner copy and tags, uses a scanning-grid
background and assessment-sheet art distinct from workshop embers/chapter card.
FR-003 / AC-003: A single pause button pauses both effects; reduced-motion and
phone layouts remain usable. Decorations are hidden from assistive technology.
FR-004 / AC-004: Library and both remotes compile through packaged public exports.

No service, scoring, route, federation export or authentication changes.
Assumption: use native Angular projection slots, with CSS animation state inherited
by custom decorations; no predefined variant enum limits future designs.
