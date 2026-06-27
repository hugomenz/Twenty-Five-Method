import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PracticeRecord } from '../../../core/models/practice.models';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';

@Component({
	selector: 'm25-history-list-view',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './history-list-view.component.html',
	styleUrl: './history-view.shared.scss',
})
export class HistoryListViewComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly records = this.state.practiceHistory;
	protected readonly hasRecords = computed(() => this.records().length > 0);

	protected title(record: PracticeRecord): string {
		return this.labels.practiceRecordTitle(record);
	}

	protected mode(record: PracticeRecord): string {
		return this.labels.practiceRecordMode(record.mode);
	}

	protected duration(record: PracticeRecord): string {
		return this.labels.formatDuration(record.activeDurationMs);
	}

	protected result(record: PracticeRecord): string {
		return this.labels.practiceRecordResult(record);
	}

	protected bpm(record: PracticeRecord): string {
		return record.bpm === null ? '—' : String(record.bpm);
	}

	protected openRecord(recordId: string): void {
		this.state.openPracticeRecord(recordId);
	}

	protected clearAll(): void {
		if (!globalThis.confirm(this.labels.historyClearAllConfirm(this.records().length))) {
			return;
		}

		this.state.clearPracticeHistory();
	}
}