import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { renderRhythm } from './render-rhythm';
import type { RhythmPattern } from './rhythm-pattern.model';

@Component({
  selector: 'app-rhythm-notation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #host
      class="notation-host"
      [attr.aria-label]="pattern?.accessibleLabel ?? pattern?.name ?? 'Rhythm pattern'"
    ></div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .notation-host {
      width: 100%;
      height: clamp(7rem, 28dvh, 11rem);
      min-width: 0;
    }

    .notation-host :where(svg) {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `,
})
export class RhythmNotationComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) pattern: RhythmPattern | null = null;

  @ViewChild('host', { static: true })
  private hostRef!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;
  private frameId: number | null = null;
  private viewReady = false;
  private lastWidth = -1;

  ngAfterViewInit(): void {
    this.viewReady = true;
    const host = this.hostRef.nativeElement;

    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? host.clientWidth;
      if (Math.abs(width - this.lastWidth) < 1) return;
      this.lastWidth = width;
      this.scheduleRender();
    });
    this.resizeObserver.observe(host);
    this.scheduleRender();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pattern']) this.scheduleRender();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  private scheduleRender(): void {
    if (!this.viewReady || !this.pattern) return;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      const host = this.hostRef.nativeElement;
      renderRhythm(host, this.pattern!, {
        width: host.clientWidth,
        height: host.clientHeight,
      });
    });
  }
}
