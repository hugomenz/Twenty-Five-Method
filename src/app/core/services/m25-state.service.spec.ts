import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { M25StateService } from './m25-state.service';
import { M25FeedbackService } from './m25-feedback.service';

describe('M25StateService', () => {
	function flushEffects(): void {
		TestBed.flushEffects();
	}

	function createService(): M25StateService {
		TestBed.configureTestingModule({});
		return TestBed.inject(M25StateService);
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

	it('should allow negative values in m25 and stop at zero when negatives are disabled', () => {
		const service = createService();

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

	it('should open the m25 completion overlay once and allow repeating', () => {
		const service = createService();

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

		service.increment();

		expect(service.completionOverlay()?.kind).toBe('rhythm-final');
		expect(service.activeRhythmSession()?.status).toBe('complete');

		service.repeatRoutine();
		expect(service.completionOverlay()).toBeNull();
		expect(service.activeRhythmSession()?.currentIndex).toBe(0);
		expect(service.currentRhythmItem()?.count).toBe(0);
		expect(service.activeRhythmSession()?.status).toBe('running');
	});

	it('should reset m25 practice and rhythm practice independently', () => {
		const service = createService();

		service.increment();
		service.increment();
		service.resetM25Practice();
		expect(service.m25Count()).toBe(0);

		service.selectMode('rhythms');
		service.setRoutineDraftName('Routine');
		service.addPatternToRoutine('preset-eighths-sixteenths');
		service.startRhythmPracticeFromDraft();
		expect(service.activeRhythmSession()).not.toBeNull();

		service.resetRhythmPractice();
		expect(service.activeRhythmSession()).toBeNull();
	});
});