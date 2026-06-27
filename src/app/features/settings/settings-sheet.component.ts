import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { M25StateService } from '../../core/services/m25-state.service';
import { AppearanceSettingsSectionComponent } from './sections/appearance-settings-section.component';
import { M25SettingsSectionComponent } from './sections/m25-settings-section.component';
import { RhythmSettingsSectionComponent } from './sections/rhythm-settings-section.component';

@Component({
	selector: 'm25-settings-sheet',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		AppearanceSettingsSectionComponent,
		M25SettingsSectionComponent,
		RhythmSettingsSectionComponent,
	],
	templateUrl: './settings-sheet.component.html',
	styleUrl: './settings-sheet.component.scss',
})
export class SettingsSheetComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	readonly requestClose = output<void>();
	readonly requestReset = output<void>();
}