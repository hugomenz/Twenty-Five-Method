import { Injectable, signal } from '@angular/core';

export type FeedbackKind = 'success' | 'error' | 'info';

/** Translation keys for feedback messages, resolved by the toast component. */
export type FeedbackKey =
	| 'routineSaved'
	| 'routineDeleted'
	| 'routineIncomplete'
	| 'patternSaved'
	| 'patternDeleted'
	| 'patternIncomplete'
	| 'practiceStarted'
	| 'practiceReset';

export interface FeedbackMessage {
	id: number;
	kind: FeedbackKind;
	key: FeedbackKey;
}

const DEFAULT_DURATION_MS = 3200;

/**
 * Small transient-notification store. Components render the messages and the
 * toast component localizes each `key`. Messages auto-dismiss and can be closed
 * manually. Notify only after an operation has actually completed.
 */
@Injectable({ providedIn: 'root' })
export class M25FeedbackService {
	private readonly messageList = signal<FeedbackMessage[]>([]);
	readonly messages = this.messageList.asReadonly();

	private nextId = 1;
	private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

	notify(kind: FeedbackKind, key: FeedbackKey, durationMs = DEFAULT_DURATION_MS): void {
		const id = this.nextId;
		this.nextId += 1;
		this.messageList.update((list) => [...list, { id, kind, key }]);

		if (typeof setTimeout === 'function' && durationMs > 0) {
			this.timers.set(
				id,
				setTimeout(() => this.dismiss(id), durationMs),
			);
		}
	}

	dismiss(id: number): void {
		const timer = this.timers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.timers.delete(id);
		}
		this.messageList.update((list) => list.filter((message) => message.id !== id));
	}

	clear(): void {
		for (const timer of this.timers.values()) {
			clearTimeout(timer);
		}
		this.timers.clear();
		this.messageList.set([]);
	}
}
