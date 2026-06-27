import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { BUILT_IN_RHYTHM_PATTERNS } from '../data/rhythm-presets';
import {
	AppMode,
	AppScreen,
	BlockKind,
	ButtonShape,
	ButtonTone,
	CompletionOverlayState,
	createDefaultState,
	createId,
	DEFAULT_REPETITIONS,
	ErrorBehavior,
	isBlockKind,
	isButtonShape,
	isButtonTone,
	isErrorBehavior,
	isLanguageCode,
	isPracticeSessionStatus,
	isThemeMode,
	LanguageCode,
	moveArrayItem,
	normalizePositiveInteger,
	PersistedState,
	PracticeSession,
	PracticeSessionStatus,
	RhythmPattern,
	RhythmSession,
	RhythmSessionItem,
	RhythmSessionStatus,
	Routine,
	RoutineItem,
	SettingsState,
	ThemeMode,
	clampToZero,
} from '../models/practice.models';
import { M25StorageService } from './m25-storage.service';
import { M25FeedbackService } from './m25-feedback.service';

@Injectable({ providedIn: 'root' })
export class M25StateService {
	private readonly storage = inject(M25StorageService);
	private readonly feedback = inject(M25FeedbackService);
	private readonly initialState = this.loadPersistedState();

	readonly activeSession = signal<PracticeSession | null>(this.initialState.activeSession);
	readonly cancelConfirmOpen = signal(false);
	readonly completionOverlay = signal<CompletionOverlayState | null>(null);
	readonly currentScreen = signal<AppScreen>(this.resolveInitialScreen(this.initialState));
	readonly screenHistory = signal<AppScreen[]>([]);
	readonly settingsOpen = signal(false);
	readonly settings = signal<SettingsState>(this.initialState.settings);
	readonly recentMode = signal<AppMode>(this.initialState.recentMode);
	readonly m25Count = signal(this.initialState.m25Count);
	readonly activeRhythmSession = signal<RhythmSession | null>(this.initialState.activeRhythmSession);
	readonly routines = signal<Routine[]>(this.initialState.routines);
	readonly customPatterns = signal<RhythmPattern[]>(this.initialState.customPatterns);
	readonly routineDraftName = signal('');
	readonly routineDraftItems = signal<RoutineItem[]>([]);
	readonly editingRoutineId = signal<string | null>(null);
	readonly patternDraftName = signal('');
	readonly patternDraftBlocks = signal<BlockKind[]>([]);
	readonly editingPatternId = signal<string | null>(null);

	readonly currentMode = computed(() => this.recentMode());
	readonly activeSessionStatus = computed(() => this.activeSession()?.status ?? null);
	readonly allPatterns = computed(() => [...BUILT_IN_RHYTHM_PATTERNS, ...this.customPatterns()]);
	readonly m25Completed = computed(() => this.m25Count() >= this.settings().target);
	readonly currentRhythmItem = computed(() => {
		const session = this.activeRhythmSession();
		if (!session) {
			return null;
		}

		return session.items[session.currentIndex] ?? null;
	});
	readonly rhythmCompleted = computed(() => {
		const item = this.currentRhythmItem();
		return item ? item.count >= item.repetitions : false;
	});
	readonly canUsePlus = computed(() => {
		if (this.completionOverlay()) {
			return false;
		}

		if (this.activeSessionStatus() !== 'running') {
			return false;
		}

		if (this.currentMode() === 'm25') {
			return this.m25Count() < this.settings().target;
		}

		const session = this.activeRhythmSession();
		const item = this.currentRhythmItem();
		return Boolean(session && item && session.status === 'running' && item.count < item.repetitions);
	});
	readonly canUseMinus = computed(() => {
		if (this.completionOverlay()) {
			return false;
		}

		if (this.activeSessionStatus() !== 'running') {
			return false;
		}

		if (this.currentMode() === 'm25') {
			return true;
		}

		return this.activeRhythmSession()?.status === 'running';
	});
	readonly hasActivePractice = computed(() => {
		const activeSession = this.activeSession();
		if (activeSession) {
			return activeSession.status === 'ready' || activeSession.status === 'running' || activeSession.status === 'paused';
		}

		if (this.currentMode() === 'm25') {
			return this.m25Count() !== 0;
		}

		return this.activeRhythmSession() !== null;
	});
	readonly rhythmActionKind = computed<'open-settings' | 'resume' | 'advance' | 'pause'>(() => {
		if (this.activeSessionStatus() === 'paused') {
			return 'resume';
		}

		const session = this.activeRhythmSession();
		if (!session || session.status === 'complete') {
			return 'open-settings';
		}

		if (this.rhythmCompleted()) {
			return session.currentIndex < session.items.length - 1 ? 'advance' : 'open-settings';
		}

		return 'pause';
	});
	readonly rhythmStatusKind = computed<'none' | 'paused' | 'rhythm-complete' | 'practice-complete'>(() => {
		if (this.activeSessionStatus() === 'paused') {
			return 'paused';
		}

		const session = this.activeRhythmSession();
		if (!session) {
			return 'none';
		}

		if (session.status === 'complete') {
			return 'practice-complete';
		}

		if (this.rhythmCompleted()) {
			return 'rhythm-complete';
		}

		return 'none';
	});

