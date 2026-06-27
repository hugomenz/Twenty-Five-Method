import { expect, test } from '@playwright/test';
import { gotoClean, readPersistedState } from './helpers';

async function notationMetrics(page: import('@playwright/test').Page) {
	const notation = page.locator('.card-notation').first();
	await expect(notation.locator('svg')).toBeVisible();

	return notation.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		const svg = element.querySelector('svg');
		return {
			width: rect.width,
			height: rect.height,
			svgWidth: Number(svg?.getAttribute('width') ?? 0),
			svgHeight: Number(svg?.getAttribute('height') ?? 0),
			svgCount: element.querySelectorAll('svg').length,
		};
	});
}

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
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
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
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await expect(page.getByTestId('rhythm-count')).toBeVisible();

		await page.reload();
		const state = await readPersistedState(page);
		expect(state?.['activeRhythmSession']).not.toBeNull();
		await expect(page.getByTestId('rhythm-count')).toBeVisible();
	});

	test('routine preview notation grows when the container grows', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-desktop');

		await page.setViewportSize({ width: 480, height: 800 });
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('Resize check');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();

		const before = await notationMetrics(page);

		await page.setViewportSize({ width: 900, height: 800 });
		const after = await notationMetrics(page);

		expect(after.width).toBeGreaterThan(before.width);
		expect(after.height).toBeGreaterThanOrEqual(before.height);
		expect(after.svgCount).toBe(1);
	});

	test('changing orientation re-renders the routine preview notation', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-desktop');

		await page.setViewportSize({ width: 390, height: 844 });
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('Orientation check');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();

		const portrait = await notationMetrics(page);

		await page.setViewportSize({ width: 844, height: 390 });
		const landscape = await notationMetrics(page);

		expect(landscape.svgCount).toBe(1);
		expect(
			landscape.svgWidth !== portrait.svgWidth
			|| landscape.svgHeight !== portrait.svgHeight
			|| landscape.height !== portrait.height,
		).toBe(true);
	});
});
