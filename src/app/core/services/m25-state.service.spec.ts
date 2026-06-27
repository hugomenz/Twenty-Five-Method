import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { M25StateService } from './m25-state.service';
import { M25FeedbackService } from './m25-feedback.service';

const NEGATIVE_PROMPT_THRESHOLD_MS = 20 * 60 * 1000;

describe('M25StateService', () => {
	function flushEffects(): void {
		TestBed.flushEffects();
	}

	function createService(): M25StateService {
		TestBed.configureTestingModule({});
		return TestBed.inject(M25StateService);
	}

	function startM25Session(service: M25StateService): void {
		service.prepareSession('m25', 'Pattern', 84);
		service.startSession('Pattern', 84);
	}

	beforeEach(() => {
		localStorage.clear();
		TestBed.resetTestingModule();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-27T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should start with english defaults and no active practice', () => {
		const service = createService();

		expect(service.settings().askTitleBeforeStart).toBe(true);
		expect(service.settings().askBpmBeforeStart).toBe(true);
		expect(service.activeSession()).toBeNull();
		expect(service.settings().language).toBe('en');
		expect(service.settings().theme).toBe('dark');
		expect(service.settings().buttonTone).toBe('soft');
		expect(service.settings().buttonShape).toBe('rounded');
		expect(service.m25Count()).toBe(0);
		expect(service.activeRhythmSession()).toBeNull();
	});

	it('should restore persisted m25 state and clamp it to the configured target', () => {
		localStorage.setItem('m25.state', JSON.stringify({
			settings: {
				target: 12,
				allowNegative: true,
				m25ErrorBehavior: 'decrement',
				rhythmErrorBehavior: 'decrement',
				language: 'es',
				theme: 'light',
				buttonTone: 'outline',
				buttonShape: 'pill'
			},
			recentMode: 'm25',
			m25Count: 19,
			activeRhythmSession: null,
			routines: [],
			customPatterns: []
		}));

		const service = createService();

		expect(service.m25Count()).toBe(12);
		expect(service.m25Completed()).toBe(true);
		expect(service.settings().language).toBe('es');
		expect(service.settings().theme).toBe('light');
	});

	it('should restore versioned practice history capped to the 200 most recent records', () => {
		localStorage.setItem('m25.history', JSON.stringify({
			version: 1,
			records: Array.from({ length: 205 }, (_, index) => ({
				id: `record-${index}`,
				mode: index % 2 === 0 ? 'm25' : 'rhythm',
				title: `Practice ${index}`,
				bpm: 60 + index,
				startedAtMs: 1_000 + index,
				finishedAtMs: 2_000 + index,
				activeDurationMs: 3_000 + index,
				pausedDurationMs: index,
				status: index % 3 === 0 ? 'cancelled' : 'completed',
				target: 25,
				finalValue: index,
				minimumValue: -index,
				errorCount: index % 5,
				positivePressCount: index + 1,
				exerciseName: `Exercise ${index}`,
				exerciseBuiltIn: index % 2 === 1,
			})),
		}));

		const service = createService();

		expect(service.practiceHistory()).toHaveLength(200);
		expect(service.practiceHistory()[0]?.id).toBe('record-204');
		expect(service.practiceHistory().at(-1)?.id).toBe('record-5');
	});

	it('should allow negative values in m25 and stop at zero when negatives are disabled', () => {
		const service = createService();
		startM25Session(service);

		service.decrement();
		service.decrement();
		expect(service.m25Count()).toBe(-2);

		service.setAllowNegative(false);
		expect(service.m25Count()).toBe(0);

		service.decrement();
		expect(service.m25Count()).toBe(0);
	});

	it('should use a configurable target in m25 and persist appearance options', () => {
		const service = createService();
		startM25Session(service);

		service.setTarget(3);
		service.setLanguage('de');
		service.setTheme('light');
		service.setButtonTone('solid');
		service.setButtonShape('square');
		service.increment();
		service.increment();
		service.increment();
		service.increment();
		flushEffects();

		expect(service.m25Count()).toBe(3);
		const snapshot = JSON.parse(localStorage.getItem('m25.state') ?? '{}') as { settings: { language: string; theme: string; buttonTone: string; buttonShape: string } };
		expect(snapshot.settings.language).toBe('de');
		expect(snapshot.settings.theme).toBe('light');
		expect(snapshot.settings.buttonTone).toBe('solid');
		expect(snapshot.settings.buttonShape).toBe('square');
	});

	it('should prepare a session without starting time until startSession is called', () => {
		const service = createService();

		service.prepareSession('m25', 'Arpeggio', 84);
		expect(service.activeSession()?.status).toBe('ready');
		expect(service.activeSession()?.startedAtMs).toBeNull();

		vi.advanceTimersByTime(5000);
		expect(service.activeSession()?.activeElapsedMs).toBe(0);

		service.startSession('Arpeggio', 84);
		expect(service.activeSession()?.status).toBe('running');
		expect(service.activeSession()?.startedAtMs).toBe(Date.now());
	});

	it('should pause and resume using timestamps without counting paused time', () => {
		const service = createService();

		service.prepareSession('m25', 'Etude', 96);
		service.startSession('Etude', 96);
		vi.advanceTimersByTime(10_000);
		service.pauseSession();

		expect(service.activeSession()?.status).toBe('paused');
		expect(service.activeSession()?.activeElapsedMs).toBe(10_000);

		vi.advanceTimersByTime(7_000);
		service.resumeSession();
		expect(service.activeSession()?.pausedElapsedMs).toBe(7_000);

		vi.advanceTimersByTime(3_000);
		service.finishSession('completed');

		expect(service.activeSession()?.status).toBe('completed');
		expect(service.activeSession()?.activeElapsedMs).toBe(13_000);
		expect(service.activeSession()?.pausedElapsedMs).toBe(7_000);
	});

	it('should mark cancelled sessions explicitly', () => {
		const service = createService();

		service.prepareSession('rhythms', 'Warmup', 72);
		service.startSession('Warmup', 72);
		vi.advanceTimersByTime(2_500);
		service.finishSession('cancelled');

		expect(service.activeSession()?.status).toBe('cancelled');
		expect(service.activeSession()?.finishedAtMs).toBe(Date.now());
		expect(service.activeSession()?.activeElapsedMs).toBe(2_500);
	});

	it('should open the negative coaching prompt after 20 active minutes below zero', () => {
		const service = createService();
		startM25Session(service);

		service.decrement();
		expect(service.m25Count()).toBe(-1);

		vi.advanceTimersByTime(NEGATIVE_PROMPT_THRESHOLD_MS - 1_000);
		expect(service.negativeCoachingPromptOpen()).toBe(false);

		vi.advanceTimersByTime(1_000);
		expect(service.negativeCoachingPromptOpen()).toBe(true);
	});

	it('should not count paused time toward the negative coaching prompt', () => {
		const service = createService();
		startM25Session(service);

		service.decrement();
		vi.advanceTimersByTime(10 * 60 * 1000);
		service.pauseSession();

		vi.advanceTimersByTime(15 * 60 * 1000);
		expect(service.negativeCoachingPromptOpen()).toBe(false);

		service.resumeSession();
		vi.advanceTimersByTime((10 * 60 * 1000) - 1_000);
		expect(service.negativeCoachingPromptOpen()).toBe(false);

		vi.advanceTimersByTime(1_000);
		expect(service.negativeCoachingPromptOpen()).toBe(true);
	});

	it('should reset continuous negative time after returning to zero', () => {
		const service = createService();
		startM25Session(service);

		service.decrement();
		vi.advanceTimersByTime(10 * 60 * 1000);
		service.increment();
		expect(service.m25Count()).toBe(0);
		expect(service.negativeCoachingPromptOpen()).toBe(false);

		service.decrement();
		vi.advanceTimersByTime(10 * 60 * 1000);
		expect(service.negativeCoachingPromptOpen()).toBe(false);

		vi.advanceTimersByTime(10 * 60 * 1000);
		expect(service.negativeCoachingPromptOpen()).toBe(true);
	});

	it('should save the current session and start a new one with a lower bpm', () => {
		const service = createService();

		service.prepareSession('m25', 'Recovery Loop', 100);
		service.startSession('Recovery Loop', 100);
		service.decrement();
		service.decrement();
		const firstSessionId = service.activeSession()!.id;

		vi.advanceTimersByTime(NEGATIVE_PROMPT_THRESHOLD_MS);
		expect(service.negativeCoachingPromptOpen()).toBe(true);

		service.openNegativeCoachingLowerBpmStep();
		service.restartPracticeWithLowerBpm(84);

		expect(service.practiceHistory()).toHaveLength(1);
		expect(service.practiceHistory()[0]).toMatchObject({
			id: firstSessionId,
			status: 'cancelled',
			bpm: 100,
			finalValue: -2,
			title: 'Recovery Loop',
		});
		expect(service.activeSession()?.id).not.toBe(firstSessionId);
		expect(service.activeSession()?.status).toBe('running');
		expect(service.activeSession()?.title).toBe('Recovery Loop');
		expect(service.activeSession()?.bpm).toBe(84);
		expect(service.m25Count()).toBe(0);
		expect(service.negativeCoachingPromptOpen()).toBe(false);
	});

	it('should not reopen the negative coaching prompt during the same negative period', () => {
		const service = createService();
		startM25Session(service);

		service.decrement();
		vi.advanceTimersByTime(NEGATIVE_PROMPT_THRESHOLD_MS);
		expect(service.negativeCoachingPromptOpen()).toBe(true);

		service.continueAfterNegativeCoaching();
		vi.advanceTimersByTime(5 * 60 * 1000);
		expect(service.negativeCoachingPromptOpen()).toBe(false);

		service.increment();
		service.decrement();
		vi.advanceTimersByTime(NEGATIVE_PROMPT_THRESHOLD_MS);
		expect(service.negativeCoachingPromptOpen()).toBe(true);
	});

	it('should show a single recovery message after climbing back from minus five', () => {
		const service = createService();
		const feedback = TestBed.inject(M25FeedbackService);
		startM25Session(service);

		for (let index = 0; index < 5; index += 1) {
			service.decrement();
		}
		expect(service.m25Count()).toBe(-5);

		for (let index = 0; index < 5; index += 1) {
			service.increment();
		}

		const recoveryMessages = feedback.messages().filter((message) => message.key === 'recovery');
		expect(recoveryMessages).toHaveLength(1);
		expect(recoveryMessages[0]).toMatchObject({ kind: 'success', params: { points: 5 } });

		service.increment();
		expect(feedback.messages().filter((message) => message.key === 'recovery')).toHaveLength(1);
	});

	it('should show the positive streak message only once per session', () => {
		const service = createService();
		const feedback = TestBed.inject(M25FeedbackService);
		startM25Session(service);

		for (let index = 0; index < 10; index += 1) {
			service.increment();
		}

		const streakMessages = feedback.messages().filter((message) => message.key === 'positiveStreak');
		expect(streakMessages).toHaveLength(1);
		expect(streakMessages[0]).toMatchObject({ kind: 'success', params: { count: 10 } });

		service.increment();
		expect(feedback.messages().filter((message) => message.key === 'positiveStreak')).toHaveLength(1);
	});

	it('should save a completed m25 session exactly once', () => {
		const service = createService();

		service.prepareSession('m25', 'Completed once', 88);
		service.startSession('Completed once', 88);
		service.setTarget(1);
		const firstSessionId = service.activeSession()!.id;

		service.increment();

		expect(service.practiceHistory()).toHaveLength(1);
		expect(service.practiceHistory()[0]).toMatchObject({
			id: firstSessionId,
			mode: 'm25',
			status: 'completed',
			bpm: 88,
			target: 1,
			finalValue: 1,
			minimumValue: 0,
			errorCount: 0,
			positivePressCount: 1,
		});

		service.finishPractice();
		service.finishPractice();

		expect(service.practiceHistory()).toHaveLength(1);
		expect(JSON.parse(localStorage.getItem('m25.history') ?? '{}').records).toHaveLength(1);
	});

	it('should save cancelled sessions with paused time outside active duration', () => {
		const service = createService();

		service.prepareSession('rhythms', 'Warmup', 72);
		service.startSession('Warmup', 72);
		service.setRoutineDraftName('Warmup');
		service.addPatternToRoutine('preset-eighths-sixteenths');
		service.startRhythmPracticeFromDraft();
		service.startSession('Warmup', 72);
		service.increment();
		vi.advanceTimersByTime(4_000);
		service.pauseSession();
		vi.advanceTimersByTime(6_000);
		service.cancelAndSavePractice();

		expect(service.practiceHistory()[0]).toMatchObject({
			mode: 'rhythm',
			status: 'cancelled',
			bpm: 72,
			activeDurationMs: 4_000,
			pausedDurationMs: 6_000,
			finalValue: 1,
			minimumValue: 0,
			errorCount: 0,
			positivePressCount: 1,
			exerciseName: 'Warmup',
			exerciseBuiltIn: false,
		});
	});

	it('should create a new ready session when repeating after completion', () => {
		const service = createService();

		service.prepareSession('m25', 'Loop', 90);
		service.startSession('Loop', 90);
		service.setTarget(1);
		const firstSessionId = service.activeSession()!.id;
		service.increment();

		service.repeatM25Practice();

		expect(service.practiceHistory()).toHaveLength(1);
		expect(service.activeSession()?.id).not.toBe(firstSessionId);
		expect(service.activeSession()?.status).toBe('ready');
		expect(service.completionOverlay()).toBeNull();
		expect(service.m25Count()).toBe(0);
	});

	it('should open the m25 completion overlay once and allow repeating', () => {
		const service = createService();
		startM25Session(service);

		service.setTarget(2);
		service.increment();
		expect(service.completionOverlay()).toBeNull();

		service.increment();
		expect(service.m25Count()).toBe(2);
		expect(service.completionOverlay()?.kind).toBe('m25');

		// Rapid extra taps are ignored while the overlay is present.
		service.increment();
		expect(service.m25Count()).toBe(2);

		service.repeatM25Practice();
		expect(service.completionOverlay()).toBeNull();
		expect(service.m25Count()).toBe(0);
	});

	it('should create and save a routine with a custom rhythm', () => {
		const service = createService();

		service.setPatternDraftName('Custom Triplet');
		service.addPatternBlock('triplet');
		service.addPatternBlock('quarter');
		service.savePattern();

		service.setRoutineDraftName('Main Routine');
		const customPatternId = service.customPatterns()[0]?.id;
		expect(customPatternId).toBeTruthy();
		service.addPatternToRoutine(customPatternId!);
		service.saveRoutine();

		expect(service.customPatterns()).toHaveLength(1);
		expect(service.routines()).toHaveLength(1);
		expect(service.routines()[0]?.items[0]?.patternId).toBe(customPatternId);
	});

	it('should report feedback after saving, failing validation, and deleting', () => {
		const service = createService();
		const feedback = TestBed.inject(M25FeedbackService);

		// Saving an empty routine fails validation and reports an error.
		service.saveRoutine();
		expect(feedback.messages().at(-1)).toMatchObject({ kind: 'error', key: 'routineIncomplete' });

		service.setPatternDraftName('Custom');
		service.addPatternBlock('eighth');
		service.savePattern();
		expect(feedback.messages().at(-1)).toMatchObject({ kind: 'success', key: 'patternSaved' });

		const patternId = service.customPatterns()[0]!.id;
		service.setRoutineDraftName('Routine');
		service.addPatternToRoutine(patternId);
		service.saveRoutine();
		expect(feedback.messages().at(-1)).toMatchObject({ kind: 'success', key: 'routineSaved' });

		service.deletePattern(patternId);
		expect(feedback.messages().at(-1)).toMatchObject({ kind: 'info', key: 'patternDeleted' });
	});

	it('should open an intermediate rhythm completion overlay and advance manually', () => {
		const service = createService();

		service.selectMode('rhythms');
		service.setRoutineDraftName('Passage Routine');
		service.addPatternToRoutine('preset-eighths-sixteenths');
		service.addPatternToRoutine('preset-quarter-triplet');
		service.setRoutineItemRepetitions(0, 2);
		service.setRoutineItemRepetitions(1, 3);
		service.startRhythmPracticeFromDraft();
		service.startSession('Passage Routine', 92);

		expect(service.activeRhythmSession()?.items).toHaveLength(2);
		expect(service.rhythmActionKind()).toBe('pause');

		service.increment();
		service.increment();

		expect(service.rhythmCompleted()).toBe(true);
		expect(service.completionOverlay()?.kind).toBe('rhythm-intermediate');
		expect(service.rhythmStatusKind()).toBe('rhythm-complete');

		service.advanceAfterCompletion();
		flushEffects();

		expect(service.activeRhythmSession()?.currentIndex).toBe(1);
		expect(service.currentRhythmItem()?.count).toBe(0);
		expect(service.completionOverlay()).toBeNull();

		const storedState = JSON.parse(localStorage.getItem('m25.state') ?? '{}') as { activeRhythmSession?: { currentIndex: number } };
		expect(storedState.activeRhythmSession?.currentIndex).toBe(1);
	});

	it('should open the final rhythm completion overlay and allow repeating the routine', () => {
		const service = createService();

		service.selectMode('rhythms');
		service.setRoutineDraftName('Final Routine');
		service.addPatternToRoutine('preset-eighths-sixteenths');
		service.setRoutineItemRepetitions(0, 1);
		service.startRhythmPracticeFromDraft();
		service.startSession('Final Routine', 76);

		service.increment();

		expect(service.completionOverlay()?.kind).toBe('rhythm-final');
		expect(service.activeRhythmSession()?.status).toBe('complete');

		service.repeatRoutine();
		expect(service.completionOverlay()).toBeNull();
		expect(service.activeRhythmSession()?.currentIndex).toBe(0);
		expect(service.currentRhythmItem()?.count).toBe(0);
		expect(service.activeRhythmSession()?.status).toBe('paused');
		expect(service.activeSession()?.status).toBe('ready');
	});

	it('should reset m25 practice and rhythm practice independently', () => {
		const service = createService();
		startM25Session(service);

		service.increment();
		service.increment();
		service.resetM25Practice();
		expect(service.m25Count()).toBe(0);

		service.selectMode('rhythms');
		service.setRoutineDraftName('Routine');
		service.addPatternToRoutine('preset-eighths-sixteenths');
		service.startRhythmPracticeFromDraft();
		service.startSession('Routine', 72);
		expect(service.activeRhythmSession()).not.toBeNull();

		service.resetRhythmPractice();
		expect(service.activeRhythmSession()).toBeNull();
	});
});