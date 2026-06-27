/**
 * Pure transformation layer between the app's authoring model (`BlockKind[]`)
 * and the atom-level notation model consumed by the VexFlow renderer.
 *
 * No VexFlow imports live here so the rules can be unit tested without a DOM.
 */
import { BlockKind } from '../models/practice.models';
import {
	BEAT_UNITS,
	BeamGroup,
	DURATION_UNITS,
	RhythmAtom,
	RhythmNotation,
} from './rhythm-notation.model';

const TRIPLET_NUM_NOTES = 3;
const TRIPLET_NOTES_OCCUPIED = 2;

/**
 * Expands authoring blocks into engraved atoms. A triplet block becomes three
 * eighth-note atoms that share one tuplet id; every other block is one atom.
 * Ids are prefixed with the block index so they stay unique within a pattern.
 */
export function blocksToAtoms(blocks: readonly BlockKind[]): RhythmAtom[] {
	const atoms: RhythmAtom[] = [];

	blocks.forEach((block, index) => {
		if (block === 'triplet') {
			const tupletId = `b${index}-triplet`;
			for (let note = 0; note < TRIPLET_NUM_NOTES; note += 1) {
				atoms.push({
					id: `${tupletId}-${note}`,
					duration: 'eighth',
					tuplet: {
						id: tupletId,
						numNotes: TRIPLET_NUM_NOTES,
						notesOccupied: TRIPLET_NOTES_OCCUPIED,
					},
				});
			}
			return;
		}

		atoms.push({ id: `b${index}-${block}`, duration: block });
	});

	return atoms;
}

function isBeamable(atom: RhythmAtom): boolean {
	return atom.duration === 'eighth' || atom.duration === 'sixteenth';
}

/**
 * Groups consecutive beamable atoms into beams.
 *
 * Rules, derived from standard engraving and the M25 brief:
 * - Quarter notes are never beamed and always break a run.
 * - Plain (non-tuplet) runs are capped at one quarter-note beat (4 sixteenth
 *   units), so mixed eighth + sixteenth groups share a primary beam while the
 *   sixteenths add a secondary beam, and pulses are respected.
 * - Tuplet atoms only beam with atoms of the same tuplet id, keeping triplets
 *   visually separate from their neighbours.
 * - A run of a single atom produces no beam, so a lone eighth keeps one flag
 *   and a lone sixteenth keeps two.
 */
export function groupBeams(atoms: readonly RhythmAtom[]): BeamGroup[] {
	const groups: BeamGroup[] = [];
	let run: RhythmAtom[] = [];
	let runUnits = 0;
	let runTupletId: string | null = null;

	const flush = (): void => {
		if (run.length >= 2) {
			groups.push(run.map((atom) => atom.id));
		}
		run = [];
		runUnits = 0;
		runTupletId = null;
	};

	for (const atom of atoms) {
		if (!isBeamable(atom)) {
			flush();
			continue;
		}

		const tupletId = atom.tuplet?.id ?? null;
		const units = DURATION_UNITS[atom.duration];
		const tupletChanged = tupletId !== runTupletId;
		const beatOverflow = tupletId === null && run.length > 0 && runUnits + units > BEAT_UNITS;

		if (run.length === 0 || tupletChanged || beatOverflow) {
			flush();
			run = [atom];
			runUnits = units;
			runTupletId = tupletId;
			continue;
		}

		run.push(atom);
		runUnits += units;
	}

	flush();
	return groups;
}

/** Builds the full notation (atoms + beam groups) from authoring blocks. */
export function blocksToNotation(blocks: readonly BlockKind[]): RhythmNotation {
	const atoms = blocksToAtoms(blocks);
	return { atoms, beamGroups: groupBeams(atoms) };
}
