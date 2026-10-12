import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxHero, NgxJourneyHeroTag } from '@tmdjr/ngx-shared-headers';
import { AssessmentHeroArtComponent } from './assessment-hero-art.component';
import { AssessmentHeroBackgroundComponent } from './assessment-hero-background.component';

@Component({
  selector: 'ngx-journey-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxHero, AssessmentHeroArtComponent, AssessmentHeroBackgroundComponent],
  template: `
    <ngx-hero
      kicker="THE ASSESSMENT STUDIO"
      title="Know your skills."
      subtitle="Shape what’s next."
      description="A little curiosity goes a long way. Explore your strengths,"
      descriptionContinuation="find the gaps, and turn understanding into progress."
      [tags]="tags"
    >
      <ngx-assessment-hero-background heroBackground />
      <ngx-assessment-hero-art heroArt />
    </ngx-hero>
  `,
  styles: `
    :host {
      display: block;
      --ngx-hero-ink: var(--ink);
      --ngx-hero-soft: var(--soft);
      --ngx-hero-panel: var(--panel);
      --ngx-hero-line: var(--line);
      --ngx-hero-muted: var(--muted);
      --ngx-hero-accent: var(--accent);
      --ngx-hero-primary-soft: var(--primary-soft);
      --ngx-hero-on-primary-soft: var(--on-primary-soft);
    }
  `,
})
export class JourneyHeroComponent {
  readonly tags: readonly NgxJourneyHeroTag[] = [
    { icon: 'schedule', label: 'At your own pace' },
    { icon: 'insights', label: 'Feedback that helps' },
  ];
}
