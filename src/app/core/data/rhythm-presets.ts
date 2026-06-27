import { RhythmPattern } from '../models/practice.models';

export const BUILT_IN_RHYTHM_PATTERNS: readonly RhythmPattern[] = [
	{
		id: 'preset-eighths-sixteenths',
		name: 'preset.eighthsThenSixteenths',
		blocks: ['eighth', 'eighth', 'eighth', 'eighth', 'sixteenth', 'sixteenth', 'sixteenth', 'sixteenth'],
		builtIn: true,
	},
	{
		id: 'preset-sixteenths-eighths',
		name: 'preset.sixteenthsThenEighths',
		blocks: ['sixteenth', 'sixteenth', 'sixteenth', 'sixteenth', 'eighth', 'eighth', 'eighth', 'eighth'],
		builtIn: true,
	},
	{
		id: 'preset-two-eighths-two-sixteenths',
		name: 'preset.twoEighthsTwoSixteenths',
		blocks: ['eighth', 'eighth', 'sixteenth', 'sixteenth', 'eighth', 'eighth', 'sixteenth', 'sixteenth'],
		builtIn: true,
	},
	{
		id: 'preset-two-sixteenths-two-eighths',
		name: 'preset.twoSixteenthsTwoEighths',
		blocks: ['sixteenth', 'sixteenth', 'eighth', 'eighth', 'sixteenth', 'sixteenth', 'eighth', 'eighth'],
		builtIn: true,
	},
	{
		id: 'preset-quarter-triplet',
		name: 'preset.quarterThenTriplet',
		blocks: ['quarter', 'triplet', 'quarter', 'triplet'],
		builtIn: true,
	},
	{
		id: 'preset-triplet-quarter',
		name: 'preset.tripletThenQuarter',
		blocks: ['triplet', 'quarter', 'triplet', 'quarter'],
		builtIn: true,
	},
] as const;