	constructor() {
		if (this.activeRhythmSession()) {
			this.recentMode.set('rhythms');
		}

		effect(() => {
			this.persistState();
		});
	}

	goBack(): void {
		this.settingsOpen.set(false);
		const history = this.screenHistory();
		const previousScreen = history.at(-1);

		if (!previousScreen) {
			this.currentScreen.set('home');
			return;
		}

		this.screenHistory.set(history.slice(0, -1));
		this.currentScreen.set(previousScreen);
	}

	goHome(): void {
		this.settingsOpen.set(false);
		this.screenHistory.set([]);
		this.currentScreen.set('home');
	}

	openPractice(mode?: AppMode): void {
		if (mode) {
			this.recentMode.set(mode);
		}

		this.navigateTo('practice', false);
	}

	openRoutineStudio(): void {
		this.navigateTo('routine-studio');
	}

	openPatternStudio(): void {
		this.navigateTo('pattern-studio');
	}

	openCancelConfirm(): void {
		if (!this.activeSession()) {
			return;
		}

		this.cancelConfirmOpen.set(true);
	}

	closeCancelConfirm(): void {
		this.cancelConfirmOpen.set(false);
	}

	toggleSettings(): void {
		this.settingsOpen.update((open) => !open);
	}

	openSettings(): void {
		this.settingsOpen.set(true);
	}

	closeSettings(): void {
		this.settingsOpen.set(false);
	}

	selectMode(mode: AppMode): void {
		this.recentMode.set(mode);
	}

	setLanguage(language: LanguageCode): void {
		this.settings.update((settings) => ({ ...settings, language }));
	}

	setTheme(theme: ThemeMode): void {
		this.settings.update((settings) => ({ ...settings, theme }));
	}

	setButtonTone(buttonTone: ButtonTone): void {
		this.settings.update((settings) => ({ ...settings, buttonTone }));
	}

	setButtonShape(buttonShape: ButtonShape): void {
		this.settings.update((settings) => ({ ...settings, buttonShape }));
	}

	setTarget(target: number): void {
		const normalizedTarget = normalizePositiveInteger(target, 25);
		this.settings.update((settings) => ({ ...settings, target: normalizedTarget }));
		this.m25Count.update((count) => Math.min(count, normalizedTarget));
	}

	setAllowNegative(allowNegative: boolean): void {
		this.settings.update((settings) => ({ ...settings, allowNegative }));

		if (!allowNegative) {
			this.m25Count.update((count) => clampToZero(count));
			this.updateRhythmSession((session) => ({
				...session,
				items: session.items.map((item) => ({ ...item, count: clampToZero(item.count) })),
			}));
		}
	}

	setM25ErrorBehavior(behavior: ErrorBehavior): void {
		this.settings.update((settings) => ({ ...settings, m25ErrorBehavior: behavior }));
	}

	setRhythmErrorBehavior(behavior: ErrorBehavior): void {
		this.settings.update((settings) => ({ ...settings, rhythmErrorBehavior: behavior }));
	}

	setAskTitleBeforeStart(askTitleBeforeStart: boolean): void {
		this.settings.update((settings) => ({ ...settings, askTitleBeforeStart }));
	}

	setAskBpmBeforeStart(askBpmBeforeStart: boolean): void {
		this.settings.update((settings) => ({ ...settings, askBpmBeforeStart }));
	}

	setDefaultPracticeTitle(defaultPracticeTitle: string): void {
		this.settings.update((settings) => ({ ...settings, defaultPracticeTitle }));
	}

	setDefaultBpm(defaultBpm: number | null): void {
		this.settings.update((settings) => ({ ...settings, defaultBpm }));
	}

