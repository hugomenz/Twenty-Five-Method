import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly window = this.document.defaultView;
  private readonly storageKey = 'twenty-five-method.count';
  private readonly maxCount = 25;
  private wakeLockSentinel: WakeLockSentinel | null = null;

  readonly count = signal(this.loadStoredCount());
  readonly isComplete = computed(() => this.count() === this.maxCount);
  readonly canIncrement = computed(() => this.count() < this.maxCount);

  constructor() {
    afterNextRender(() => {
      void this.requestWakeLock();

      this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
      this.destroyRef.onDestroy(() => {
        this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        void this.releaseWakeLock();
      });
    });
  }

  increment(): void {
    this.setCount(this.count() + 1);
  }

  decrement(): void {
    this.setCount(this.count() - 1);
  }

  reset(): void {
    if (!this.window?.confirm('Reset the counter?')) {
      return;
    }

    this.setCount(0);
  }

  private setCount(nextCount: number): void {
    const boundedCount = Math.min(nextCount, this.maxCount);

    this.count.set(boundedCount);
    this.window?.localStorage.setItem(this.storageKey, String(boundedCount));
  }

  private loadStoredCount(): number {
    const storedCount = this.window?.localStorage.getItem(this.storageKey);

    if (storedCount == null) {
      return 0;
    }

    const parsedCount = Number.parseInt(storedCount, 10);

    if (Number.isNaN(parsedCount)) {
      return 0;
    }

    return Math.min(parsedCount, this.maxCount);
  }

  private readonly handleVisibilityChange = (): void => {
    if (this.document.visibilityState === 'visible') {
      void this.requestWakeLock();
    }
  };

  private async requestWakeLock(): Promise<void> {
    const wakeLock = this.window?.navigator.wakeLock;

    if (!wakeLock || this.document.visibilityState === 'hidden') {
      return;
    }

    if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
      return;
    }

    try {
      const sentinel = await wakeLock.request('screen');
      sentinel.addEventListener?.('release', () => {
        this.wakeLockSentinel = null;
      });
      this.wakeLockSentinel = sentinel;
    } catch {
      this.wakeLockSentinel = null;
    }
  }

  private async releaseWakeLock(): Promise<void> {
    const sentinel = this.wakeLockSentinel;

    this.wakeLockSentinel = null;
    await sentinel?.release();
  }
}
