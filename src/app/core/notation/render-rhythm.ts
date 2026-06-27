/**
 * VexFlow rendering adapter. Converts the atom-level notation model into an
 * SVG score. This is the only module in the app that imports VexFlow.
 *
 * Rendering is pure from the caller's perspective: notation in, SVG out. No app
 * state, persistence, or settings logic lives here.
 */
import {
	Beam,
	Formatter,
	Renderer,
	Stave,
	StaveNote,
	Tuplet,
	Voice,
	type RenderContext,
} from 'vexflow';

import { RhythmAtom, RhythmNotation, VEXFLOW_DURATION } from './rhythm-notation.model';

export interface RenderRhythmOptions {
	width: number;
	height?: number;
	paddingX?: number;
	accessibleLabel?: string;
}

export interface RenderRhythmResult {
	svg: SVGSVGElement;
	noteCount: number;
	beamCount: number;
	tupletCount: number;
}

const NEUTRAL_PITCH = 'b/4';

function createNote(atom: RhythmAtom): StaveNote {
	const base = VEXFLOW_DURATION[atom.duration];
	const duration = `${base}${atom.rest ? 'r' : ''}`;
	const note = new StaveNote({ keys: [NEUTRAL_PITCH], duration });
	note.setAttribute('id', `rhythm-${atom.id}`);
	note.setAttribute('class', 'rhythm-atom');
	return note;
}

function createTuplets(
	atoms: readonly RhythmAtom[],
	notesByAtomId: ReadonlyMap<string, StaveNote>,
): Tuplet[] {
	const groups = new Map<string, { numNotes: number; notesOccupied: number; notes: StaveNote[] }>();

	for (const atom of atoms) {
		if (!atom.tuplet) {
			continue;
		}

		const group = groups.get(atom.tuplet.id) ?? {
			numNotes: atom.tuplet.numNotes,
			notesOccupied: atom.tuplet.notesOccupied,
			notes: [],
		};

		const note = notesByAtomId.get(atom.id);
		if (note) {
			group.notes.push(note);
		}
		groups.set(atom.tuplet.id, group);
	}

	return [...groups.values()]
		.filter((group) => group.notes.length === group.numNotes)
		.map(
			(group) =>
				new Tuplet(group.notes, {
					numNotes: group.numNotes,
					notesOccupied: group.notesOccupied,
				}),
		);
}

function buildBeams(
	notation: RhythmNotation,
	notesByAtomId: ReadonlyMap<string, StaveNote>,
): Beam[] {
	return notation.beamGroups
		.map((group) => group.map((id) => notesByAtomId.get(id)).filter((note): note is StaveNote => !!note))
		.filter((notes) => notes.length >= 2)
		.map((notes) => new Beam(notes));
}

function drawDecoration(
	context: RenderContext,
	beams: readonly Beam[],
	tuplets: readonly Tuplet[],
): void {
	beams.forEach((beam) => beam.setContext(context).draw());
	tuplets.forEach((tuplet) => tuplet.setContext(context).draw());
}

/**
 * Renders the given notation into `host` as a single responsive SVG. Returns
 * `null` when the width is not yet measurable, so the caller can retry later.
 */
export function renderRhythm(
	host: HTMLDivElement,
	notation: RhythmNotation,
	options: RenderRhythmOptions,
): RenderRhythmResult | null {
	const width = Math.floor(options.width);
	if (!Number.isFinite(width) || width <= 0) {
		return null;
	}

	const height = Math.max(90, Math.floor(options.height ?? 120));
	const paddingX = Math.max(8, Math.floor(options.paddingX ?? 14));

	host.replaceChildren();

	if (notation.atoms.length === 0) {
		return null;
	}

	const renderer = new Renderer(host, Renderer.Backends.SVG);
	renderer.resize(width, height);
	const context = renderer.getContext();

	const stave = new Stave(paddingX, Math.floor(height / 2) - 40, width - paddingX * 2, {
		leftBar: false,
		rightBar: false,
	});
	stave.setConfigForLines([
		{ visible: false },
		{ visible: false },
		{ visible: true },
		{ visible: false },
		{ visible: false },
	]);
	stave.setContext(context).draw();

	const notesByAtomId = new Map<string, StaveNote>();
	const notes = notation.atoms.map((atom) => {
		const note = createNote(atom);
		notesByAtomId.set(atom.id, note);
		return note;
	});

	const beams = buildBeams(notation, notesByAtomId);
	const tuplets = createTuplets(notation.atoms, notesByAtomId);
	const voice = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes);

	new Formatter().joinVoices([voice]).formatToStave([voice], stave, { context });

	voice.draw(context, stave);
	drawDecoration(context, beams, tuplets);

	const svg = host.querySelector('svg');
	if (!(svg instanceof SVGSVGElement)) {
		throw new TypeError('VexFlow did not create an SVG element.');
	}

	svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
	svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
	svg.setAttribute('role', 'img');
	if (options.accessibleLabel) {
		svg.setAttribute('aria-label', options.accessibleLabel);
	}

	return {
		svg,
		noteCount: notes.length,
		beamCount: beams.length,
		tupletCount: tuplets.length,
	};
}
