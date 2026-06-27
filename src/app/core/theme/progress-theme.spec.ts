import { getProgressThemeColors } from './progress-theme';

describe('getProgressThemeColors', () => {
	it('returns the expected dark neutral palette at zero', () => {
		expect(getProgressThemeColors(0, 25, 'dark')).toEqual({
			top: 'rgb(18 24 33)',
			mid: 'rgb(13 18 25)',
			bottom: 'rgb(8 11 16)',
			glow: 'rgba(155, 168, 184, 0.11)',
			requiresContrast: true,
		});
	});

	it('returns the expected dark negative palette at minus twenty-five', () => {
		expect(getProgressThemeColors(-25, 25, 'dark')).toEqual({
			top: 'rgb(13 24 44)',
			mid: 'rgb(9 18 34)',
			bottom: 'rgb(6 12 24)',
			glow: 'rgba(42, 74, 150, 0.28)',
			requiresContrast: true,
		});
	});

	it('returns the expected halfway warm palette at half the target', () => {
		expect(getProgressThemeColors(12.5, 25, 'dark')).toEqual({
			top: 'rgb(30 23 27)',
			mid: 'rgb(25 17 20)',
			bottom: 'rgb(16 10 13)',
			glow: 'rgba(183, 117, 116, 0.205)',
			requiresContrast: true,
		});
	});

	it('returns the expected red target palette at the goal', () => {
		expect(getProgressThemeColors(25, 25, 'dark')).toEqual({
			top: 'rgb(42 22 20)',
			mid: 'rgb(36 16 15)',
			bottom: 'rgb(24 9 9)',
			glow: 'rgba(210, 66, 48, 0.3)',
			requiresContrast: true,
		});
	});
});