	prepareSession(mode: AppMode, title = '', bpm: number | null = null): PracticeSession {
		const session: PracticeSession = {
			id: createId('session'),
			mode,
			status: 'ready',
			title,
			bpm,
			startedAtMs: null,
			lastResumedAtMs: null,
			pausedAtMs: null,
			finishedAtMs: null,
			activeElapsedMs: 0,
			pausedElapsedMs: 0,
		};

		this.activeSession.set(session);
		return session;
	}

	startSession(title: string, bpm: number | null): void {
		const activeSession = this.activeSession();
		if (!activeSession) {
			return;
		}

		const now = Date.now();
		const normalizedTitle = title.trim() || this.settings().defaultPracticeTitle.trim();
		const normalizedBpm = bpm;

		this.activeSession.set({
			...activeSession,
			status: 'running',
			title: normalizedTitle,
			bpm: normalizedBpm,
			startedAtMs: activeSession.startedAtMs ?? now,
			lastResumedAtMs: now,
			pausedAtMs: null,
			finishedAtMs: null,
		});

		if (this.currentMode() === 'rhythms') {
			this.updateRhythmSession((session) => ({ ...session, status: 'running' }));
		}

		this.feedback.notify('success', 'practiceStarted');
	}

	pauseSession(): void {
		const activeSession = this.activeSession();
		if (!activeSession || activeSession.status !== 'running') {
			return;
		}

		const now = Date.now();
		const activeElapsedMs = activeSession.activeElapsedMs + (activeSession.lastResumedAtMs ? now - activeSession.lastResumedAtMs : 0);
		this.activeSession.set({
			...activeSession,
			status: 'paused',
			activeElapsedMs,
			lastResumedAtMs: null,
			pausedAtMs: now,
		});
	}

	resumeSession(): void {
		const activeSession = this.activeSession();
		if (!activeSession || activeSession.status !== 'paused') {
			return;
		}

		const now = Date.now();
		const pausedElapsedMs = activeSession.pausedElapsedMs + (activeSession.pausedAtMs ? now - activeSession.pausedAtMs : 0);
		this.activeSession.set({
			...activeSession,
			status: 'running',
			pausedElapsedMs,
			pausedAtMs: null,
			lastResumedAtMs: now,
		});
	}

	finishSession(status: Extract<PracticeSessionStatus, 'completed' | 'cancelled'>): void {
		const activeSession = this.activeSession();
		if (!activeSession) {
			return;
		}

		const now = Date.now();
		const activeElapsedMs = activeSession.status === 'running' && activeSession.lastResumedAtMs
			? activeSession.activeElapsedMs + (now - activeSession.lastResumedAtMs)
			: activeSession.activeElapsedMs;
		const pausedElapsedMs = activeSession.status === 'paused' && activeSession.pausedAtMs
			? activeSession.pausedElapsedMs + (now - activeSession.pausedAtMs)
			: activeSession.pausedElapsedMs;

		this.activeSession.set({
			...activeSession,
			status,
			activeElapsedMs,
			pausedElapsedMs,
			lastResumedAtMs: null,
			pausedAtMs: null,
			finishedAtMs: now,
		});
		this.cancelConfirmOpen.set(false);
	}

	increment(): void {
		if (this.completionOverlay()) {
			return;
		}

		if (this.activeSessionStatus() !== 'running') {
			return;
		}

		if (this.currentMode() === 'm25') {
			const previousCount = this.m25Count();
			const nextCount = Math.min(previousCount + 1, this.settings().target);
			this.m25Count.set(nextCount);

			if (previousCount < this.settings().target && nextCount >= this.settings().target) {
				this.openM25CompletionOverlay(nextCount);
			}
			return;
		}

		const overlayRef: { value: CompletionOverlayState | null } = { value: null };
		this.updateRhythmSession((session) => {
			if (session.status !== 'running') {
				return session;
			}

			const item = session.items[session.currentIndex];
			if (!item || item.count >= item.repetitions) {
				return session;
			}

			const nextItems = session.items.map((entry, index) => index === session.currentIndex
				? { ...entry, count: Math.min(entry.count + 1, entry.repetitions) }
				: entry);

			const completedLastItem = session.currentIndex === nextItems.length - 1
				&& nextItems[session.currentIndex].count >= nextItems[session.currentIndex].repetitions;
			const completedCurrentItem = item.count < item.repetitions
				&& nextItems[session.currentIndex].count >= nextItems[session.currentIndex].repetitions;

			if (completedCurrentItem) {
				overlayRef.value = {
					kind: completedLastItem ? 'rhythm-final' : 'rhythm-intermediate',
					finalCount: nextItems[session.currentIndex].count,
					repetitions: nextItems[session.currentIndex].repetitions,
					currentIndex: session.currentIndex,
					totalItems: nextItems.length,
					routineName: session.routineName,
					rhythmName: nextItems[session.currentIndex].name,
				};
			}

			return {
				...session,
				items: nextItems,
				status: completedLastItem ? 'complete' : session.status,
			};
		});

		const completedOverlay = overlayRef.value;
		if (completedOverlay !== null) {
			if (completedOverlay.kind === 'rhythm-final') {
				this.finishSession('completed');
			}
			this.completionOverlay.set(completedOverlay);
		}
	}

