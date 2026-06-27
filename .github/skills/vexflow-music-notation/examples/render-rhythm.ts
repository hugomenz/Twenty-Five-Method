import {
  Beam,
  Dot,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Tuplet,
  Voice,
  type RenderContext,
} from 'vexflow';

import {
  type RhythmAtom,
  type RhythmPattern,
  VEXFLOW_DURATION,
} from './rhythm-pattern.model';

export interface RenderRhythmOptions {
  width: number;
  height?: number;
  paddingX?: number;
  accessibleLabel?: string;
}

export interface RenderRhythmResult {
  svg: SVGSVGElement;
  notesByAtomId: ReadonlyMap<string, StaveNote>;
}

function createNote(atom: RhythmAtom): StaveNote {
  const baseDuration = VEXFLOW_DURATION[atom.duration];
  const duration = `${baseDuration}${atom.rest ? 'r' : ''}`;
  const note = new StaveNote({ keys: ['b/4'], duration });
  note.setAttribute('id', `rhythm-${atom.id}`);
  note.setAttribute('class', 'rhythm-atom');

  const dots = Math.max(0, atom.dots ?? 0);
  for (let i = 0; i < dots; i += 1) {
    Dot.buildAndAttach([note], { all: true });
  }

  return note;
}

function createTuplets(
  atoms: readonly RhythmAtom[],
  notesByAtomId: ReadonlyMap<string, StaveNote>,
): Tuplet[] {
  const groups = new Map<
    string,
    { numNotes: number; notesOccupied: number; notes: StaveNote[] }
  >();

  for (const atom of atoms) {
    if (!atom.tuplet) continue;
    const group = groups.get(atom.tuplet.id) ?? {
      numNotes: atom.tuplet.numNotes,
      notesOccupied: atom.tuplet.notesOccupied,
      notes: [],
    };

    if (
      group.numNotes !== atom.tuplet.numNotes ||
      group.notesOccupied !== atom.tuplet.notesOccupied
    ) {
      throw new Error(`Tuplet ${atom.tuplet.id} has inconsistent ratios.`);
    }

    const note = notesByAtomId.get(atom.id);
    if (!note) throw new Error(`Missing note for atom ${atom.id}.`);
    group.notes.push(note);
    groups.set(atom.tuplet.id, group);
  }

  return [...groups.entries()].map(([id, group]) => {
    if (group.notes.length !== group.numNotes) {
      throw new Error(
        `Tuplet ${id} expects ${group.numNotes} notes but has ${group.notes.length}.`,
      );
    }
    return new Tuplet(group.notes, {
      numNotes: group.numNotes,
      notesOccupied: group.notesOccupied,
    });
  });
}

function drawDecoration(
  context: RenderContext,
  beams: readonly Beam[],
  tuplets: readonly Tuplet[],
): void {
  beams.forEach((beam) => beam.setContext(context).draw());
  tuplets.forEach((tuplet) => tuplet.setContext(context).draw());
}

export function renderRhythm(
  host: HTMLElement,
  pattern: RhythmPattern,
  options: RenderRhythmOptions,
): RenderRhythmResult | null {
  const width = Math.floor(options.width);
  if (!Number.isFinite(width) || width <= 0) return null;

  const height = Math.max(100, Math.floor(options.height ?? 150));
  const paddingX = Math.max(8, Math.floor(options.paddingX ?? 12));

  host.replaceChildren();

  const renderer = new Renderer(host, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  const stave = new Stave(paddingX, 8, width - paddingX * 2, {
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
  const notes = pattern.atoms.map((atom) => {
    const note = createNote(atom);
    notesByAtomId.set(atom.id, note);
    return note;
  });

  const beams = Beam.generateBeams(notes);
  const tuplets = createTuplets(pattern.atoms, notesByAtomId);
  const voice = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes);

  new Formatter()
    .joinVoices([voice])
    .formatToStave([voice], stave, { context });

  voice.draw(context, stave);
  drawDecoration(context, beams, tuplets);

  const svg = host.querySelector('svg');
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error('VexFlow did not create an SVG element.');
  }

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    options.accessibleLabel ?? pattern.accessibleLabel ?? pattern.name,
  );

  return { svg, notesByAtomId };
}
