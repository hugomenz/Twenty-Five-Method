import { expect, test } from '@playwright/test';
import { gotoClean } from './helpers';

async function expectWithinViewport(locator: import('@playwright/test').Locator): Promise<void> {
	const fits = await locator.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		return {
			inside: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth,
		};
	});
	expect(fits.inside).toBe(true);
}

test.describe('Completion overlay', () => {
	test('reaching the target in M25 opens the overlay and allows repeating the practice', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();
		const dialog = page.getByRole('dialog');
		await dialog.getByLabel('Target').fill('2');
		await dialog.getByLabel('Target').blur();
		await dialog.getByRole('button', { name: 'Close settings' }).click();

		const plus = page.getByRole('button', { name: 'Record successful repetition' });
		await plus.click();
		await plus.click();

		const overlay = page.getByTestId('completion-overlay');
		await expect(overlay).toBeVisible();
		await expect(overlay.getByText('Practice completed')).toBeVisible();
		await overlay.getByRole('button', { name: 'Repeat' }).click();

		await expect(overlay).toBeHidden();
		await expect(page.getByTestId('m25-count')).toHaveText('0');
	});

	test('completing an intermediate rhythm shows Next rhythm', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('Two steps');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Quarter then triplet' }).click();
		const reps = page.getByLabel('Repetitions');
		await reps.nth(0).fill('1');
		await reps.nth(1).fill('1');
		await page.getByRole('button', { name: 'Start current routine' }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();

		await page.getByRole('button', { name: 'Record successful repetition' }).click();
		const overlay = page.getByTestId('completion-overlay');
		await expect(overlay.getByRole('button', { name: 'Next rhythm' })).toBeVisible();
		await overlay.getByRole('button', { name: 'Next rhythm' }).click();
		await expect(page.getByText('Rhythm 2 of 2')).toBeVisible();
	});

	test('completing the last rhythm shows Repeat routine', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('One step');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByLabel('Repetitions').fill('1');
		await page.getByRole('button', { name: 'Start current routine' }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();

		await page.getByRole('button', { name: 'Record successful repetition' }).click();
		const overlay = page.getByTestId('completion-overlay');
		await expect(overlay.getByText(/^preset\./)).toHaveCount(0);
		await expect(overlay.getByText('Eighths then sixteenths')).toBeVisible();
		await expect(overlay.getByRole('button', { name: 'Repeat routine' })).toBeVisible();
		await overlay.getByRole('button', { name: 'Repeat routine' }).click();
		await expect(page.getByTestId('rhythm-count')).toContainText('0 / 1');
	});

	test('in a vertical mobile viewport every completion action stays visible and tappable', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-desktop');

		await page.setViewportSize({ width: 390, height: 844 });
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();
		const dialog = page.getByRole('dialog');
		await dialog.getByLabel('Target').fill('1');
		await dialog.getByLabel('Target').blur();
		await dialog.getByRole('button', { name: 'Close settings' }).click();

		await page.getByRole('button', { name: 'Record successful repetition' }).click();
		const overlay = page.getByTestId('completion-overlay');
		const repeat = overlay.getByRole('button', { name: 'Repeat' });
		const newPractice = overlay.getByRole('button', { name: 'New practice' });
		const finish = overlay.getByRole('button', { name: 'Finish' });

		await expectWithinViewport(overlay);
		await expectWithinViewport(repeat);
		await expectWithinViewport(newPractice);
		await expectWithinViewport(finish);

		await finish.click();
		await expect(page.locator('.home-screen')).toBeVisible();
	});

	test('in an 844 by 390 viewport every completion action stays visible and tappable', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-desktop');

		await page.setViewportSize({ width: 844, height: 390 });
		await gotoClean(page);
		await page.getByRole('button', { name: /^M25$/ }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();
		await page.getByRole('button', { name: 'Open settings' }).click();
		const dialog = page.getByRole('dialog');
		await dialog.getByLabel('Target').fill('1');
		await dialog.getByLabel('Target').blur();
		await dialog.getByRole('button', { name: 'Close settings' }).click();

		await page.getByRole('button', { name: 'Record successful repetition' }).click();
		const overlay = page.getByTestId('completion-overlay');
		const repeat = overlay.getByRole('button', { name: 'Repeat' });
		const newPractice = overlay.getByRole('button', { name: 'New practice' });
		const finish = overlay.getByRole('button', { name: 'Finish' });

		await expectWithinViewport(overlay);
		await expectWithinViewport(repeat);
		await expectWithinViewport(newPractice);
		await expectWithinViewport(finish);

		await finish.click();
		await expect(page.locator('.home-screen')).toBeVisible();
	});

	test('dark mode uses a high-contrast VexFlow host', async ({ page }) => {
		await gotoClean(page);
		await page.getByRole('button', { name: /^Rhythms$/ }).click();
		await page.getByRole('button', { name: 'Prepare routine' }).click();
		await page.getByLabel('Name').fill('Contrast');
		await page.getByRole('button', { name: 'Eighths then sixteenths' }).click();
		await page.getByRole('button', { name: 'Start current routine' }).click();
		await page.getByTestId('session-start-dialog').getByRole('button', { name: 'Start' }).click();

		const host = page.locator('.pattern-notation .notation-host');
		await expect(host).toBeVisible();

		const styles = await host.evaluate((element) => {
			const computed = window.getComputedStyle(element);
			return {
				backgroundColor: computed.backgroundColor,
				color: computed.color,
			};
		});

		expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(styles.color).not.toBe('rgb(245, 247, 250)');
	});
});