	decrement(): void {
		if (this.completionOverlay()) {
			return;
		}

		if (this.activeSessionStatus() !== 'running') {
			return;
		}

		if (this.currentMode() === 'm25') {
			const nextCount = this.applyErrorBehavior(this.m25Count(), this.settings().m25ErrorBehavior);
			this.m25Count.set(Math.min(nextCount, this.settings().target));
			return;
		}

		this.updateRhythmSession((session) => {
			if (session.status !== 'running') {
				return session;
			}

			const item = session.items[session.currentIndex];
			if (!item) {
				return session;
			}

			const nextCount = this.applyErrorBehavior(item.count, this.settings().rhythmErrorBehavior);
			const nextItems = session.items.map((entry, index) => index === session.currentIndex
				? { ...entry, count: Math.min(nextCount, entry.repetitions) }
				: entry);

			return {
				...session,
				items: nextItems,
				status: 'running',
			};
		});
	}

	handleRhythmAction(): void {
		switch (this.rhythmActionKind()) {
			case 'resume':
				this.resumeSession();
				return;
			case 'advance':
				this.advanceRhythm();
				return;
			case 'pause':
				this.pauseSession();
				return;
			default:
				this.openSettings();
		}
	}

	pauseRhythmPractice(): void {
		this.updateRhythmSession((session) => ({ ...session, status: 'paused' }));
	}

	continueRhythmPractice(): void {
		this.updateRhythmSession((session) => ({ ...session, status: 'running' }));
	}

	advanceRhythm(): void {
		this.updateRhythmSession((session) => {
			if (session.currentIndex >= session.items.length - 1) {
				return {
					...session,
					status: 'complete',
				};
			}

			return {
				...session,
				currentIndex: session.currentIndex + 1,
				status: 'running',
			};
		});
	}

	resetCurrentPractice(): void {
		this.closeCompletionOverlay();
		this.closeCancelConfirm();
		if (this.currentMode() === 'm25') {
			this.resetM25Practice();
			this.feedback.notify('info', 'practiceReset');
			return;
		}

		this.resetRhythmPractice();
		this.feedback.notify('info', 'practiceReset');
	}

	resetM25Practice(): void {
		this.m25Count.set(0);
	}

	resetRhythmPractice(): void {
		this.closeCompletionOverlay();
		this.closeCancelConfirm();
		this.activeRhythmSession.set(null);
		if (this.currentMode() === 'rhythms' && this.currentScreen() === 'practice') {
			this.navigateTo('practice', true);
		}
	}

	startRhythmPracticeFromDraft(): void {
		if (this.routineDraftItems().length === 0) {
			return;
		}

		const items = this.routineDraftItems().map((item) => {
			const pattern = this.findPattern(item.patternId);
			if (!pattern) {
				return null;
			}

			return {
				id: createId('session-item'),
				patternId: pattern.id,
				name: pattern.name,
				builtIn: pattern.builtIn,
				blocks: [...pattern.blocks],
				repetitions: normalizePositiveInteger(item.repetitions, DEFAULT_REPETITIONS),
				count: 0,
			};
		}).filter((item): item is RhythmSessionItem => item !== null);

		if (items.length === 0) {
			return;
		}

		this.activeRhythmSession.set({
			routineId: this.editingRoutineId(),
			routineName: this.routineDraftName().trim(),
			items,
			currentIndex: 0,
			status: 'paused',
		});
		this.recentMode.set('rhythms');
		this.prepareSession('rhythms', this.routineDraftName().trim(), this.settings().defaultBpm);
		this.navigateTo('practice', true);
		this.closeSettings();
	}

