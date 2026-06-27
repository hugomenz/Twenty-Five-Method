import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';
import { RhythmNotationComponent } from '../../notation/rhythm-notation.component';

@Component({
	selector: 'm25-rhythm-practice-view',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RhythmNotationComponent],
	templateUrl: './rhythm-practice-view.component.html',
	styleUrl: './rhythm-practice-view.component.scss',
})
export class RhythmPracticeViewComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly currentItem = this.state.currentRhythmItem;
	protected readonly countLabel = computed(() => {
		const item = this.currentItem();
		if (!item) {
			return '';
		}

		return `${this.labels.formatCount(item.count)} / ${item.repetitions}`;
	});
	protected readonly actionLabel = computed(() => {
		switch (this.state.rhythmActionKind()) {
			case 'resume':
				return this.dictionary().actions.resume;
			case 'advance':
				return this.dictionary().actions.nextRhythm;
			case 'pause':
				return this.dictionary().actions.pause;
			default:
				return this.dictionary().actions.openSettings;
		}
	});
	protected readonly statusMessage = computed(() => {
		switch (this.state.rhythmStatusKind()) {
			case 'paused':
				return this.dictionary().status.practicePaused;
			case 'rhythm-complete':
				return this.dictionary().status.rhythmCompleted;
			case 'practice-complete':
				return this.dictionary().status.practiceCompleted;
			default:
				return '';
		}
	});
	protected readonly routineName = computed(() => this.labels.routineName(this.state.activeRhythmSession()?.routineName ?? ''));
	protected readonly patternName = computed(() => this.labels.patternName(this.currentItem()));
	protected readonly currentBlocks = computed(() => this.currentItem()?.blocks ?? []);
	protected readonly patternDescription = computed(() => this.labels.patternDescription(this.currentBlocks()));
	protected readonly rhythmPosition = computed(() => {
		const session = this.state.activeRhythmSession();
		if (!session) {
			return '';
		}

		return this.labels.rhythmPosition(session.currentIndex + 1, session.items.length);
	});
	protected openRoutineStudio(): void {
		this.state.openRoutineStudio();
	}

	protected openPatternStudio(): void {
		this.state.openPatternStudio();
	}
}