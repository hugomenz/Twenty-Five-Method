import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';

@Component({
	selector: 'm25-history-detail-view',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './history-detail-view.component.html',
	styleUrl: './history-view.shared.scss',
})
export class HistoryDetailViewComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly record = this.state.selectedPracticeRecord;
	protected readonly title = computed(() => {
		const record = this.record();
		return record ? this.labels.practiceRecordTitle(record) : this.dictionary().history.title;
	});
	protected readonly result = computed(() => {
		const record = this.record();
		return record ? this.labels.practiceRecordResult(record) : '';
	});
	protected readonly exercise = computed(() => {
		const record = this.record();
		return record ? this.labels.practiceRecordExerciseName(record) : '';
	});

	protected deleteRecord(): void {
		const record = this.record();
		if (!record) {
			return;
		}

		if (!globalThis.confirm(this.dictionary().history.deleteConfirm)) {
			return;
		}

		this.state.deletePracticeRecord(record.id);
	}
}