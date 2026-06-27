import { expect, Page, TestInfo } from '@playwright/test';

/** Navigates to a clean app state with empty storage. */
export async function gotoClean(page: Page): Promise<void> {
	await page.goto('/');
	await page.evaluate(() => window.localStorage.clear());
	await page.reload();
	await expect(page.locator('.practice-shell')).toBeVisible();
}

/**
 * Tracks console errors and failed requests so tests can assert a clean run.
 * Ignores expected offline/service-worker noise from the dev server.
 */
export function trackPageProblems(page: Page): { errors: string[]; failures: string[] } {
	const errors: string[] = [];
	const failures: string[] = [];

	page.on('console', (message) => {
		if (message.type() === 'error') {
			errors.push(message.text());
		}
	});
	page.on('pageerror', (error) => {
		errors.push(error.message);
	});
	page.on('requestfailed', (request) => {
		const url = request.url();
		const errorText = request.failure()?.errorText ?? 'failed';
		if (url.includes('favicon') || url.includes('ngsw') || url.includes('service-worker')) {
			return;
		}
		if (errorText === 'net::ERR_ABORTED' && url.includes('/@ng/component?')) {
			return;
		}
		failures.push(`${errorText} ${url}`);
	});

	return { errors, failures };
}

/** Reads the persisted M25 state from localStorage. */
export async function readPersistedState(page: Page): Promise<Record<string, unknown> | null> {
	const raw = await page.evaluate(() => window.localStorage.getItem('m25.state'));
	return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

/** Reads the saved practice-history snapshot from localStorage. */
export async function readPracticeHistory(page: Page): Promise<{ version: number; records: Array<Record<string, unknown>> } | null> {
	const raw = await page.evaluate(() => window.localStorage.getItem('m25.history'));
	return raw ? (JSON.parse(raw) as { version: number; records: Array<Record<string, unknown>> }) : null;
}

/** Asserts the page has no global vertical or horizontal scroll. */
export async function expectNoGlobalScroll(page: Page, testInfo: TestInfo): Promise<void> {
	const metrics = await page.evaluate(() => {
		const root = document.documentElement;
		return {
			verticalOverflow: root.scrollHeight - root.clientHeight,
			horizontalOverflow: root.scrollWidth - root.clientWidth,
		};
	});
	expect(metrics.verticalOverflow, `vertical overflow in ${testInfo.project.name}`).toBeLessThanOrEqual(2);
	expect(metrics.horizontalOverflow, `horizontal overflow in ${testInfo.project.name}`).toBeLessThanOrEqual(2);
}
