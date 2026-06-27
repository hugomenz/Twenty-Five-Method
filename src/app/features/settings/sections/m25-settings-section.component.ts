import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ERROR_BEHAVIORS, isErrorBehavior } from '../../../core/models/practice.models';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';
import { readCheckedValue, readInputValue, readSelectValue } from '../../../shared/utils/dom-event.utils';

@Component({
	selector: 'm25-m25-settings-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './m25-settings-section.component.html',
	styleUrl: './settings-section.shared.scss',
})
export class M25SettingsSectionComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly errorBehaviors = ERROR_BEHAVIORS;
	readonly requestReset = output<void>();

	protected onTargetInput(event: Event): void {
		const value = readInputValue(event);
		if (value !== null) {
			this.state.setTarget(Number(value));
		}
	}

	protected onAllowNegativeChange(event: Event): void {
		const checked = readCheckedValue(event);
		if (checked !== null) {
			this.state.setAllowNegative(checked);
		}
	}

	protected onErrorBehaviorChange(event: Event): void {
		const value = readSelectValue(event);
		if (value && isErrorBehavior(value)) {
			this.state.setM25ErrorBehavior(value);
		}
	}
}