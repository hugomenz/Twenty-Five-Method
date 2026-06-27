import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';
import { readInputValue } from '../../../shared/utils/dom-event.utils';

@Component({
	selector: 'm25-rhythm-builder-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './rhythm-builder-section.component.html',
	styleUrl: './settings-section.shared.scss',
})
export class RhythmBuilderSectionComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly blockOptions = this.labels.blockOptions;
	protected readonly preview = computed(() => this.labels.patternSymbols(this.state.patternDraftBlocks()));
	protected readonly customPatterns = computed(() => this.state.customPatterns().map((pattern) => ({
		id: pattern.id,
		name: this.labels.patternName(pattern),
		symbols: this.labels.patternSymbols(pattern.blocks),
	})));

	protected onPatternNameInput(event: Event): void {
		const value = readInputValue(event);
		if (value !== null) {
			this.state.setPatternDraftName(value);
		}
	}
}