import { BlockKind, ButtonShape, ButtonTone, ErrorBehavior, LanguageCode, ThemeMode } from '../models/practice.models';

export interface LabelDictionary {
	app: {
		name: string;
		settingsTitle: string;
	};
	aria: {
		openSettings: string;
		closeSettings: string;
		goBack: string;
		minusButton: string;
		plusButton: string;
		moveUp: string;
		moveDown: string;
		moveLeft: string;
		moveRight: string;
		remove: string;
	};
	modes: {
		m25: string;
		rhythms: string;
	};
	status: {
		passageCompleted: string;
		rhythmCompleted: string;
		practiceCompleted: string;
		practicePaused: string;
		noActivePractice: string;
		noActivePracticeHelp: string;
	};
	actions: {
		goBack: string;
		openSettings: string;
		pause: string;
		resume: string;
		nextRhythm: string;
		resetPractice: string;
		startCurrentRoutine: string;
		prepareRoutine: string;
		buildRhythm: string;
		openM25: string;
		openRhythms: string;
		saveRoutine: string;
		saveRhythm: string;
		clear: string;
		load: string;
		start: string;
		delete: string;
	};
	sections: {
		general: string;
		m25: string;
		rhythms: string;
		routines: string;
		builder: string;
	};
	home: {
		eyebrow: string;
		title: string;
		subtitle: string;
		m25Description: string;
		rhythmsDescription: string;
		studioHint: string;
	};
	studio: {
		routineTitle: string;
		routineDescription: string;
		patternTitle: string;
		patternDescription: string;
	};
	fields: {
		target: string;
		allowNegative: string;
		minusAction: string;
		language: string;
		theme: string;
		buttonTone: string;
		buttonShape: string;
		name: string;
		repetitions: string;
	};
	options: {
		errorBehavior: Record<ErrorBehavior, string>;
		language: Record<LanguageCode, string>;
		theme: Record<ThemeMode, string>;
		buttonTone: Record<ButtonTone, string>;
		buttonShape: Record<ButtonShape, string>;
	};
	patterns: {
		blocks: Record<BlockKind, { label: string; symbol: string }>;
		presets: Record<string, string>;
		rhythmCount: string;
		rhythmPosition: string;
		targetValue: string;
		builderHint: string;
		routineHint: string;
		untitledRoutine: string;
		activeRoutine: string;
	};
	confirm: {
		resetPractice: string;
	};
}