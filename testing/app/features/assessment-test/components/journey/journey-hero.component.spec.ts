import { TestBed } from '@angular/core/testing';
import { JourneyHeroComponent } from '../../../../../../src/app/features/assessment-test/components/journey/journey-hero.component';

describe('Assessment hero composition', () => {
  it('renders assessment copy with a custom background and assessment artwork', () => {
    const fixture = TestBed.createComponent(JourneyHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('header').length).toBe(1);
    expect(host.querySelector('h1')?.textContent).toContain('Know your skills.');
    expect(host.querySelector('h1')?.textContent).toContain('Shape what’s next.');
    expect(host.querySelector('p')?.textContent).toContain('find the gaps, and turn understanding into progress.');
    expect(host.querySelector('.journey-hero__hero-tags')?.textContent).toContain('Feedback that helps');
    const background = host.querySelector('.journey-hero__background')!;
    const art = host.querySelector('.journey-hero__hero-art')!;
    expect(background.querySelector('.assessment-backdrop__grid')).not.toBeNull();
    expect(art.querySelectorAll('.assessment-art__answer').length).toBe(3);
    expect(background.getAttribute('aria-hidden')).toBe('true');
    expect(art.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('.journey-hero__embers')).toBeNull();
    expect(host.querySelector('.journey-hero__art-bars')).toBeNull();
  });

  it('pauses and resumes both projected animations through the shared control', () => {
    const fixture = TestBed.createComponent(JourneyHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const scan = host.querySelector<HTMLElement>('.assessment-backdrop__scan')!;
    const art = host.querySelector<HTMLElement>('ngx-assessment-hero-art')!;
    const button = host.querySelector<HTMLButtonElement>('button')!;
    expect(getComputedStyle(scan).animationPlayState).toBe('running');
    expect(getComputedStyle(art).animationPlayState).toBe('running');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(getComputedStyle(scan).animationPlayState).toBe('paused');
    expect(getComputedStyle(art).animationPlayState).toBe('paused');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(getComputedStyle(scan).animationPlayState).toBe('running');
    expect(getComputedStyle(art).animationPlayState).toBe('running');
  });
});
