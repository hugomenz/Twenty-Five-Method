import { expect, test } from '@playwright/test';
import { gotoClean, readPersistedState } from './helpers';

test.describe('Rhythm building and routines', () => {
	test('builds a custom rhythm and renders real notation with feedback', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Build rhythm' }).click();

		await page.getByLabel('Name').fill('My pattern');
		await page.getByRole('button', { name: 'Quarter note', exact: true }).click();
		await page.getByRole('button', { name: 'Eighth note', exact: true }).click();
		await page.getByRole('button', { name: 'Eighth note', exact: true }).click();

		// VexFlow renders an SVG preview, not unicode text.
		await expect(page.locator('m25-rhythm-notation svg').first()).toBeVisible();

		await page.getByRole('button', { name: 'Save rhythm' }).click();
		await expect(page.getByText('Rhythm saved.')).toBeVisible();

		await page.reload();
		const state = await readPersistedState(page);
		expect((state?.['customPatterns'] as unknown[])?.length).toBe(1);
	});

	test('shows a validation error when saving a rhythm without a name', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Build rhythm' }).click();

		// A block is required to enable saving; leaving the name empty fails validation.
		await page.getByRole('button', { name: 'Quarter note', exact: true }).click();
		await page.getByRole('button', { name: 'Save rhythm' }).click();
		await expect(page.getByText(/Add a name and at least one block/i)).toBeVisible();
	});

	test('does not persist an unsaved rhythm draft', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Build rhythm' }).click();
		await page.getByRole('button', { name: 'Quarter note', exact: true }).click();

		await page.reload();
		const state = await readPersistedState(page);
		expect((state?.['customPatterns'] as unknown[] | undefined)?.length ?? 0).toBe(0);
	});

	test('creates a routine with several rhythms, runs it, and advances', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();

		await page.getByLabel('Name').fill('Warm up');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Quarter then triplet' }).click();

		const reps = page.getByLabel('Repetitions');
		await reps.nth(0).fill('2');
		await reps.nth(1).fill('2');

		await page.getByRole('button', { name: 'Save routine' }).click();
		await expect(page.getByText('Routine saved.')).toBeVisible();

		await page.getByRole('button', { name: 'Start current routine' }).click();
		await expect(page.getByText('Practice started.')).toBeVisible();

		const rhythmCount = page.getByTestId('rhythm-count');
		await expect(rhythmCount).toContainText('0 / 2');
		await expect(page.getByText('Rhythm 1 of 2')).toBeVisible();

		const plus = page.getByRole('button', { name: 'Record successful repetition' });
		await plus.click();
		await plus.click();
		const overlay = page.getByTestId('completion-overlay');
		await expect(overlay.getByRole('heading', { name: 'Rhythm completed' })).toBeVisible();

		await overlay.getByRole('button', { name: 'Next rhythm' }).click();
		await expect(page.getByText('Rhythm 2 of 2')).toBeVisible();
		await expect(rhythmCount).toContainText('0 / 2');
	});

	test('keeps the active rhythm session after reload', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('Persisted');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Start current routine' }).click();
		await expect(page.getByTestId('rhythm-count')).toBeVisible();

		await page.reload();
		const state = await readPersistedState(page);
		expect(state?.['activeRhythmSession']).not.toBeNull();
		await expect(page.getByTestId('rhythm-count')).toBeVisible();
	});
});