	closeCompletionOverlay(): void {
		this.completionOverlay.set(null);
	}

	repeatM25Practice(): void {
		this.m25Count.set(0);
		this.closeCompletionOverlay();
	}

	startNewM25Practice(): void {
		this.m25Count.set(0);
		this.closeCompletionOverlay();
		this.goHome();
	}

	finishPractice(): void {
		this.finishSession('completed');
		if (this.currentMode() === 'm25') {
			this.m25Count.set(0);
		} else {
			this.activeRhythmSession.set(null);
		}

		this.closeCompletionOverlay();
		this.goHome();
	}

	cancelAndSavePractice(): void {
		this.finishSession('cancelled');
		this.closeCompletionOverlay();
		this.closeCancelConfirm();

		if (this.currentMode() === 'm25') {
			this.m25Count.set(0);
		} else {
			this.activeRhythmSession.set(null);
		}

		this.goHome();
	}

	repeatCurrentRhythm(): void {
		this.updateRhythmSession((session) => ({
			...session,
			status: 'running',
			items: session.items.map((item, index) => index === session.currentIndex ? { ...item, count: 0 } : item),
		}));
		this.closeCompletionOverlay();
	}

	repeatRoutine(): void {
		this.updateRhythmSession((session) => ({
			...session,
			currentIndex: 0,
			status: 'running',
			items: session.items.map((item) => ({ ...item, count: 0 })),
		}));
		this.closeCompletionOverlay();
	}

	advanceAfterCompletion(): void {
		this.advanceRhythm();
		this.closeCompletionOverlay();
	}

	loadRoutineDraft(routineId: string): void {
		const routine = this.routines().find((entry) => entry.id === routineId);
		if (!routine) {
			return;
		}

		this.editingRoutineId.set(routine.id);
		this.routineDraftName.set(routine.name);
		this.routineDraftItems.set(routine.items.map((item) => ({ ...item })));
	}

	startSavedRoutine(routineId: string): void {
		this.loadRoutineDraft(routineId);
		this.startRhythmPracticeFromDraft();
	}

	saveRoutine(): void {
		const name = this.routineDraftName().trim();
		const items = this.routineDraftItems().map((item) => ({
			patternId: item.patternId,
			repetitions: normalizePositiveInteger(item.repetitions, DEFAULT_REPETITIONS),
		})).filter((item) => this.findPattern(item.patternId));

		if (!name || items.length === 0) {
			this.feedback.notify('error', 'routineIncomplete');
			return;
		}

		const routineId = this.editingRoutineId() ?? createId('routine');
		const nextRoutine: Routine = { id: routineId, name, items };

		this.routines.update((routines) => {
			const existing = routines.findIndex((routine) => routine.id === routineId);
			if (existing === -1) {
				return [...routines, nextRoutine];
			}

			return routines.map((routine) => routine.id === routineId ? nextRoutine : routine);
		});

		this.editingRoutineId.set(routineId);
		this.feedback.notify('success', 'routineSaved');
	}

	deleteRoutine(routineId: string): void {
		this.routines.update((routines) => routines.filter((routine) => routine.id !== routineId));
		if (this.editingRoutineId() === routineId) {
			this.clearRoutineDraft();
		}
		this.feedback.notify('info', 'routineDeleted');
	}

	clearRoutineDraft(): void {
		this.editingRoutineId.set(null);
		this.routineDraftName.set('');
		this.routineDraftItems.set([]);
	}

	addPatternToRoutine(patternId: string): void {
		if (!this.findPattern(patternId)) {
			return;
		}

		this.routineDraftItems.update((items) => [
			...items,
			{ patternId, repetitions: DEFAULT_REPETITIONS },
		]);
	}

	moveRoutineItem(index: number, direction: number): void {
		this.routineDraftItems.update((items) => moveArrayItem(items, index, direction));
	}

	removeRoutineItem(index: number): void {
		this.routineDraftItems.update((items) => items.filter((_, itemIndex) => itemIndex !== index));
	}

	setRoutineItemRepetitions(index: number, repetitions: number): void {
		const normalizedRepetitions = normalizePositiveInteger(repetitions, DEFAULT_REPETITIONS);
		this.routineDraftItems.update((items) => items.map((item, itemIndex) => itemIndex === index
			? { ...item, repetitions: normalizedRepetitions }
			: item));
	}

	setRoutineDraftName(name: string): void {
		this.routineDraftName.set(name);
	}

