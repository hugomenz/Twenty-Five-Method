import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	ElementRef,
	inject,
	output,
	viewChild,
} from '@angular/core';
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
	protected readonly settingsContext = computed<'general' | 'm25' | 'rhythms'>(() => {
		return this.state.currentScreen() === 'practice' ? this.state.currentMode() : 'general';
	});
	readonly requestClose = output<void>();
	readonly requestReset = output<void>();

	private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

	constructor() {
		afterNextRender(() => {
			const dialog = this.dialogRef().nativeElement;
			if (typeof dialog.showModal === 'function') {
				if (!dialog.open) {
					dialog.showModal();
				}
			} else {
				// Graceful fallback when modal dialogs are unavailable.
				dialog.setAttribute('open', '');
				dialog.querySelector<HTMLElement>('.sheet-close')?.focus();
			}
		});
	}

	protected close(): void {
		const dialog = this.dialogRef().nativeElement;
		if (typeof dialog.close === 'function') {
			dialog.close();
		} else {
			dialog.removeAttribute('open');
			this.requestClose.emit();
		}
	}

	protected onDialogClick(event: MouseEvent): void {
		if (event.target === this.dialogRef().nativeElement) {
			this.close();
		}
	}
}