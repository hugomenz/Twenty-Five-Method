/**
 * Atom-level rhythm notation model.
 *
 * This layer is intentionally independent from VexFlow and from the app's
 * authoring model (`BlockKind[]`). A `BlockKind` is what the user edits; a
 * `RhythmAtom` is a single engraved note. A triplet block, for example, is one
 * editable unit but expands to three atoms here.
 */

/** Durations that map directly to a VexFlow note duration. */
export type AtomDuration = 'quarter' | 'eighth' | 'sixteenth';

export interface TupletSpec {
	/** Stable identifier shared by every atom in the same tuplet group. */
	id: string;
	numNotes: number;
	notesOccupied: number;
}

export interface RhythmAtom {
	id: string;
	duration: AtomDuration;
	rest?: boolean;
	tuplet?: TupletSpec;
}

/**
 * A beam group is an ordered list of atom ids that should be joined by a beam.
 * Single, unbeamed atoms render with their own flags and never appear here.
 */
export type BeamGroup = readonly string[];

export interface RhythmNotation {
	atoms: RhythmAtom[];
	beamGroups: BeamGroup[];
}

/** Maps an atom duration to its VexFlow duration token. */
export const VEXFLOW_DURATION: Record<AtomDuration, 'q' | '8' | '16'> = {
	quarter: 'q',
	eighth: '8',
	sixteenth: '16',
};

/** Number of sixteenth-note units a duration occupies, used for beat grouping. */
export const DURATION_UNITS: Record<AtomDuration, number> = {
	quarter: 4,
	eighth: 2,
	sixteenth: 1,
};

/** One quarter-note beat is four sixteenth-note units. */
export const BEAT_UNITS = 4;

/** Schema version for persisted rhythm patterns. */
export const RHYTHM_SCHEMA_VERSION = 2;