	setPatternDraftName(name: string): void {
		this.patternDraftName.set(name);
	}

	addPatternBlock(kind: BlockKind): void {
		this.patternDraftBlocks.update((blocks) => [...blocks, kind]);
	}

	movePatternBlock(index: number, direction: number): void {
		this.patternDraftBlocks.update((blocks) => moveArrayItem(blocks, index, direction));
	}

	removePatternBlock(index: number): void {
		this.patternDraftBlocks.update((blocks) => blocks.filter((_, blockIndex) => blockIndex !== index));
	}

	savePattern(): void {
		const name = this.patternDraftName().trim();
		const blocks = [...this.patternDraftBlocks()];

		if (!name || blocks.length === 0) {
			this.feedback.notify('error', 'patternIncomplete');
			return;
		}

		const patternId = this.editingPatternId() ?? createId('pattern');
		const nextPattern: RhythmPattern = {
			id: patternId,
			name,
			blocks,
			builtIn: false,
		};

		this.customPatterns.update((patterns) => {
			const existing = patterns.findIndex((pattern) => pattern.id === patternId);
			if (existing === -1) {
				return [...patterns, nextPattern];
			}

			return patterns.map((pattern) => pattern.id === patternId ? nextPattern : pattern);
		});

		this.editingPatternId.set(patternId);
		this.feedback.notify('success', 'patternSaved');
	}

	loadPatternDraft(patternId: string): void {
		const pattern = this.customPatterns().find((entry) => entry.id === patternId);
		if (!pattern) {
			return;
		}

		this.editingPatternId.set(pattern.id);
		this.patternDraftName.set(pattern.name);
		this.patternDraftBlocks.set([...pattern.blocks]);
	}

	deletePattern(patternId: string): void {
		this.customPatterns.update((patterns) => patterns.filter((pattern) => pattern.id !== patternId));
		this.routines.update((routines) => routines
			.map((routine) => ({
				...routine,
				items: routine.items.filter((item) => item.patternId !== patternId),
			}))
			.filter((routine) => routine.items.length > 0));
		this.routineDraftItems.update((items) => items.filter((item) => item.patternId !== patternId));

		if (this.editingPatternId() === patternId) {
			this.clearPatternDraft();
		}
		this.feedback.notify('info', 'patternDeleted');
	}

	clearPatternDraft(): void {
		this.editingPatternId.set(null);
		this.patternDraftName.set('');
		this.patternDraftBlocks.set([]);
	}

	findPattern(patternId: string): RhythmPattern | undefined {
		return this.allPatterns().find((pattern) => pattern.id === patternId);
	}

	private updateRhythmSession(transform: (session: RhythmSession) => RhythmSession): void {
		const session = this.activeRhythmSession();
		if (!session) {
			return;
		}

		this.activeRhythmSession.set(transform(session));
	}

	private applyErrorBehavior(currentValue: number, behavior: ErrorBehavior): number {
		let nextValue = currentValue;

		if (behavior === 'decrement') {
			nextValue = currentValue - 1;
		}

		if (behavior === 'reset') {
			nextValue = 0;
		}

		return this.settings().allowNegative ? nextValue : clampToZero(nextValue);
	}

	private persistState(): void {
		const snapshot: PersistedState = {
			settings: this.settings(),
			recentMode: this.activeRhythmSession() ? 'rhythms' : this.recentMode(),
			activeSession: this.activeSession(),
			m25Count: this.m25Count(),
			activeRhythmSession: this.activeRhythmSession(),
			routines: this.routines(),
			customPatterns: this.customPatterns(),
		};

		this.storage.writeSnapshot(JSON.stringify(snapshot));
	}

	private loadPersistedState(): PersistedState {
		const defaults = createDefaultState();
		const rawState = this.storage.readSnapshot();
		const legacyCount = this.storage.readLegacyCount();

		if (!rawState) {
			return {
				...defaults,
				m25Count: legacyCount,
			};
		}

		try {
			const parsed = JSON.parse(rawState) as Partial<PersistedState>;
			const settings = this.parseSettings(parsed.settings, defaults.settings);
			const activeSession = this.parseActiveSession(parsed.activeSession);
			const customPatterns = this.parsePatterns(parsed.customPatterns);
			const routines = this.parseRoutines(parsed.routines);
			const activeRhythmSession = this.parseRhythmSession(parsed.activeRhythmSession, settings.allowNegative);
			let recentMode: AppMode = 'm25';
			if (parsed.recentMode === 'rhythms') {
				recentMode = 'rhythms';
			}
			if (activeRhythmSession) {
				recentMode = 'rhythms';
			}
			const storedCount = typeof parsed.m25Count === 'number' ? parsed.m25Count : legacyCount;
			const sanitizedCount = settings.allowNegative ? Math.trunc(storedCount) : clampToZero(Math.trunc(storedCount));
			const m25Count = Math.min(sanitizedCount, settings.target);

			return {
				settings,
				recentMode,
				activeSession,
				m25Count,
				activeRhythmSession,
				routines,
				customPatterns,
			};
		} catch {
			return {
				...defaults,
				m25Count: legacyCount,
			};
		}
	}

