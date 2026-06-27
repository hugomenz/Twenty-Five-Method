import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ERROR_BEHAVIORS, isErrorBehavior } from '../../../core/models/practice.models';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';
import { readSelectValue } from '../../../shared/utils/dom-event.utils';

@Component({
	selector: 'm25-rhythm-settings-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './rhythm-settings-section.component.html',
	styleUrl: './settings-section.shared.scss',
})
export class RhythmSettingsSectionComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly errorBehaviors = ERROR_BEHAVIORS;
	readonly requestReset = output<void>();

	protected onErrorBehaviorChange(event: Event): void {
		const value = readSelectValue(event);
		if (value && isErrorBehavior(value)) {
			this.state.setRhythmErrorBehavior(value);
		}
	}
}