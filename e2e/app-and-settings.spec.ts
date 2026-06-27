import { expect, test } from '@playwright/test';
import { gotoClean, readPersistedState, trackPageProblems } from './helpers';

test.describe('App shell and settings', () => {
	test('opens on the home screen without console errors', async ({ page }) => {
		const problems = trackPageProblems(page);
		await gotoClean(page);

		await expect(page.locator('.home-screen')).toBeVisible();
		await expect(page.getByRole('button', { name: /^M25$/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /^Rhythms$/ })).toBeVisible();

		expect(problems.errors, problems.errors.join('\n')).toEqual([]);
		expect(problems.failures, problems.failures.join('\n')).toEqual([]);
	});

	test('switches between M25 and Rhythms from the home screen', async ({ page }) => {
		await gotoClean(page);

		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await expect(page.getByTestId('m25-count')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();
		await page.getByRole('button', { name: /^Rhythms$/ }).click();
		await expect(page.getByText('No active practice')).toBeVisible();
	});

	test('opens settings with visible content and closes via button and Escape', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();

		const settingsButton = page.getByRole('button', { name: 'Open settings' });
		await settingsButton.click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		// Real, visible content — not an empty dialog.
		await expect(dialog.getByRole('heading', { name: 'General' })).toBeVisible();
		await expect(dialog.getByLabel('Target')).toBeVisible();

		await dialog.getByRole('button', { name: 'Close settings' }).click();
		await expect(dialog).toBeHidden();
		// Focus returns to the trigger after a modal closes.
		await expect(settingsButton).toBeFocused();

		await settingsButton.click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toBeHidden();
	});

	test('opening settings from home shows only General', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Open settings' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'General' })).toBeVisible();
		await expect(dialog.getByRole('heading', { name: 'M25' })).toHaveCount(0);
		await expect(dialog.getByRole('heading', { name: 'Rhythms' })).toHaveCount(0);
		await expect(dialog.getByLabel('Target')).toHaveCount(0);
	});

	test('opening settings from rhythms shows General and Rhythms', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^Rhythms$/ }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'General' })).toBeVisible();
		await expect(dialog.getByRole('heading', { name: 'Rhythms' })).toBeVisible();
		await expect(dialog.getByRole('heading', { name: 'M25' })).toHaveCount(0);
	});

	test('opening settings from M25 shows General and M25', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'General' })).toBeVisible();
		await expect(dialog.getByRole('heading', { name: 'M25' })).toBeVisible();
		await expect(dialog.getByRole('heading', { name: 'Rhythms' })).toHaveCount(0);
	});

	test('changes the target and persists it across reload', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();

		const dialog = page.getByRole('dialog');
		const target = dialog.getByLabel('Target');
		await target.fill('5');
		await target.blur();
		await dialog.getByRole('button', { name: 'Close settings' }).click();

		await page.reload();
		const state = await readPersistedState(page);
		expect((state?.['settings'] as { target?: number })?.target).toBe(5);
	});

	test('toggles negative values and keeps M25 from going below zero when disabled', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();

		const dialog = page.getByRole('dialog');
		await dialog.getByLabel('Allow negative values').uncheck();
		await dialog.getByRole('button', { name: 'Close settings' }).click();

		await page.getByRole('button', { name: 'Record mistake' }).click();
		await expect(page.getByTestId('m25-count')).toHaveText('0');
	});
});