	private parseSettings(settings: Partial<SettingsState> | undefined, fallback: SettingsState): SettingsState {
		const m25ErrorBehavior = settings?.m25ErrorBehavior;
		const rhythmErrorBehavior = settings?.rhythmErrorBehavior;
		const askTitleBeforeStart = settings?.askTitleBeforeStart;
		const askBpmBeforeStart = settings?.askBpmBeforeStart;
		const defaultPracticeTitle = settings?.defaultPracticeTitle;
		const defaultBpm = settings?.defaultBpm;
		const language = settings?.language;
		const theme = settings?.theme;
		const buttonTone = settings?.buttonTone;
		const buttonShape = settings?.buttonShape;
		const safeM25ErrorBehavior = isErrorBehavior(m25ErrorBehavior ?? '') ? m25ErrorBehavior ?? fallback.m25ErrorBehavior : fallback.m25ErrorBehavior;
		const safeRhythmErrorBehavior = isErrorBehavior(rhythmErrorBehavior ?? '') ? rhythmErrorBehavior ?? fallback.rhythmErrorBehavior : fallback.rhythmErrorBehavior;
		const safeLanguage = isLanguageCode(language ?? '') ? language ?? fallback.language : fallback.language;
		const safeTheme = isThemeMode(theme ?? '') ? theme ?? fallback.theme : fallback.theme;
		const safeButtonTone = isButtonTone(buttonTone ?? '') ? buttonTone ?? fallback.buttonTone : fallback.buttonTone;
		const safeButtonShape = isButtonShape(buttonShape ?? '') ? buttonShape ?? fallback.buttonShape : fallback.buttonShape;

		return {
			target: normalizePositiveInteger(Number(settings?.target), fallback.target),
			allowNegative: settings?.allowNegative ?? fallback.allowNegative,
			m25ErrorBehavior: safeM25ErrorBehavior,
			rhythmErrorBehavior: safeRhythmErrorBehavior,
			askTitleBeforeStart: typeof askTitleBeforeStart === 'boolean' ? askTitleBeforeStart : fallback.askTitleBeforeStart,
			askBpmBeforeStart: typeof askBpmBeforeStart === 'boolean' ? askBpmBeforeStart : fallback.askBpmBeforeStart,
			defaultPracticeTitle: typeof defaultPracticeTitle === 'string' ? defaultPracticeTitle : fallback.defaultPracticeTitle,
			defaultBpm: typeof defaultBpm === 'number' ? defaultBpm : defaultBpm === null ? null : fallback.defaultBpm,
			language: safeLanguage,
			theme: safeTheme,
			buttonTone: safeButtonTone,
			buttonShape: safeButtonShape,
		};
	}

	private parseActiveSession(session: PracticeSession | null | undefined): PracticeSession | null {
		if (!session || session.mode !== 'm25' && session.mode !== 'rhythms') {
			return null;
		}

		const status = isPracticeSessionStatus(session.status) ? session.status : 'ready';

		return {
			id: typeof session.id === 'string' ? session.id : createId('session'),
			mode: session.mode,
			status,
			title: typeof session.title === 'string' ? session.title : '',
			bpm: typeof session.bpm === 'number' ? session.bpm : null,
			startedAtMs: typeof session.startedAtMs === 'number' ? session.startedAtMs : null,
			lastResumedAtMs: typeof session.lastResumedAtMs === 'number' ? session.lastResumedAtMs : null,
			pausedAtMs: typeof session.pausedAtMs === 'number' ? session.pausedAtMs : null,
			finishedAtMs: typeof session.finishedAtMs === 'number' ? session.finishedAtMs : null,
			activeElapsedMs: typeof session.activeElapsedMs === 'number' ? session.activeElapsedMs : 0,
			pausedElapsedMs: typeof session.pausedElapsedMs === 'number' ? session.pausedElapsedMs : 0,
		};
	}

