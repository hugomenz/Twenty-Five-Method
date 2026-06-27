import { isPlatformBrowser } from '@angular/common';
import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	PLATFORM_ID,
	signal,
	viewChild,
} from '@angular/core';
import { BlockKind } from '../../core/models/practice.models';
import { renderRhythm } from '../../core/notation/render-rhythm';
import { blocksToNotation } from '../../core/notation/rhythm-transform';

/**
 * Presentational notation component. Inputs are plain rhythm data; the component
 * owns only the empty VexFlow host, redraws on input or width changes, and
 * cleans up its observer and queued frame on destroy.
 */
@Component({
	selector: 'm25-rhythm-notation',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div
		#host
		class="notation-host"
		role="img"
		[attr.aria-label]="accessibleLabel()"
	></div>`,
	styleUrl: './rhythm-notation.component.scss',
})
export class RhythmNotationComponent {
	private readonly platformId = inject(PLATFORM_ID);
	private readonly destroyRef = inject(DestroyRef);
	private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');

	readonly blocks = input.required<readonly BlockKind[]>();
	readonly accessibleLabel = input<string>('');

	private readonly notation = computed(() => blocksToNotation(this.blocks()));
	private readonly viewReady = signal(false);
	private resizeObserver: ResizeObserver | null = null;
	private frameId: number | null = null;
	private lastWidth = -1;

	constructor() {
		effect(() => {
			// Re-render whenever the pattern, label, or readiness changes.
			this.notation();
			this.accessibleLabel();
			if (this.viewReady()) {
				this.lastWidth = -1;
				this.scheduleRender();
			}
		});

		afterNextRender(() => {
			if (!isPlatformBrowser(this.platformId)) {
				return;
			}

			const host = this.hostRef().nativeElement;
			this.resizeObserver = new ResizeObserver((entries) => {
				const width = entries[0]?.contentRect.width ?? host.clientWidth;
				if (Math.abs(width - this.lastWidth) < 1) {
					return;
				}
				this.lastWidth = width;
				this.scheduleRender();
			});
			this.resizeObserver.observe(host);
			this.viewReady.set(true);
			this.scheduleRender();
		});

		this.destroyRef.onDestroy(() => {
			this.resizeObserver?.disconnect();
			this.resizeObserver = null;
			if (this.frameId !== null) {
				cancelAnimationFrame(this.frameId);
				this.frameId = null;
			}
		});
	}

	private scheduleRender(): void {
		if (!this.viewReady()) {
			return;
		}

		if (this.frameId !== null) {
			cancelAnimationFrame(this.frameId);
		}

		this.frameId = requestAnimationFrame(() => {
			this.frameId = null;
			const host = this.hostRef().nativeElement;
			renderRhythm(host, this.notation(), {
				width: host.clientWidth,
				height: host.clientHeight,
				accessibleLabel: this.accessibleLabel(),
			});
		});
	}
}
