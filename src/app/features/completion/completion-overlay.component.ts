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
