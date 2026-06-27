import { expect, test } from '@playwright/test';
import { gotoClean, readPersistedState } from './helpers';

test.describe('Session lifecycle', () => {
	test('time does not begin before Start is pressed', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();

		const startDialog = page.getByTestId('session-start-dialog');
		await expect(startDialog).toBeVisible();

		const beforeStart = await readPersistedState(page);
		const sessionBeforeStart = beforeStart?.['activeSession'] as { status?: string; startedAtMs?: number | null } | undefined;
		expect(sessionBeforeStart?.status).toBe('ready');
		expect(sessionBeforeStart?.startedAtMs).toBeNull();

		await startDialog.getByRole('button', { name: 'Start' }).click();
		await expect(startDialog).toBeHidden();

		const afterStart = await readPersistedState(page);
		const sessionAfterStart = afterStart?.['activeSession'] as { status?: string; startedAtMs?: number | null } | undefined;
		expect(sessionAfterStart?.status).toBe('running');
		expect(typeof sessionAfterStart?.startedAtMs).toBe('number');
	});

	test('title and BPM fields appear only when the preferences are enabled', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		let startDialog = page.getByTestId('session-start-dialog');
		await expect(startDialog.getByLabel('Practice title')).toBeVisible();
		await expect(startDialog.getByLabel('BPM')).toBeVisible();

		await startDialog.getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();
		const settings = page.getByRole('dialog');
		await settings.getByLabel('Ask for a title before starting').uncheck();
		await settings.getByLabel('Ask for BPM before starting').uncheck();
		await settings.getByRole('button', { name: 'Close settings' }).click();

		await page.getByRole('button', { name: 'Go back' }).click();
		await page.getByRole('button', { name: /^M25$/ }).click();
		startDialog = page.getByTestId('session-start-dialog');
		await expect(startDialog.getByLabel('Practice title')).toHaveCount(0);
		await expect(startDialog.getByLabel('BPM')).toHaveCount(0);
		await expect(startDialog.getByRole('button', { name: 'Start' })).toBeVisible();
	});

	test('during pause, plus and minus do not modify the counter', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();

		const plus = page.getByRole('button', { name: 'Record successful repetition' });
		const minus = page.getByRole('button', { name: 'Record mistake' });
		await plus.click();
		await expect(page.getByTestId('m25-count')).toHaveText('1');

		await page.getByRole('button', { name: 'Practice paused' }).click();
		const pauseOverlay = page.getByTestId('session-pause-overlay');
		await expect(pauseOverlay).toBeVisible();
		await expect(plus).toBeDisabled();
		await expect(minus).toBeDisabled();

		await pauseOverlay.getByRole('button', { name: 'Continue' }).click();
		await expect(pauseOverlay).toBeHidden();
		await minus.click();
		await expect(page.getByTestId('m25-count')).toHaveText('0');
	});

	test('cancel asks for confirmation and stores a cancelled session', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();

		await page.getByRole('button', { name: 'Finish practice?' }).click();
		const cancelDialog = page.getByTestId('session-cancel-dialog');
		await expect(cancelDialog).toBeVisible();

		await cancelDialog.getByRole('button', { name: 'Keep practising' }).click();
		await expect(cancelDialog).toBeHidden();

		await page.getByRole('button', { name: 'Finish practice?' }).click();
		await cancelDialog.getByRole('button', { name: 'Finish and save' }).click();
		await expect(page.locator('.home-screen')).toBeVisible();

		const persisted = await readPersistedState(page);
		const activeSession = persisted?.['activeSession'] as { status?: string } | undefined;
		expect(activeSession?.status).toBe('cancelled');
	});
});
