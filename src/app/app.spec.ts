import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { M25StateService } from './core/services/m25-state.service';

describe('App', () => {
	beforeEach(async () => {
		localStorage.clear();

		await TestBed.configureTestingModule({
			imports: [App],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(App);
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should render the practice shell and react to appearance changes', () => {
		const fixture = TestBed.createComponent(App);
		const state = TestBed.inject(M25StateService);
		fixture.detectChanges();

		state.setTheme('light');
		state.setButtonTone('outline');
		state.setButtonShape('pill');
		fixture.detectChanges();

		const shell = (fixture.nativeElement as HTMLElement).querySelector('.practice-shell') as HTMLElement;
		expect(shell).toBeTruthy();
		expect(shell.getAttribute('data-theme')).toBe('light');
		expect(shell.getAttribute('data-button-tone')).toBe('outline');
		expect(shell.getAttribute('data-button-shape')).toBe('pill');
	});
});
