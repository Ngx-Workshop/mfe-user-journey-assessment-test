import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { LearnerResultDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import {
  AssessmentApi,
  apiError,
  subjectInfo,
  Subject,
} from './assessment-api.service';

@Component({
  selector: 'ngx-assessment-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent implements OnInit {
  readonly id = input.required<string>();
  readonly back = output<void>();
  readonly nextSubject = output<Subject>();
  readonly data = signal<LearnerResultDto | null>(null);
  readonly error = signal('');
  readonly loading = signal(true);
  readonly percentage = computed(() => {
    const a = this.data()?.attempt;
    return a?.questionCount
      ? Math.round((100 * a.score) / a.questionCount)
      : 0;
  });
  readonly info = subjectInfo;
  private readonly api = inject(AssessmentApi);
  private readonly destroy = inject(DestroyRef);
  ngOnInit() {
    this.load();
  }
  load() {
    this.error.set('');
    this.loading.set(true);
    this.api
      .result(this.id())
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (result) => {
          this.data.set(result);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(apiError(error));
          this.loading.set(false);
        },
      });
  }
}
