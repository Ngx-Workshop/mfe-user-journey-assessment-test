# Plan: composable assessment hero

Status: Complete · Spec: [spec.md](spec.md)

NgxHero owns text inputs, typography, responsive columns, decorative slot containers
and local/two-way pause state. `[heroBackground]` and `[heroArt]` select projected
components. Inherited `--ngx-hero-animation-play-state` connects the shared toggle
to component-local CSS animations. Each decoration honors reduced motion.

NgxJourneyHero becomes a compatibility composition of NgxHero, NgxHeroEmbers and
NgxHeroChapterArt; its existing inputs/pause signal/particle data remain available.
Assessment JourneyHeroComponent retains its selector, composes NgxHero and two local
OnPush inline/BEM components. Use namespaced shared colors with local theme mappings.
No API/store/VM dependencies or new subscriptions. All components remain near the
230-line guideline after splitting by layout/background/art responsibilities.

Build producer 21.0.3, vendor its archive into both remotes, install and retain only
related manifest/lockfile changes. Verify shared projection and pause state, assessment
composition, existing workshop motion tests, full remote suites, types, isolated
production builds and workshop architecture guard. Assessment has no architecture
script; inspect its source boundaries. No registry publication/deployment requested.
