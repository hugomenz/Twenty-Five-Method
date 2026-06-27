import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';

@Component({
	selector: 'm25-completion-overlay',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './completion-overlay.component.html',
	styleUrl: './completion-overlay.component.scss',
})
export class CompletionOverlayComponent {
	private readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly overlay = this.state.completionOverlay;
	protected readonly activeSession = this.state.activeSession;
	protected readonly confettiPieces = Array.from({ length: 18 }, (_, index) => index);
	protected readonly heading = computed(() => {
		const overlay = this.overlay();
		if (!overlay) {
			return '';
		}

		switch (overlay.kind) {
			case 'm25':
				return this.dictionary().completion.m25Heading;
			case 'rhythm-final':
				return this.dictionary().completion.routineHeading;
			default:
				return this.dictionary().completion.rhythmHeading;
		}
	});
	protected readonly countLabel = computed(() => {
		const overlay = this.overlay();
		if (!overlay) {
			return '';
		}

		return overlay.kind === 'rhythm-intermediate'
			? this.dictionary().completion.finalCount
			: this.dictionary().completion.result;
	});
	protected readonly countText = computed(() => {
		const overlay = this.overlay();
		if (!overlay) {
			return '';
		}

		if (overlay.kind === 'm25') {
			return this.labels.formatCount(overlay.finalCount);
		}

		return `${this.labels.formatCount(overlay.finalCount)} / ${overlay.repetitions}`;
	});
	protected readonly rhythmPosition = computed(() => {
		const overlay = this.overlay();
		if (!overlay || overlay.kind === 'm25') {
			return '';
		}

		return this.labels.rhythmPosition(overlay.currentIndex + 1, overlay.totalItems);
	});
	protected readonly completionSubtitle = computed(() => {
		const overlay = this.overlay();
		if (!overlay || overlay.kind === 'm25') {
			return '';
		}

		const currentItem = this.state.currentRhythmItem();
		if (currentItem) {
			return this.labels.patternName(currentItem);
		}

		return overlay.rhythmName;
	});
	protected readonly exerciseName = computed(() => {
		const session = this.activeSession();
		if (!session || session.mode === 'm25') {
			return '';
		}

		const rhythmSession = this.state.activeRhythmSession();
		const routineName = rhythmSession?.routineName.trim() ?? '';
		if (routineName) {
			return this.labels.routineName(routineName);
		}

		return this.labels.patternName(this.state.currentRhythmItem());
	});
	protected readonly showSummary = computed(() => {
		const overlay = this.overlay();
		const session = this.activeSession();
		return Boolean(overlay && overlay.kind !== 'rhythm-intermediate' && session?.status === 'completed');
	});
	protected readonly summaryRows = computed(() => {
		if (!this.showSummary()) {
			return [] as Array<{ label: string; value: string }>;
		}

		const session = this.activeSession();
		if (!session) {
			return [] as Array<{ label: string; value: string }>;
		}

		const rows: Array<{ label: string; value: string }> = [
			{ label: this.dictionary().completion.duration, value: this.labels.formatDuration(session.activeElapsedMs) },
			{ label: this.dictionary().completion.minimum, value: this.labels.formatCount(session.minimumValue) },
		];

		if (session.bpm !== null) {
			rows.splice(1, 0, { label: this.dictionary().fields.practiceBpm, value: String(session.bpm) });
		}

		const exerciseName = this.exerciseName();
		if (exerciseName) {
			rows.push({ label: this.dictionary().completion.exercise, value: exerciseName });
		}

		return rows;
	});

	protected repeat(): void {
		this.state.repeatM25Practice();
	}

	protected newPractice(): void {
		this.state.startNewM25Practice();
	}

	protected finish(): void {
		this.state.finishPractice();
	}

	protected nextRhythm(): void {
		this.state.advanceAfterCompletion();
	}

	protected repeatRhythm(): void {
		this.state.repeatCurrentRhythm();
	}

	protected repeatRoutine(): void {
		this.state.repeatRoutine();
	}
}
