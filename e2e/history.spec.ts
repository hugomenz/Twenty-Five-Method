import { expect, test } from '@playwright/test';
import { gotoClean, readPracticeHistory } from './helpers';

async function setTargetToOne(page: import('@playwright/test').Page): Promise<void> {
	await page.evaluate(() => {
		const raw = window.localStorage.getItem('m25.state');
		if (!raw) {
			return;
		}

		const state = JSON.parse(raw) as { settings?: { target?: number } };
		state.settings = { ...state.settings, target: 1 };
		window.localStorage.setItem('m25.state', JSON.stringify(state));
	});
	await page.reload();
}

async function completeM25Session(page: import('@playwright/test').Page, title: string): Promise<void> {
	await page.getByRole('button', { name: /^M25$/ }).click();
	const startDialog = page.getByTestId('session-start-dialog');
	await startDialog.getByLabel('Practice title').fill(title);
	await startDialog.getByRole('button', { name: 'Start' }).click();
	await page.getByRole('button', { name: 'Record successful repetition' }).click();
	await page.getByRole('button', { name: 'Finish' }).click();
	await expect(page.locator('.home-screen')).toBeVisible();
}

async function openHistory(page: import('@playwright/test').Page): Promise<void> {
	await page.getByRole('button', { name: 'Open settings' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('button', { name: 'Practice history' }).click();
	await expect(page.getByRole('heading', { name: 'Practice history' })).toBeVisible();
}

test.describe('Practice history', () => {
	test('history remains available after reloading the application', async ({ page }) => {
		await gotoClean(page);
		await setTargetToOne(page);
		await completeM25Session(page, 'Reload history');

		const savedBeforeReload = await readPracticeHistory(page);
		expect(savedBeforeReload?.records).toHaveLength(1);

		await page.reload();
		await expect(page.locator('.home-screen')).toBeVisible();
		await openHistory(page);
		await expect(page.getByRole('button', { name: 'Reload history' })).toBeVisible();

		const savedAfterReload = await readPracticeHistory(page);
		expect(savedAfterReload?.records).toHaveLength(1);
	});

	test('deleting one session leaves the others intact', async ({ page }) => {
		await gotoClean(page);
		await setTargetToOne(page);
		await completeM25Session(page, 'First saved session');
		await completeM25Session(page, 'Second saved session');

		await openHistory(page);
		await page.getByRole('button', { name: 'First saved session' }).click();

		page.once('dialog', (dialog) => dialog.accept());
		await page.getByRole('button', { name: 'Delete' }).click();

		await expect(page.getByRole('button', { name: 'First saved session' })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Second saved session' })).toBeVisible();

		const savedHistory = await readPracticeHistory(page);
		expect(savedHistory?.records).toHaveLength(1);
		expect(savedHistory?.records[0]?.['title']).toBe('Second saved session');
	});
});