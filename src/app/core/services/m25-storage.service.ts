import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LEGACY_COUNT_KEY, STORAGE_KEY } from '../models/practice.models';

@Injectable({ providedIn: 'root' })
export class M25StorageService {
	private readonly document = inject(DOCUMENT);
	private readonly window = this.document.defaultView;

	readSnapshot(): string | null {
		return this.window?.localStorage.getItem(STORAGE_KEY) ?? null;
	}

	writeSnapshot(snapshot: string): void {
		this.window?.localStorage.setItem(STORAGE_KEY, snapshot);
		this.window?.localStorage.removeItem(LEGACY_COUNT_KEY);
	}

	readLegacyCount(): number {
		const storedCount = this.window?.localStorage.getItem(LEGACY_COUNT_KEY);
		if (storedCount == null) {
			return 0;
		}

		const parsedCount = Number.parseInt(storedCount, 10);
		return Number.isNaN(parsedCount) ? 0 : parsedCount;
	}
}