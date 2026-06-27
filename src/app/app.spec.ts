import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should start at zero when no saved value exists', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.count()).toBe(0);
    expect((fixture.nativeElement as HTMLElement).querySelector('.counter-value')?.textContent?.trim()).toBe('0');
  });

  it('should restore the saved value and clamp it to 25', () => {
    localStorage.setItem('twenty-five-method.count', '31');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.count()).toBe(25);
    expect(fixture.componentInstance.isComplete()).toBe(true);
  });

  it('should allow negative values without a lower limit', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const decrementButton = (fixture.nativeElement as HTMLElement).querySelector('.control-button--decrement') as HTMLButtonElement;
    decrementButton.click();
    decrementButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.count()).toBe(-2);
    expect(localStorage.getItem('twenty-five-method.count')).toBe('-2');
  });

  it('should stop incrementing at 25 and show the completion message', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const incrementButton = (fixture.nativeElement as HTMLElement).querySelector('.control-button--increment') as HTMLButtonElement;

    for (let count = 0; count < 30; count += 1) {
      incrementButton.click();
    }

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.count()).toBe(25);
    expect(incrementButton.disabled).toBe(true);
    expect(compiled.querySelector('.status-message')?.textContent).toContain('We did it.');
  });

  it('should reset the counter after confirmation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    fixture.componentInstance.increment();
    fixture.componentInstance.increment();
    fixture.detectChanges();

    const resetButton = (fixture.nativeElement as HTMLElement).querySelector('.reset-button') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.count()).toBe(0);
    expect(localStorage.getItem('twenty-five-method.count')).toBe('0');

    confirmSpy.mockRestore();
  });
});
