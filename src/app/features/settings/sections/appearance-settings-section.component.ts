import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_VERSION } from '../../../core/app-version';
import {
	BUTTON_SHAPES,
	BUTTON_TONES,
	isButtonShape,
	isButtonTone,
	isLanguageCode,
	isThemeMode,
	LANGUAGE_CODES,
	THEME_MODES,
} from '../../../core/models/practice.models';
import { M25LabelsService } from '../../../core/services/m25-labels.service';
import { M25StateService } from '../../../core/services/m25-state.service';
import { readCheckedValue, readInputValue, readSelectValue } from '../../../shared/utils/dom-event.utils';

@Component({
	selector: 'm25-appearance-settings-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './appearance-settings-section.component.html',
	styleUrl: './settings-section.shared.scss',
})
export class AppearanceSettingsSectionComponent {
	protected readonly state = inject(M25StateService);
	protected readonly labels = inject(M25LabelsService);
	protected readonly dictionary = this.labels.dictionary;
	protected readonly appVersion = APP_VERSION;
	protected readonly languages = LANGUAGE_CODES;
	protected readonly themes = THEME_MODES;
	protected readonly buttonTones = BUTTON_TONES;
	protected readonly buttonShapes = BUTTON_SHAPES;

	protected onLanguageChange(event: Event): void {
		const value = readSelectValue(event);
		if (value && isLanguageCode(value)) {
			this.state.setLanguage(value);
		}
	}

	protected onThemeChange(event: Event): void {
		const value = readSelectValue(event);
		if (value && isThemeMode(value)) {
			this.state.setTheme(value);
		}
	}

	protected onButtonToneChange(event: Event): void {
		const value = readSelectValue(event);
		if (value && isButtonTone(value)) {
			this.state.setButtonTone(value);
		}
	}

	protected onButtonShapeChange(event: Event): void {
		const value = readSelectValue(event);
		if (value && isButtonShape(value)) {
			this.state.setButtonShape(value);
		}
	}

	protected onAskTitleChange(event: Event): void {
		const checked = readCheckedValue(event);
		if (checked !== null) {
			this.state.setAskTitleBeforeStart(checked);
		}
	}

	protected onAskBpmChange(event: Event): void {
		const checked = readCheckedValue(event);
		if (checked !== null) {
			this.state.setAskBpmBeforeStart(checked);
		}
	}

	protected onDefaultTitleInput(event: Event): void {
		const value = readInputValue(event);
		if (value !== null) {
			this.state.setDefaultPracticeTitle(value);
		}
	}

	protected onDefaultBpmInput(event: Event): void {
		const value = readInputValue(event);
		if (value === null || value.trim() === '') {
			this.state.setDefaultBpm(null);
			return;
		}

		const bpm = Number(value);
		this.state.setDefaultBpm(Number.isFinite(bpm) ? bpm : null);
	}
}