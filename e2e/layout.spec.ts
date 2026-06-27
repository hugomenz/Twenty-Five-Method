import { expect, test } from '@playwright/test';
import { expectNoGlobalScroll, gotoClean } from './helpers';

test.describe('Layout, heights, and overflow', () => {
	test('home screen has no global scroll', async ({ page }, testInfo) => {
		await gotoClean(page);
		await expectNoGlobalScroll(page, testInfo);
	});

	test('M25 practice screen has no global scroll', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open M25/i }).click();
		await expect(page.getByTestId('m25-count')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('routine studio keeps actions visible and scrolls only the list', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();

		// Build a long routine so the list must scroll internally.
		await page.getByLabel('Name').fill('Long routine');
		const addRhythm = page.getByRole('button', { name: 'Eighths then sixteenths' });
		for (let i = 0; i < 12; i += 1) {
			await addRhythm.click();
		}

		// The whole app must not scroll, and there is no horizontal overflow.
		await expectNoGlobalScroll(page, testInfo);

		// The header action stays visible.
		const launch = page.getByRole('button', { name: 'Start current routine' });
		await expect(launch).toBeInViewport();

		// The central list owns the scrollbar and the last item is reachable.
		const body = page.locator('.studio-body');
		const scrollable = await body.evaluate((el) => el.scrollHeight - el.clientHeight > 4);
		expect(scrollable).toBe(true);

		await body.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
		const lastItem = page.locator('.studio-body .stack-card').last();
		await expect(lastItem).toBeInViewport();
		await expect(launch).toBeInViewport();
	});

	test('settings dialog fits the viewport and scrolls internally', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open M25/i }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		const fits = await dialog.evaluate((el) => {
			const rect = el.getBoundingClientRect();
			return rect.height <= window.innerHeight + 1 && rect.width <= window.innerWidth + 1;
		});
		expect(fits).toBe(true);
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the main view after starting practice from routine studio', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();

		await page.getByLabel('Name').fill('Back flow');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Start current routine' }).click();

		await expect(page.getByTestId('rhythm-count')).toBeVisible();
		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.locator('.home-screen')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the main view after reloading into an active rhythms session', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('Reload back flow');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Start current routine' }).click();

		await expect(page.getByTestId('rhythm-count')).toBeVisible();
		await page.reload();
		await expect(page.getByTestId('rhythm-count')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.locator('.home-screen')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the main view from direct M25 practice', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open M25/i }).click();
		await expect(page.getByTestId('m25-count')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.locator('.home-screen')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the main view from direct rhythms practice', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open rhythms/i }).click();
		await expect(page.getByText('No active practice')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.locator('.home-screen')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the main view from routine studio opened directly', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await expect(page.getByText('Routine studio')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.locator('.home-screen')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the main view from pattern studio opened directly', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Build rhythm' }).click();
		await expect(page.getByText('Rhythm workshop')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.locator('.home-screen')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the empty rhythms screen from routine studio opened inside rhythms', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open rhythms/i }).click();
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await expect(page.getByText('Routine studio')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.getByText('No active practice')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('back button returns to the empty rhythms screen from pattern studio opened inside rhythms', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /Open rhythms/i }).click();
		await page.getByRole('button', { name: 'Build rhythm' }).click();
		await expect(page.getByText('Rhythm workshop')).toBeVisible();

		await page.getByRole('button', { name: 'Go back' }).click();

		await expect(page.getByText('No active practice')).toBeVisible();
		await expectNoGlobalScroll(page, testInfo);
	});

	test('long custom names do not cause horizontal overflow', async ({ page }, testInfo) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page
			.getByLabel('Name')
			.fill('A very very very long routine name that should wrap and never break the layout horizontally');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Save routine' }).click();

		await expectNoGlobalScroll(page, testInfo);
	});
});
