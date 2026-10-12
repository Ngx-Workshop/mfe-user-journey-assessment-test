import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngx-assessment-hero-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="assessment-backdrop__grid">
      <div class="assessment-backdrop__scan"></div>
      <div class="assessment-backdrop__halo"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      inset: 0;
    }
    .assessment-backdrop__grid {
      position: absolute;
      inset: 0;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent 30%, #000 100%);
      background-image:
        linear-gradient(color-mix(in srgb, var(--mat-sys-primary) 8%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--mat-sys-primary) 8%, transparent) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .assessment-backdrop__scan {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 35%,
        color-mix(in srgb, var(--mat-sys-tertiary) 16%, transparent) 50%, transparent 65%);
      animation: assessment-scan 9s ease-in-out infinite alternate;
      animation-play-state: var(--ngx-hero-animation-play-state, running);
    }
    .assessment-backdrop__halo {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 85% 50%,
        color-mix(in srgb, var(--mat-sys-primary) 14%, transparent), transparent 65%);
    }
    @keyframes assessment-scan {
      from { transform: translateY(-45%); }
      to { transform: translateY(45%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .assessment-backdrop__scan { animation: none; }
    }
  `,
})
export class AssessmentHeroBackgroundComponent {}
