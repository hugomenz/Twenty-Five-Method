import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { M25LabelsService } from './core/services/m25-labels.service';
import { M25StateService } from './core/services/m25-state.service';
import { M25WakeLockService } from './core/services/m25-wake-lock.service';
import { PracticeShellComponent } from './features/practice/practice-shell.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PracticeShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly labels = inject(M25LabelsService);
  private readonly state = inject(M25StateService);
  private readonly wakeLock = inject(M25WakeLockService);

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.state.settings().language;
      this.document.title = this.labels.dictionary().app.name;
    });

    afterNextRender(() => {
      this.wakeLock.start();
      this.destroyRef.onDestroy(() => {
        this.wakeLock.stop();
      });
    });
  }
}
