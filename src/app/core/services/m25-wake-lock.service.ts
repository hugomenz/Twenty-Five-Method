import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class M25WakeLockService {
	private readonly document = inject(DOCUMENT);
	private readonly window = this.document.defaultView;
	private wakeLockSentinel: WakeLockSentinel | null = null;
	private attached = false;

	start(): void {
		if (this.attached) {
			return;
		}

		this.attached = true;
		this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
		void this.requestWakeLock();
	}

	stop(): void {
		if (!this.attached) {
			return;
		}

		this.attached = false;
		this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
		void this.releaseWakeLock();
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