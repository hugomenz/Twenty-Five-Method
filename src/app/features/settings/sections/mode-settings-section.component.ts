import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';

@Component({
	selector: 'm25-mode-settings-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './mode-settings-section.component.html',
	styleUrl: './settings-section.shared.scss',
})
export class ModeSettingsSectionComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
}