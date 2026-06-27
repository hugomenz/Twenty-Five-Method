import { TestBed } from '@angular/core/testing';
import { M25StateService } from './m25-state.service';

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
	});

	it('should start with english defaults and no active practice', () => {
		const service = createService();

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

	it('should run a rhythm routine, advance to the next rhythm, and persist the active session', () => {
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
		expect(service.rhythmStatusKind()).toBe('rhythm-complete');

		service.handleRhythmAction();
		flushEffects();

		expect(service.activeRhythmSession()?.currentIndex).toBe(1);
		expect(service.currentRhythmItem()?.count).toBe(0);

		const storedState = JSON.parse(localStorage.getItem('m25.state') ?? '{}') as { activeRhythmSession?: { currentIndex: number } };
		expect(storedState.activeRhythmSession?.currentIndex).toBe(1);
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