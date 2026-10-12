import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-assessment-hero-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="assessment-art__orbit"></div>
    <div class="assessment-art__sheet">
      <div class="assessment-art__heading">
        <mat-icon>school</mat-icon><span>YOUR NEXT CHAPTER</span>
      </div>
      <div class="assessment-art__rule"></div>
      @for (row of rows; track row) {
        <div class="assessment-art__answer">
          <span class="assessment-art__choice"><mat-icon>check</mat-icon></span>
          <span class="assessment-art__line" [style.width.%]="row"></span>
        </div>
      }
      <div class="assessment-art__footnote"></div>
    </div>
    <div class="assessment-art__badge"><mat-icon>psychology</mat-icon></div>
    <span class="assessment-art__spark">✧</span>
  `,
  styles: `
    :host {
      position: relative;
      display: grid;
      place-items: center;
      width: 260px;
      height: 240px;
      animation: assessment-art-float 8s ease-in-out infinite;
      animation-play-state: var(--ngx-hero-animation-play-state, running);
    }
    * { box-sizing: border-box; }
    .assessment-art__orbit {
      position: absolute;
      width: 220px;
      height: 220px;
      border: 1px dashed var(--line);
      border-radius: 50%;
      background: radial-gradient(circle,
        var(--primary-soft), transparent 70%);
    }
    .assessment-art__sheet {
      position: relative;
      width: 164px;
      height: 194px;
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      box-shadow: 0 16px 28px color-mix(in srgb, var(--mat-sys-shadow) 12%, transparent);
      transform: rotate(7deg);
    }
    .assessment-art__heading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--accent);
    }
    .assessment-art__heading > span {
      font-size: 6px;
      letter-spacing: 1px;
      line-height: 1.6;
      color: var(--muted);
    }
    .assessment-art__rule {
      height: 1px;
      background: var(--line);
      margin: 16px 0;
    }
    .assessment-art__answer {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 14px 0;
    }
    .assessment-art__choice {
      display: grid;
      place-items: center;
      flex: 0 0 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary-soft);
      color: var(--on-primary-soft);
    }
    .assessment-art__choice mat-icon {
      width: 13px;
      height: 13px;
      font-size: 13px;
    }
    .assessment-art__line {
      height: 5px;
      border-radius: 4px;
      background: var(--soft);
    }
    .assessment-art__footnote {
      width: 60%;
      height: 4px;
      border-radius: 4px;
      background: var(--primary-soft);
      margin-top: 18px;
    }
    .assessment-art__badge {
      position: absolute;
      right: 14px;
      bottom: 25px;
      display: grid;
      place-items: center;
      width: 54px;
      height: 54px;
      border: 5px solid var(--soft);
      border-radius: 50%;
      background: var(--accent);
      color: var(--mat-sys-on-primary);
      transform: rotate(-12deg);
    }
    .assessment-art__spark {
      position: absolute;
      top: 2px;
      left: 12px;
      font-size: 32px;
      color: var(--accent);
    }
    @keyframes assessment-art-float {
      0%, 100% { translate: 0 3px; }
      50% { translate: 0 -6px; }
    }
    @media (prefers-reduced-motion: reduce) {
      :host { animation: none; }
    }
  `,
})
export class AssessmentHeroArtComponent {
  readonly rows = [65, 50, 60];
}
