import { expect, test } from '@playwright/test';
import { gotoClean, readPersistedState } from './helpers';

test.describe('M25 counter', () => {
	test.beforeEach(async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open M25/i }).click();
		await expect(page.getByTestId('m25-count')).toBeVisible();
	});

	test('increments and decrements', async ({ page }) => {
		const count = page.getByTestId('m25-count');
		const plus = page.getByRole('button', { name: 'Record successful repetition' });
		const minus = page.getByRole('button', { name: 'Record mistake' });

		await plus.click();
		await plus.click();
		await plus.click();
		await expect(count).toHaveText('3');

		await minus.click();
		await expect(count).toHaveText('2');
	});

	test('allows negative values by default', async ({ page }) => {
		const count = page.getByTestId('m25-count');
		const minus = page.getByRole('button', { name: 'Record mistake' });

		await minus.click();
		await minus.click();
		await expect(count).toHaveText('-2');
	});

	test('stops at the target and shows the completion message', async ({ page }) => {
		// Lower the target to keep the test quick.
		await page.getByRole('button', { name: 'Open settings' }).click();
		const dialog = page.getByRole('dialog');
		await dialog.getByLabel('Target').fill('3');
		await dialog.getByLabel('Target').blur();
		await dialog.getByRole('button', { name: 'Close settings' }).click();

		const plus = page.getByRole('button', { name: 'Record successful repetition' });
		for (let i = 0; i < 3; i += 1) {
			await plus.click();
		}

		await expect(page.getByTestId('m25-count')).toHaveText('3');
		await expect(page.getByText('Passage completed')).toBeVisible();
		// The control disables at the target, so the counter cannot exceed it.
		await expect(plus).toBeDisabled();
	});

	test('persists the counter after reload', async ({ page }) => {
		const plus = page.getByRole('button', { name: 'Record successful repetition' });
		await plus.click();
		await plus.click();
		await expect(page.getByTestId('m25-count')).toHaveText('2');

		await page.reload();
		const state = await readPersistedState(page);
		expect(state?.['m25Count']).toBe(2);
		await expect(page.getByTestId('m25-count')).toHaveText('2');
	});
});
