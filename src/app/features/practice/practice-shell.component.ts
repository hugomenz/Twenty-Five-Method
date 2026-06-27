import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';
import { M25PracticeViewComponent } from './views/m25-practice-view.component';
import { RhythmPracticeViewComponent } from './views/rhythm-practice-view.component';
import { SettingsSheetComponent } from '../settings/settings-sheet.component';

@Component({
	selector: 'm25-practice-shell',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [M25PracticeViewComponent, RhythmPracticeViewComponent, SettingsSheetComponent],
	templateUrl: './practice-shell.component.html',
	styleUrl: './practice-shell.component.scss',
})
export class PracticeShellComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly isM25Mode = computed(() => this.state.currentMode() === 'm25');

	protected confirmReset(): void {
		if (!globalThis.confirm(this.dictionary().confirm.resetPractice)) {
			return;
		}

		this.state.resetCurrentPractice();
	}
}