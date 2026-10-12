import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LearnerAttemptDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  AssessmentView,
  Subject,
  TestSelection,
} from './features/assessment-test/models/assessment.models';
import { JourneyViewModel } from './features/assessment-test/pages/journey/journey.view-model';
import { JourneyHeroComponent } from './features/assessment-test/components/journey/journey-hero.component';
import { CatalogComponent } from './features/assessment-test/pages/catalog/catalog.component';
import { RunnerComponent } from './features/assessment-test/pages/runner/runner.component';
import { ResultComponent } from './features/assessment-test/pages/result/result.component';

@Component({
  selector: 'ngx-seed-mfe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JourneyViewModel],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    JourneyHeroComponent,
    CatalogComponent,
    RunnerComponent,
    ResultComponent,
  ],
  template: `
    <div class="assessment-journey__journey">
      @if (view() !== 'attempt' && !vm.directLaunch()) {
        <ngx-journey-hero />
        <nav
          class="assessment-journey__journey-nav"
          aria-label="Assessment views"
        >
          <div>
            <button
              class="assessment-journey__nav-button"
              [class.assessment-journey__nav-button--active]="
                view() !== 'history' && view() !== 'result'
              "
              [attr.aria-current]="
                view() === 'overview' || view() === 'subject'
                  ? 'page'
                  : null
              "
              (click)="navigate('overview')"
            >
              <mat-icon>grid_view</mat-icon>Explore subjects</button
            ><button
              class="assessment-journey__nav-button"
              [class.assessment-journey__nav-button--active]="
                view() === 'history' || view() === 'result'
              "
              [attr.aria-current]="
                view() === 'history' || view() === 'result'
                  ? 'page'
                  : null
              "
              (click)="navigate('history')"
            >
              <mat-icon>history</mat-icon>History & proficiency
            </button>
          </div>
          <span
            >{{ completedCount() }} completed <i>·</i>
            {{ passedCount() }} passed</span
          >
        </nav>
      }
      <main
        #content
        tabindex="-1"
        [attr.aria-busy]="loading() || busy()"
      >
        @if (vm.returnTo()) {
          <section
            class="assessment-journey__workshop"
            aria-label="Workshop activity"
          >
            <div>
              <span>WORKSHOP ACTIVITY</span
              ><strong>{{ vm.workshopName() }}</strong>
              <p>
                Your place in the workshop is kept. After you submit,
                you’ll return to your workshop automatically.
              </p>
            </div>
            <button
              mat-stroked-button
              [disabled]="vm.busy() || view() === 'attempt'"
              (click)="vm.returnToWorkshop()"
            >
              <mat-icon>arrow_back</mat-icon>Return to workshop
            </button>
          </section>
        }
        @if (view() === 'subject' || view() === 'result') {
          <button
            class="assessment-journey__back"
            mat-button
            (click)="
              navigate(view() === 'result' ? 'history' : 'overview')
            "
          >
            <mat-icon>arrow_back</mat-icon
            >{{
              view() === 'result'
                ? 'Back to
      history'
                : 'All subjects'
            }}
          </button>
        }
        @if (loading() || vm.openingAssignment()) {
          <div class="assessment-journey__loading" role="status">
            <mat-progress-bar
              mode="indeterminate"
              aria-label="Loading assessments"
            />
            <p>Getting your learning journey ready…</p>
          </div>
        }
        @if (error()) {
          <div class="assessment-journey__error" role="alert">
            <mat-icon>error_outline</mat-icon>
            <div>
              <strong>We couldn’t complete that request</strong>
              <p>{{ error() }}</p>
              <button
                mat-button
                (click)="load()"
                [disabled]="loading()"
              >
                Refresh assessments
              </button>
            </div>
          </div>
        }
        @if (!loading() && !vm.openingAssignment()) {
          @if (view() === 'attempt') {
            @if (active(); as attempt) {
              @for (item of [attempt]; track item._id) {
                @if (item.completed) {
                  <ngx-assessment-result
                    [id]="item._id"
                    (back)="navigate('history')"
                    (nextSubject)="openSubject($event)"
                  />
                } @else {
                  <ngx-assessment-runner
                    [attempt]="item"
                    [reviewMode]="vm.reviewMode()"
                    [questionIndex]="vm.questionIndex()"
                    (reviewChange)="
                      vm.review($event.review, $event.question)
                    "
                    (finished)="finish($event)"
                    (exit)="exit()"
                  />
                }
              }
            } @else {
              <div class="assessment-journey__missing">
                <h2>Assessment unavailable</h2>
                <p>
                  This attempt couldn’t be found in your learning
                  record.
                </p>
                <button mat-button (click)="navigate('overview')">
                  Explore subjects
                </button>
              </div>
            }
          } @else if (view() === 'result' && attemptId()) {
            @for (id of [attemptId()!]; track id) {
              <ngx-assessment-result
                [id]="id"
                (back)="navigate('history')"
                (nextSubject)="openSubject($event)"
              />
            }
          } @else if (view() === 'subject' && !selected()) {
            <div class="assessment-journey__missing">
              <h2>Subject unavailable</h2>
              <button mat-button (click)="navigate('overview')">
                Explore subjects
              </button>
            </div>
          } @else {
            @if (vm.missingTest() && view() === 'subject') {
              <div class="assessment-journey__missing" role="status">
                <h2>Workshop assessment unavailable</h2>
                <p>
                  This assessment is no longer published for this
                  subject. Return to your workshop to continue.
                </p>
              </div>
            } @else {
              <ngx-learner-catalog
                [subjects]="subjects()"
                [attempts]="attempts()"
                [selected]="
                  view() === 'subject' ? vm.focusedSubject() : null
                "
                [history]="view() === 'history'"
                [busy]="busy()"
                (openSubject)="openSubject($event)"
                (openTest)="openTest($event)"
                (openAttempt)="openAttempt($event)"
              />
            }
          }
        }
      </main>
      <footer>
        <span>Small steps. Lasting understanding.</span
        ><span
          >NGX WORKSHOP
          <span class="assessment-journey__footer-dot">✦</span></span
        >
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        width: 100%;
        color: var(--ink);
        --ink: var(--mat-sys-on-surface);
        --muted: var(--mat-sys-on-surface-variant);
        --panel: var(--mat-sys-surface-container-lowest);
        --soft: var(--mat-sys-surface-container);
        --line: var(--mat-sys-outline-variant);
        --accent: var(--mat-sys-primary);
        --primary-soft: var(--mat-sys-primary-container);
        --on-primary-soft: var(--mat-sys-on-primary-container);
        --secondary-soft: var(--mat-sys-secondary-container);
        --on-secondary-soft: var(--mat-sys-on-secondary-container);
        --tertiary-soft: var(--mat-sys-tertiary-container);
        --on-tertiary-soft: var(--mat-sys-on-tertiary-container);
        --error-soft: var(--mat-sys-error-container);
        --on-error-soft: var(--mat-sys-on-error-container);
        font-family: 'Roboto', sans-serif;
      }
      * {
        box-sizing: border-box;
      }
      .assessment-journey__workshop {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 20px;
        margin-bottom: 28px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--primary-soft);
        color: var(--on-primary-soft);
      }
      .assessment-journey__workshop span {
        display: block;
        font-size: 10px;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
      }
      .assessment-journey__workshop strong {
        display: block;
        overflow-wrap: anywhere;
      }
      .assessment-journey__workshop p {
        margin-bottom: 0;
        font-size: 13px;
        line-height: 1.5;
      }
      @media (max-width: 600px) {
        .assessment-journey__workshop {
          flex-direction: column;
          align-items: flex-start;
        }
      }
      .assessment-journey__journey {
        min-height: 100%;
      }
      button {
        font-family: inherit;
        cursor: pointer;
      }
      button:disabled {
        cursor: default;
      }
      button:focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 4px;
      }
      .assessment-journey__journey-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        padding: 0 clamp(22px, 5vw, 65px);
        background: var(--panel);
        border-bottom: 1px solid var(--line);
      }
      .assessment-journey__journey-nav > div {
        display: flex;
        gap: 28px;
      }
      .assessment-journey__journey-nav button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 23px 0 20px;
        border: 0;
        border-bottom: 3px solid transparent;
        background: none;
        color: var(--muted);
        font-size: 12px;
        white-space: nowrap;
      }
      .assessment-journey__journey-nav
        button.assessment-journey__nav-button--active {
        border-color: var(--accent);
        color: var(--accent);
        font-weight: 650;
      }
      .assessment-journey__journey-nav mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
      }
      .assessment-journey__journey-nav > span {
        font-size: 10px;
        color: var(--muted);
        white-space: nowrap;
      }
      .assessment-journey__journey-nav i {
        padding: 0 8px;
        font-style: normal;
      }
      main {
        max-width: 1340px;
        margin: auto;
        padding: 38px clamp(22px, 5vw, 65px) 50px;
      }
      main:focus {
        outline: none;
      }
      .assessment-journey__back {
        margin: -15px 0 25px -10px;
        font-size: 12px;
      }
      .assessment-journey__loading {
        margin: 30px 0;
      }
      .assessment-journey__loading p {
        font-size: 13px;
        color: var(--muted);
      }
      .assessment-journey__error {
        display: flex;
        gap: 15px;
        padding: 20px;
        border-radius: 14px;
        background: var(--error-soft);
        color: var(--on-error-soft);
        margin-bottom: 22px;
        font-size: 13px;
      }
      .assessment-journey__error p {
        line-height: 1.5;
      }
      .assessment-journey__missing {
        padding: 40px 0;
      }
      footer {
        border-top: 1px solid var(--line);
        margin: 0 clamp(22px, 5vw, 65px);
        padding: 22px 0;
        display: flex;
        justify-content: space-between;
        color: var(--muted);
        font-size: 10px;
      }
      footer > span:last-child {
        font-size: 8px;
        letter-spacing: 1.5px;
      }
      .assessment-journey__footer-dot {
        padding-left: 10px;
        font-size: 14px;
        color: var(--accent);
      }
      @media (max-width: 900px) {
        .assessment-journey__journey-nav > span {
          display: none;
        }
      }
      @media (max-width: 600px) {
        .assessment-journey__journey-nav > div {
          width: 100%;
          gap: 18px;
        }
        .assessment-journey__journey-nav button {
          font-size: 11px;
          padding: 18px 0 15px;
        }
        main {
          padding-top: 30px;
        }
        footer {
          gap: 18px;
          line-height: 1.5;
        }
      }
    `,
  ],
})
export class App {
  readonly vm = inject(JourneyViewModel);
  readonly content = viewChild<ElementRef<HTMLElement>>('content');
  readonly subjects = this.vm.subjects;
  readonly attempts = this.vm.attempts;
  readonly loading = this.vm.loading;
  readonly busy = this.vm.busy;
  readonly error = this.vm.error;
  readonly view = this.vm.view;
  readonly subject = this.vm.subject;
  readonly attemptId = this.vm.attemptId;
  readonly selected = this.vm.selected;
  readonly active = this.vm.active;
  readonly completedCount = this.vm.completedCount;
  readonly passedCount = this.vm.passedCount;
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const injector = inject(Injector);
    effect(() => {
      const view = this.view();
      const subject = this.subject();
      const attempt = this.attemptId();
      afterNextRender(
        () => {
          // Ignore a superseded navigation callback.
          if (
            view !== this.view() ||
            subject !== this.subject() ||
            attempt !== this.attemptId()
          )
            return;
          (view === 'overview'
            ? host.nativeElement
            : this.content()?.nativeElement
          )?.scrollIntoView({ block: 'start' });
          this.content()?.nativeElement.focus({
            preventScroll: true,
          });
        },
        { injector }
      );
    });
  }
  load() {
    this.vm.load();
  }
  navigate(
    view: AssessmentView,
    subject: string | null = null,
    attempt: string | null = null
  ) {
    this.vm.navigate(view, subject, attempt);
  }
  openSubject(subject: Subject) {
    this.vm.openSubject(subject);
  }
  openTest(event: TestSelection) {
    this.vm.openTest(event);
  }
  openAttempt(attempt: LearnerAttemptDto) {
    this.vm.openAttempt(attempt);
  }
  finish(id: string) {
    this.vm.finish(id);
  }
  exit() {
    this.vm.exit();
  }
}
export default App;