	private parsePatterns(patterns: RhythmPattern[] | undefined): RhythmPattern[] {
		if (!Array.isArray(patterns)) {
			return [];
		}

		return patterns.filter((pattern) => typeof pattern?.id === 'string' && typeof pattern?.name === 'string' && Array.isArray(pattern.blocks))
			.map((pattern) => ({
				id: pattern.id,
				name: pattern.name,
				blocks: pattern.blocks.filter((block): block is BlockKind => isBlockKind(block)),
				builtIn: false,
			}))
			.filter((pattern) => pattern.blocks.length > 0);
	}

	private parseRoutines(routines: Routine[] | undefined): Routine[] {
		if (!Array.isArray(routines)) {
			return [];
		}

		return routines.filter((routine) => typeof routine?.id === 'string' && typeof routine?.name === 'string' && Array.isArray(routine.items))
			.map((routine) => ({
				id: routine.id,
				name: routine.name,
				items: routine.items
					.filter((item) => typeof item?.patternId === 'string')
					.map((item) => ({
						patternId: item.patternId,
						repetitions: normalizePositiveInteger(Number(item.repetitions), DEFAULT_REPETITIONS),
					})),
			}))
			.filter((routine) => routine.items.length > 0);
	}

	private parseRhythmSession(session: RhythmSession | null | undefined, allowNegative: boolean): RhythmSession | null {
		if (!session || !Array.isArray(session.items) || session.items.length === 0) {
			return null;
		}

		const items = session.items.filter((item) => typeof item?.id === 'string' && typeof item?.patternId === 'string' && typeof item?.name === 'string' && Array.isArray(item.blocks))
			.map((item) => ({
				id: item.id,
				patternId: item.patternId,
				name: item.name,
				builtIn: item.builtIn ?? BUILT_IN_RHYTHM_PATTERNS.some((pattern) => pattern.id === item.patternId),
				blocks: item.blocks.filter((block): block is BlockKind => isBlockKind(block)),
				repetitions: normalizePositiveInteger(Number(item.repetitions), DEFAULT_REPETITIONS),
				count: allowNegative
					? Math.min(Math.trunc(Number(item.count) || 0), normalizePositiveInteger(Number(item.repetitions), DEFAULT_REPETITIONS))
					: clampToZero(Math.min(Math.trunc(Number(item.count) || 0), normalizePositiveInteger(Number(item.repetitions), DEFAULT_REPETITIONS))),
			}));

		if (items.length === 0) {
			return null;
		}

		const currentIndex = Math.min(Math.max(Math.trunc(Number(session.currentIndex) || 0), 0), items.length - 1);
		const status: RhythmSessionStatus = session.status === 'paused' || session.status === 'complete' ? session.status : 'running';

		return {
			routineId: typeof session.routineId === 'string' ? session.routineId : null,
			routineName: typeof session.routineName === 'string' ? session.routineName : '',
			items,
			currentIndex,
			status,
		};
	}

	private resolveInitialScreen(state: PersistedState): AppScreen {
		if (state.activeSession && (state.activeSession.status === 'ready' || state.activeSession.status === 'running' || state.activeSession.status === 'paused')) {
			return 'practice';
		}

		if (state.activeRhythmSession || state.m25Count !== 0) {
			return 'practice';
		}

		return 'home';
	}

	private navigateTo(screen: AppScreen, replace = false): void {
		this.settingsOpen.set(false);
		const currentScreen = this.currentScreen();

		if (currentScreen === screen) {
			return;
		}

		if (replace) {
			const history = this.screenHistory();
			if (history.length === 0) {
				this.screenHistory.set(currentScreen === 'home' ? [] : ['home']);
			} else {
				const lastScreen = history.at(-1);
				this.screenHistory.set(lastScreen === screen ? history.slice(0, -1) : history);
			}
			this.currentScreen.set(screen);
			return;
		}

		this.screenHistory.update((history) => [...history, currentScreen]);
		this.currentScreen.set(screen);
	}

	private openM25CompletionOverlay(finalCount: number): void {
		if (this.completionOverlay()) {
			return;
		}

		this.finishSession('completed');

		this.completionOverlay.set({
			kind: 'm25',
			finalCount,
			repetitions: this.settings().target,
			currentIndex: 0,
			totalItems: 1,
			routineName: '',
			rhythmName: '',
		});
	}
}