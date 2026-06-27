export type AppMode = 'm25' | 'rhythms';
export type AppScreen = 'home' | 'practice' | 'routine-studio' | 'pattern-studio';
export type ErrorBehavior = 'decrement' | 'reset' | 'ignore';
export type BlockKind = 'quarter' | 'eighth' | 'sixteenth' | 'triplet';
export type RhythmSessionStatus = 'running' | 'paused' | 'complete';
export type PracticeSessionStatus = 'ready' | 'running' | 'paused' | 'completed' | 'cancelled';
export type PracticeRecordMode = 'm25' | 'rhythm';
export type PracticeRecordStatus = 'completed' | 'cancelled';
export type CompletionKind = 'm25' | 'rhythm-intermediate' | 'rhythm-final';
export type LanguageCode = 'en' | 'es' | 'de';
export type ThemeMode = 'dark' | 'light';
export type ButtonTone = 'soft' | 'solid' | 'outline';
export type ButtonShape = 'rounded' | 'pill' | 'square';

export interface SettingsState {
	target: number;
	allowNegative: boolean;
	m25ErrorBehavior: ErrorBehavior;
	rhythmErrorBehavior: ErrorBehavior;
	askTitleBeforeStart: boolean;
	askBpmBeforeStart: boolean;
	defaultPracticeTitle: string;
	defaultBpm: number | null;
	language: LanguageCode;
	theme: ThemeMode;
	buttonTone: ButtonTone;
	buttonShape: ButtonShape;
}

export interface PracticeSession {
	id: string;
	mode: AppMode;
	status: PracticeSessionStatus;
	title: string;
	bpm: number | null;
	startedAtMs: number | null;
	lastResumedAtMs: number | null;
	pausedAtMs: number | null;
	finishedAtMs: number | null;
	activeElapsedMs: number;
	pausedElapsedMs: number;
}

export interface PracticeRecord {
	id: string;
	mode: PracticeRecordMode;
	title: string;
	bpm: number | null;
	startedAtMs: number;
	finishedAtMs: number;
	activeDurationMs: number;
	pausedDurationMs: number;
	status: PracticeRecordStatus;
	target: number;
	finalValue: number;
	minimumValue: number;
	errorCount: number;
	positivePressCount: number;
	exerciseName: string;
}

export interface PracticeHistorySnapshot {
	version: number;
	records: PracticeRecord[];
}

export interface RhythmPattern {
	id: string;
	name: string;
	blocks: BlockKind[];
	builtIn: boolean;
}

export interface RoutineItem {
	patternId: string;
	repetitions: number;
}

export interface Routine {
	id: string;
	name: string;
	items: RoutineItem[];
}

export interface RhythmSessionItem {
	id: string;
	patternId: string;
	name: string;
	builtIn: boolean;
	blocks: BlockKind[];
	repetitions: number;
	count: number;
}

export interface RhythmSession {
	routineId: string | null;
	routineName: string;
	items: RhythmSessionItem[];
	currentIndex: number;
	status: RhythmSessionStatus;
}

export interface CompletionOverlayState {
	kind: CompletionKind;
	finalCount: number;
	repetitions: number;
	currentIndex: number;
	totalItems: number;
	routineName: string;
	rhythmName: string;
}

export interface PersistedState {
	settings: SettingsState;
	recentMode: AppMode;
	activeSession: PracticeSession | null;
	m25Count: number;
	activeRhythmSession: RhythmSession | null;
	routines: Routine[];
	customPatterns: RhythmPattern[];
}

export interface BlockOption {
	kind: BlockKind;
	label: string;
	symbol: string;
}

export interface PatternSummary {
	id: string;
	name: string;
	builtIn: boolean;
	blocks: BlockKind[];
	symbols: string;
}

export const STORAGE_KEY = 'm25.state';
export const PRACTICE_HISTORY_KEY = 'm25.history';
export const PRACTICE_HISTORY_VERSION = 1;
export const LEGACY_COUNT_KEY = 'twenty-five-method.count';
export const DEFAULT_REPETITIONS = 15;
export const MAX_PRACTICE_RECORDS = 200;

export const LANGUAGE_CODES = ['en', 'es', 'de'] as const;
export const THEME_MODES = ['dark', 'light'] as const;
export const BUTTON_TONES = ['soft', 'solid', 'outline'] as const;
export const BUTTON_SHAPES = ['rounded', 'pill', 'square'] as const;
export const ERROR_BEHAVIORS = ['decrement', 'reset', 'ignore'] as const;
export const BLOCK_KINDS = ['quarter', 'eighth', 'sixteenth', 'triplet'] as const;

export function createDefaultState(): PersistedState {
	return {
		settings: {
			target: 25,
			allowNegative: true,
			m25ErrorBehavior: 'decrement',
			rhythmErrorBehavior: 'decrement',
			askTitleBeforeStart: true,
			askBpmBeforeStart: true,
			defaultPracticeTitle: '',
			defaultBpm: null,
			language: 'en',
			theme: 'dark',
			buttonTone: 'soft',
			buttonShape: 'rounded',
		},
		recentMode: 'm25',
		activeSession: null,
		m25Count: 0,
		activeRhythmSession: null,
		routines: [],
		customPatterns: [],
	};
}

export function isPracticeSessionStatus(value: string): value is PracticeSessionStatus {
	return ['ready', 'running', 'paused', 'completed', 'cancelled'].includes(value);
}

export function createId(prefix: string): string {
	const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return `${prefix}-${random}`;
}

export function clampToZero(value: number): number {
	return Math.max(0, value);
}

export function normalizePositiveInteger(value: number, fallback: number): number {
	if (!Number.isFinite(value)) {
		return fallback;
	}

	return Math.max(1, Math.trunc(value));
}

export function moveArrayItem<T>(items: readonly T[], index: number, direction: number): T[] {
	const nextIndex = index + direction;
	if (index < 0 || nextIndex < 0 || index >= items.length || nextIndex >= items.length) {
		return [...items];
	}

	const nextItems = [...items];
	const [entry] = nextItems.splice(index, 1);
	nextItems.splice(nextIndex, 0, entry);
	return nextItems;
}

export function isErrorBehavior(value: string): value is ErrorBehavior {
	return ERROR_BEHAVIORS.includes(value as ErrorBehavior);
}

export function isBlockKind(value: string): value is BlockKind {
	return BLOCK_KINDS.includes(value as BlockKind);
}

export function isLanguageCode(value: string): value is LanguageCode {
	return LANGUAGE_CODES.includes(value as LanguageCode);
}

export function isThemeMode(value: string): value is ThemeMode {
	return THEME_MODES.includes(value as ThemeMode);
}

export function isButtonTone(value: string): value is ButtonTone {
	return BUTTON_TONES.includes(value as ButtonTone);
}

export function isButtonShape(value: string): value is ButtonShape {
	return BUTTON_SHAPES.includes(value as ButtonShape);
}