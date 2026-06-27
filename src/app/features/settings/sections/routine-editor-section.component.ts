import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';
import { readInputValue } from '../../../shared/utils/dom-event.utils';

@Component({
	selector: 'm25-routine-editor-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './routine-editor-section.component.html',
	styleUrl: './settings-section.shared.scss',
})
export class RoutineEditorSectionComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly availablePatterns = computed(() => this.state.allPatterns().map((pattern) => ({
		id: pattern.id,
		name: this.labels.patternName(pattern),
		symbols: this.labels.patternSymbols(pattern.blocks),
	})));
	protected readonly routineDraftItems = computed(() => this.state.routineDraftItems().map((item) => {
		const pattern = this.state.findPattern(item.patternId);
		return {
			patternId: item.patternId,
			repetitions: item.repetitions,
			name: this.labels.patternName(pattern),
			symbols: this.labels.patternSymbols(pattern?.blocks ?? []),
		};
	}));
	protected readonly savedRoutines = computed(() => this.state.routines().map((routine) => ({
		id: routine.id,
		name: this.labels.routineName(routine.name),
		rhythmCount: this.labels.rhythmCount(routine.items.length),
	})));

	protected onDraftNameInput(event: Event): void {
		const value = readInputValue(event);
		if (value !== null) {
			this.state.setRoutineDraftName(value);
		}
	}

	protected onRepetitionsInput(index: number, event: Event): void {
		const value = readInputValue(event);
		if (value !== null) {
			this.state.setRoutineItemRepetitions(index, Number(value));
		}
	}
}