import { ThemeMode } from '../models/practice.models';

type Rgb = readonly [number, number, number];
type Rgba = readonly [number, number, number, number];

interface ThemePalette {
	top: Rgb;
	mid: Rgb;
	bottom: Rgb;
	glow: Rgba;
}

export interface ProgressThemeColors {
	top: string;
	mid: string;
	bottom: string;
	glow: string;
	requiresContrast: boolean;
}

const DARK_NEUTRAL: ThemePalette = {
	top: [18, 24, 33],
	mid: [13, 18, 25],
	bottom: [8, 11, 16],
	glow: [155, 168, 184, 0.11],
};

const DARK_NEGATIVE_25: ThemePalette = {
	top: [13, 24, 44],
	mid: [9, 18, 34],
	bottom: [6, 12, 24],
	glow: [42, 74, 150, 0.28],
};

const DARK_NEGATIVE_50: ThemePalette = {
	top: [10, 18, 34],
	mid: [7, 14, 27],
	bottom: [4, 9, 20],
	glow: [28, 58, 132, 0.34],
};

const DARK_POSITIVE_TARGET: ThemePalette = {
	top: [42, 22, 20],
	mid: [36, 16, 15],
	bottom: [24, 9, 9],
	glow: [210, 66, 48, 0.3],
};

const LIGHT_NEUTRAL: ThemePalette = {
	top: [247, 249, 252],
	mid: [237, 242, 247],
	bottom: [221, 229, 239],
	glow: [83, 98, 115, 0.14],
};

const LIGHT_NEGATIVE_25: ThemePalette = {
	top: [223, 233, 250],
	mid: [210, 223, 245],
	bottom: [197, 212, 238],
	glow: [56, 92, 168, 0.22],
};

const LIGHT_NEGATIVE_50: ThemePalette = {
	top: [211, 224, 247],
	mid: [197, 212, 238],
	bottom: [184, 201, 232],
	glow: [42, 76, 150, 0.28],
};

const LIGHT_POSITIVE_TARGET: ThemePalette = {
	top: [250, 228, 224],
	mid: [246, 214, 208],
	bottom: [237, 193, 186],
	glow: [205, 78, 59, 0.26],
};

function mixNumber(start: number, end: number, ratio: number): number {
	return Math.round(start + ((end - start) * ratio));
}

function mixAlpha(start: number, end: number, ratio: number): number {
	return Number((start + ((end - start) * ratio)).toFixed(3));
}

function mixRgb(start: Rgb, end: Rgb, ratio: number): Rgb {
	return [
		mixNumber(start[0], end[0], ratio),
		mixNumber(start[1], end[1], ratio),
		mixNumber(start[2], end[2], ratio),
	];
}

function mixRgba(start: Rgba, end: Rgba, ratio: number): Rgba {
	return [
		mixNumber(start[0], end[0], ratio),
		mixNumber(start[1], end[1], ratio),
		mixNumber(start[2], end[2], ratio),
		mixAlpha(start[3], end[3], ratio),
	];
}

function mixPalette(start: ThemePalette, end: ThemePalette, ratio: number): ThemePalette {
	return {
		top: mixRgb(start.top, end.top, ratio),
		mid: mixRgb(start.mid, end.mid, ratio),
		bottom: mixRgb(start.bottom, end.bottom, ratio),
		glow: mixRgba(start.glow, end.glow, ratio),
	};
}

function toRgbCss(color: Rgb): string {
	return `rgb(${color[0]} ${color[1]} ${color[2]})`;
}

function toRgbaCss(color: Rgba): string {
	return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
}

export function getProgressThemeColors(value: number, target: number, theme: ThemeMode): ProgressThemeColors {
	const neutral = theme === 'dark' ? DARK_NEUTRAL : LIGHT_NEUTRAL;
	const negative25 = theme === 'dark' ? DARK_NEGATIVE_25 : LIGHT_NEGATIVE_25;
	const negative50 = theme === 'dark' ? DARK_NEGATIVE_50 : LIGHT_NEGATIVE_50;
	const positiveTarget = theme === 'dark' ? DARK_POSITIVE_TARGET : LIGHT_POSITIVE_TARGET;

	let palette = neutral;
	if (value < 0) {
		const absoluteValue = Math.abs(value);
		if (absoluteValue <= 25) {
			palette = mixPalette(neutral, negative25, absoluteValue / 25);
		} else {
			palette = mixPalette(negative25, negative50, Math.min((absoluteValue - 25) / 50, 1));
		}
	} else if (value > 0) {
		const safeTarget = Math.max(1, target);
		palette = mixPalette(neutral, positiveTarget, Math.min(value / safeTarget, 1));
	}

	return {
		top: toRgbCss(palette.top),
		mid: toRgbCss(palette.mid),
		bottom: toRgbCss(palette.bottom),
		glow: toRgbaCss(palette.glow),
		requiresContrast: true,
	};
}