import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';
import { readInputValue } from '../../shared/utils/dom-event.utils';

@Component({
	selector: 'm25-negative-coaching-dialog',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './negative-coaching-dialog.component.html',
	styleUrl: './session-dialog.shared.scss',
})
export class NegativeCoachingDialogComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly showBpmStep = this.state.negativeCoachingLowerBpmStepOpen;
	protected readonly suggestedBpm = this.state.suggestedLowerBpm;
	protected readonly bpm = signal(this.suggestedBpm() === null ? '' : String(this.suggestedBpm()));
	protected readonly bpmError = signal('');
	protected readonly title = computed(() => this.showBpmStep()
		? this.dictionary().coaching.negativeBpmHeading
		: this.dictionary().coaching.negativeHeading);

	protected continuePractice(): void {
		this.state.continueAfterNegativeCoaching();
	}

	protected openLowerBpmStep(): void {
		this.state.openNegativeCoachingLowerBpmStep();
	}

	protected finishAndRest(): void {
		this.state.finishAndRestAfterNegativeCoaching();
	}

	protected onBpmInput(event: Event): void {
		const value = readInputValue(event);
		if (value !== null) {
			this.bpm.set(value);
		}
	}

	protected restartWithBpm(): void {
		const parsedBpm = this.parseBpm(this.bpm());
		if (this.bpm().trim() !== '' && parsedBpm === null) {
			this.bpmError.set(this.dictionary().start.bpmHint);
			return;
		}

		this.bpmError.set('');
		this.state.restartPracticeWithLowerBpm(parsedBpm);
	}

	private parseBpm(rawValue: string): number | null {
		if (rawValue.trim() === '') {
			return null;
		}

		const bpm = Number(rawValue);
		if (!Number.isFinite(bpm) || bpm <= 0 || bpm > 400) {
			return null;
		}

		return Math.round(bpm);
	}
}