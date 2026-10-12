import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngx-seed-mfe', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet], template: '<router-outlet />',
})
export class JourneyRootComponent {}
