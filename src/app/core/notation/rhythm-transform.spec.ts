import { describe, expect, it } from 'vitest';
import { blocksToAtoms, blocksToNotation, groupBeams } from './rhythm-transform';
import { RhythmAtom } from './rhythm-notation.model';

function eighth(id: string): RhythmAtom {
	return { id, duration: 'eighth' };
}

function sixteenth(id: string): RhythmAtom {
	return { id, duration: 'sixteenth' };
}

function quarter(id: string): RhythmAtom {
	return { id, duration: 'quarter' };
}

describe('blocksToAtoms', () => {
	it('keeps simple blocks as single atoms', () => {
		const atoms = blocksToAtoms(['quarter', 'eighth', 'sixteenth']);
		expect(atoms.map((atom) => atom.duration)).toEqual(['quarter', 'eighth', 'sixteenth']);
		expect(atoms.every((atom) => atom.tuplet === undefined)).toBe(true);
		expect(new Set(atoms.map((atom) => atom.id)).size).toBe(3);
	});

	it('expands a triplet block into three eighth atoms sharing one tuplet id', () => {
		const atoms = blocksToAtoms(['triplet']);
		expect(atoms).toHaveLength(3);
		expect(atoms.every((atom) => atom.duration === 'eighth')).toBe(true);
		const ids = new Set(atoms.map((atom) => atom.tuplet?.id));
		expect(ids.size).toBe(1);
		expect(atoms[0]?.tuplet).toMatchObject({ numNotes: 3, notesOccupied: 2 });
	});

	it('gives consecutive triplets distinct tuplet ids', () => {
		const atoms = blocksToAtoms(['triplet', 'triplet']);
		const ids = [...new Set(atoms.map((atom) => atom.tuplet?.id))];
		expect(ids).toHaveLength(2);
	});

	it('produces unique ids even for repeated blocks', () => {
		const atoms = blocksToAtoms(['eighth', 'eighth', 'eighth']);
		expect(new Set(atoms.map((atom) => atom.id)).size).toBe(3);
	});
});

describe('groupBeams', () => {
	it('does not beam an isolated eighth', () => {
		expect(groupBeams([eighth('a')])).toEqual([]);
	});

	it('does not beam an isolated sixteenth', () => {
		expect(groupBeams([sixteenth('a')])).toEqual([]);
	});

	it('beams two consecutive eighths', () => {
		expect(groupBeams([eighth('a'), eighth('b')])).toEqual([['a', 'b']]);
	});

	it('beams three consecutive sixteenths as one group', () => {
		expect(groupBeams([sixteenth('a'), sixteenth('b'), sixteenth('c')])).toEqual([
			['a', 'b', 'c'],
		]);
	});

	it('beams four consecutive sixteenths as one group of four', () => {
		expect(groupBeams([sixteenth('a'), sixteenth('b'), sixteenth('c'), sixteenth('d')])).toEqual([
			['a', 'b', 'c', 'd'],
		]);
	});

	it('splits four eighths into two beats of two', () => {
		expect(
			groupBeams([eighth('a'), eighth('b'), eighth('c'), eighth('d')]),
		).toEqual([
			['a', 'b'],
			['c', 'd'],
		]);
	});

	it('keeps a mixed eighth + two sixteenths in one beat group', () => {
		expect(groupBeams([eighth('a'), sixteenth('b'), sixteenth('c')])).toEqual([
			['a', 'b', 'c'],
		]);
	});

	it('breaks beams across a quarter note', () => {
		expect(
			groupBeams([eighth('a'), eighth('b'), quarter('q'), eighth('c'), eighth('d')]),
		).toEqual([
			['a', 'b'],
			['c', 'd'],
		]);
	});

	it('does not beam a single eighth next to a quarter', () => {
		expect(groupBeams([quarter('q'), eighth('a')])).toEqual([]);
	});

	it('keeps triplet atoms beamed only among themselves', () => {
		const atoms = blocksToAtoms(['eighth', 'triplet', 'eighth']);
		const groups = groupBeams(atoms);
		const tripletIds = atoms.filter((atom) => atom.tuplet).map((atom) => atom.id);
		expect(groups).toContainEqual(tripletIds);
		expect(groups.some((group) => group.length === 3)).toBe(true);
		// The surrounding lone eighths are not beamed into the triplet.
		expect(groups.every((group) => !group.includes(atoms[0]!.id))).toBe(true);
	});

	it('separates two consecutive triplets into two beam groups', () => {
		const atoms = blocksToAtoms(['triplet', 'triplet']);
		const groups = groupBeams(atoms);
		expect(groups).toHaveLength(2);
		expect(groups.every((group) => group.length === 3)).toBe(true);
	});
});

describe('blocksToNotation', () => {
	it('returns atoms and beam groups together for the preset pattern', () => {
		const notation = blocksToNotation([
			'eighth',
			'eighth',
			'eighth',
			'eighth',
			'sixteenth',
			'sixteenth',
			'sixteenth',
			'sixteenth',
		]);
		expect(notation.atoms).toHaveLength(8);
		// 2 + 2 eighths (two beats) then 4 sixteenths (one beat) => 3 beam groups.
		expect(notation.beamGroups).toHaveLength(3);
		expect(notation.beamGroups.at(-1)).toHaveLength(4);
	});
});
