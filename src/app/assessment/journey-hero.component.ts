import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-journey-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
  <header class="assessment-hero__hero">
    <div class="assessment-hero__hero-copy">
      <div class="assessment-hero__hero-kicker">
        <span></span>THE ASSESSMENT STUDIO
      </div>
      <h1>Know your skills.<br /><em>Shape what’s next.</em></h1>
      <p>
        A little curiosity goes a long way. Explore your strengths,<br
          class="assessment-hero__desktop-break"
        />
        find the gaps, and turn understanding into progress.
      </p>
      <div class="assessment-hero__hero-tags">
        <span><mat-icon>schedule</mat-icon>At your own pace</span><span><mat-icon>insights</mat-icon>Feedback that helps</span>
      </div>
    </div>
    <div class="assessment-hero__hero-art" aria-hidden="true">
      <div class="assessment-hero__orb assessment-hero__orb--one"></div>
      <div class="assessment-hero__orb assessment-hero__orb--two"></div>
      <span class="assessment-hero__spark assessment-hero__spark--one">✦</span><span class="assessment-hero__spark assessment-hero__spark--two">✧</span>
      <div class="assessment-hero__art-card">
        <div class="assessment-hero__art-icon"><mat-icon>school</mat-icon></div>
        <span>YOUR NEXT CHAPTER</span>
        <div class="assessment-hero__art-bars">
          <i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="assessment-hero__art-line"></div>
        <div class="assessment-hero__art-line assessment-hero__art-line--short"></div>
      </div>
      <div class="assessment-hero__art-check"><mat-icon>check</mat-icon></div>
    </div>
  </header>
  `,
  styles: [`
:host { display: block; }
* { box-sizing: border-box; }
.assessment-hero__hero {
    padding: 45px clamp(22px, 5vw, 65px); display: grid; grid-template-columns: minmax(0, 1fr) 260px;
    gap: 35px; overflow: hidden; background: var(--soft); border-bottom: 1px solid var(--line);
  }
.assessment-hero__hero-kicker {
    display: flex; align-items: center; gap: 9px; font-size: 9px; font-weight: 750;
    letter-spacing: 2.5px; color: var(--muted);
  }
.assessment-hero__hero-kicker > span { width: 6px; height: 6px; background: var(--soft); border-radius: 50%; }
h1 {
    font-size: clamp(32px, 4.5vw, 53px); font-weight: 500; letter-spacing: -2px; line-height: 1.13;
    margin: 23px 0 20px;
  }
h1 em { font-family: Georgia, serif; font-weight: 400; color: var(--accent); }
.assessment-hero__hero-copy p { color: var(--muted); font-size: 13px; line-height: 1.8; margin: 0; }
.assessment-hero__hero-tags { display: flex; gap: 25px; margin-top: 23px; color: var(--muted); font-size: 10px; }
.assessment-hero__hero-tags span { display: flex; gap: 6px; align-items: center; }
.assessment-hero__hero-tags mat-icon { font-size: 15px; width: 15px; height: 15px; }
.assessment-hero__hero-art { position: relative; display: grid; place-items: center; min-height: 240px; }
.assessment-hero__orb { position: absolute; border-radius: 50%; }
.assessment-hero__orb--one { background: var(--primary-soft); width: 210px; height: 210px; right: 0; top: 32px; }
.assessment-hero__orb--two { border: 1px solid var(--line); width: 235px; height: 235px; left: 0; top: 5px; }
.assessment-hero__art-card {
    position: relative; width: 156px; height: 187px; background: var(--panel);
    box-shadow: 0 16px 28px color-mix(in srgb, var(--mat-sys-shadow) 12%, transparent);
    border-radius: 15px; padding: 19px; transform: rotate(-9deg);
  }
.assessment-hero__art-icon {
    width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px;
    background: var(--primary-soft); color: var(--on-primary-soft); margin-bottom: 13px;
  }
.assessment-hero__art-card > span { font-size: 6px; letter-spacing: 1px; color: var(--muted); }
.assessment-hero__art-bars { display: flex; align-items: flex-end; gap: 7px; height: 50px; margin: 12px 0; }
.assessment-hero__art-bars i { width: 18px; background: var(--primary-soft); border-radius: 4px 4px 0 0; height: 25%; }
.assessment-hero__art-bars i:nth-child(2) { height: 44%; }
.assessment-hero__art-bars i:nth-child(3) {
    height: 58%; background: color-mix(in srgb, var(--accent) 40%, var(--primary-soft));
  }
.assessment-hero__art-bars i:nth-child(4) {
    height: 76%; background: color-mix(in srgb, var(--accent) 70%, var(--primary-soft));
  }
.assessment-hero__art-bars i:nth-child(5) { height: 100%; background: var(--accent); }
.assessment-hero__art-line { height: 4px; border-radius: 4px; background: var(--soft); width: 100%; margin-top: 7px; }
.assessment-hero__art-line.assessment-hero__art-line--short { width: 65%; }
.assessment-hero__art-check {
    position: absolute; bottom: 40px; right: 20px; width: 44px; height: 44px; display: grid;
    place-items: center; background: var(--accent); color: var(--mat-sys-on-primary);
    border: 5px solid var(--line); border-radius: 50%;
  }
.assessment-hero__spark { position: absolute; color: var(--accent); }
.assessment-hero__spark--one { top: 10px; right: 35px; font-size: 28px; }
.assessment-hero__spark--two { bottom: 22px; left: 15px; font-size: 33px; }
@media (max-width: 900px) {
.assessment-hero__hero { grid-template-columns: minmax(0, 1fr) 190px; gap: 20px; }
.assessment-hero__hero-art { transform: scale(0.8); transform-origin: center; }
.assessment-hero__hero { padding-top: 32px; padding-bottom: 32px; }
}
@media (max-width: 600px) {
.assessment-hero__hero { grid-template-columns: 1fr; gap: 0; }
.assessment-hero__hero-art { display: none; }
h1 { font-size: 36px; }
.assessment-hero__hero-tags { gap: 15px; }
.assessment-hero__desktop-break { display: none; }
.assessment-hero__hero-copy p { font-size: 12px; }
}  `],
})
export class JourneyHeroComponent {}
