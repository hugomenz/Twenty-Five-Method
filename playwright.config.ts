import { defineConfig, devices } from '@playwright/test';

const PORT = 4327;
const baseURL = `http://localhost:${PORT}`;
const isCI = !!process.env['CI'];

/**
 * Playwright configuration for M25.
 *
 * The Angular dev server starts automatically. Selectors prefer accessible
 * roles, labels, and visible text; `data-testid` is used only where no stable
 * accessible alternative exists.
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	reporter: [['list'], ['html', { open: 'never' }]],
	timeout: 30_000,
	expect: { timeout: 7_000 },
	use: {
		baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1100, height: 800 } },
		},
		{
			name: 'mobile-portrait',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'mobile-landscape',
			use: {
				...devices['Pixel 5'],
				viewport: { width: 740, height: 360 },
			},
		},
	],
	webServer: {
		command: `npm start -- --port ${PORT}`,
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
		stdout: 'ignore',
		stderr: 'pipe',
	},
});
