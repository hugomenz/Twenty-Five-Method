import { TestBed } from '@angular/core/testing';
import { SettingsSheetComponent } from './settings-sheet.component';

describe('SettingsSheetComponent', () => {
	beforeEach(async () => {
		localStorage.clear();
		await TestBed.configureTestingModule({
			imports: [SettingsSheetComponent],
		}).compileComponents();
	});

	function dialogOf(fixture: { nativeElement: HTMLElement }): HTMLDialogElement {
		return fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
	}

	it('opens as a modal dialog with visible content', async () => {
		const fixture = TestBed.createComponent(SettingsSheetComponent);
		fixture.detectChanges();
		await fixture.whenStable();

		const dialog = dialogOf(fixture);
		expect(dialog).toBeTruthy();
		expect(dialog.open).toBe(true);
		// The dialog projects real settings content, not an empty shell.
		expect(fixture.nativeElement.querySelector('.sheet-body')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('m25-appearance-settings-section')).toBeTruthy();
		expect(fixture.nativeElement.textContent?.trim().length ?? 0).toBeGreaterThan(0);
	});

	it('exposes a labelled close control inside the dialog', async () => {
		const fixture = TestBed.createComponent(SettingsSheetComponent);
		fixture.detectChanges();
		await fixture.whenStable();

		const close = fixture.nativeElement.querySelector('.sheet-close') as HTMLButtonElement;
		expect(close).toBeTruthy();
		expect(close.getAttribute('aria-label')).toBeTruthy();
	});

	it('emits requestClose when the close button is used', async () => {
		const fixture = TestBed.createComponent(SettingsSheetComponent);
		let closed = 0;
		fixture.componentInstance.requestClose.subscribe(() => (closed += 1));
		fixture.detectChanges();
		await fixture.whenStable();

		(fixture.nativeElement.querySelector('.sheet-close') as HTMLButtonElement).click();
		expect(closed).toBe(1);
	});

	it('emits requestClose when the dialog closes (Escape)', async () => {
		const fixture = TestBed.createComponent(SettingsSheetComponent);
		let closed = 0;
		fixture.componentInstance.requestClose.subscribe(() => (closed += 1));
		fixture.detectChanges();
		await fixture.whenStable();

		dialogOf(fixture).dispatchEvent(new Event('close'));
		expect(closed).toBe(1);
	});
});
