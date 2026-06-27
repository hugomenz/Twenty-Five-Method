import { TestBed } from '@angular/core/testing';
import { M25LabelsService } from './m25-labels.service';
import { M25StateService } from './m25-state.service';

describe('M25LabelsService', () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({});
	});

	it('should expose english labels by default', () => {
		const labels = TestBed.inject(M25LabelsService);
		expect(labels.dictionary().actions.pause).toBe('Pause');
		expect(labels.blockOption('quarter').label).toBe('Quarter note');
	});

	it('should switch labels when the language changes', () => {
		const state = TestBed.inject(M25StateService);
		const labels = TestBed.inject(M25LabelsService);

		state.setLanguage('de');
		expect(labels.dictionary().actions.resume).toBe('Fortsetzen');

		state.setLanguage('es');
		expect(labels.dictionary().status.passageCompleted).toBe('Pasaje completado');
		expect(labels.blockOption('triplet').label).toBe('Tresillo');
	});
});