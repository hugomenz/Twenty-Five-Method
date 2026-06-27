import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { M25LabelsService } from '../../core/services/m25-labels.service';
import { AppearanceSettingsSectionComponent } from './sections/appearance-settings-section.component';
import { M25SettingsSectionComponent } from './sections/m25-settings-section.component';
import { ModeSettingsSectionComponent } from './sections/mode-settings-section.component';
import { RhythmBuilderSectionComponent } from './sections/rhythm-builder-section.component';
import { RhythmSettingsSectionComponent } from './sections/rhythm-settings-section.component';
import { RoutineEditorSectionComponent } from './sections/routine-editor-section.component';

@Component({
	selector: 'm25-settings-sheet',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ModeSettingsSectionComponent,
		AppearanceSettingsSectionComponent,
		M25SettingsSectionComponent,
		RhythmSettingsSectionComponent,
		RoutineEditorSectionComponent,
		RhythmBuilderSectionComponent,
	],
	templateUrl: './settings-sheet.component.html',
	styleUrl: './settings-sheet.component.scss',
})
export class SettingsSheetComponent {
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	readonly requestClose = output<void>();
	readonly requestReset = output<void>();
}