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
		dismiss: string;
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
		practiceReady: string;
		practiceCancelled: string;
		noActivePractice: string;
		noActivePracticeHelp: string;
	};
	start: {
		heading: string;
		subtitle: string;
		startButton: string;
		bpmHint: string;
	};
	pause: {
		heading: string;
		subtitle: string;
		continueButton: string;
		finishButton: string;
	};
	cancel: {
		heading: string;
		subtitle: string;
		keepPractising: string;
		finishAndSave: string;
	};
	coaching: {
		negativeHeading: string;
		negativeSubtitle: string;
		negativeBpmHeading: string;
		negativeBpmSubtitle: string;
		lowerBpmButton: string;
		continueButton: string;
		finishAndRestButton: string;
		restartWithBpmButton: string;
		suggestedBpm: string;
	};
	completion: {
		m25Heading: string;
		rhythmHeading: string;
		routineHeading: string;
		finalCount: string;
		result: string;
		duration: string;
		minimum: string;
		exercise: string;
		celebration: string;
	};
	actions: {
		goBack: string;
		openSettings: string;
		openHistory: string;
		pause: string;
		resume: string;
		nextRhythm: string;
		repeat: string;
		newPractice: string;
		finish: string;
		repeatRhythm: string;
		repeatRoutine: string;
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
		deleteAll: string;
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
		askTitleBeforeStart: string;
		askBpmBeforeStart: string;
		practiceTitle: string;
		practiceBpm: string;
		version: string;
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
	feedback: {
		routineSaved: string;
		routineDeleted: string;
		routineIncomplete: string;
		patternSaved: string;
		patternDeleted: string;
		patternIncomplete: string;
		practiceStarted: string;
		practiceReset: string;
	};
	history: {
		title: string;
		recentFirst: string;
		emptyTitle: string;
		emptyDescription: string;
		date: string;
		mode: string;
		startedAt: string;
		finishedAt: string;
		status: string;
		target: string;
		pausedDuration: string;
		errors: string;
		positivePresses: string;
		deleteConfirm: string;
		clearAllConfirm: string;
	};
}