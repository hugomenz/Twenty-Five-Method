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

	it('should show the main view first and allow entering and leaving M25 practice', () => {
		const fixture = TestBed.createComponent(App);
		fixture.detectChanges();

		const root = fixture.nativeElement as HTMLElement;
		expect(root.querySelector('.home-screen')).toBeTruthy();

		const m25Card = root.querySelector('.mode-card--m25') as HTMLButtonElement;
		m25Card.click();
		fixture.detectChanges();

		expect(root.querySelector('.practice-stage')).toBeTruthy();

		const backButton = root.querySelector('.back-button') as HTMLButtonElement;
		backButton.click();
		fixture.detectChanges();

		expect(root.querySelector('.home-screen')).toBeTruthy();
	});

	it('should offer direct routine preparation when rhythms has no active practice', () => {
		const fixture = TestBed.createComponent(App);
		const state = TestBed.inject(M25StateService);
		state.openPractice('rhythms');
		fixture.detectChanges();

		const root = fixture.nativeElement as HTMLElement;
		expect(root.textContent).toContain('Prepare routine');

		const prepareButton = Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.includes('Prepare routine')) as HTMLButtonElement;
		prepareButton.click();
		fixture.detectChanges();

		expect(root.querySelector('.studio-screen')).toBeTruthy();
	});

	it('should keep the score-based contrast classes on the shell and controls', () => {
		const fixture = TestBed.createComponent(App);
		fixture.detectChanges();

		const root = fixture.nativeElement as HTMLElement;
		(root.querySelector('.mode-card--m25') as HTMLButtonElement).click();
		fixture.detectChanges();

		const shell = root.querySelector('.practice-shell') as HTMLElement;
		const controls = Array.from(root.querySelectorAll('.control-button')) as HTMLButtonElement[];

		expect(shell.classList.contains('practice-shell--score-contrast')).toBe(true);
		expect(controls.every((button) => button.classList.contains('control-button--contrast'))).toBe(true);
	});
});
