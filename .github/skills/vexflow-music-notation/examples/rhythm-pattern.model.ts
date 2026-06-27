export type RhythmDuration = 'quarter' | 'eighth' | 'sixteenth';

export interface TupletSpec {
  id: string;
  numNotes: number;
  notesOccupied: number;
}

export interface RhythmAtom {
  id: string;
  duration: RhythmDuration;
  rest?: boolean;
  dots?: number;
  tuplet?: TupletSpec;
}

export interface RhythmPattern {
  schemaVersion: 1;
  id: string;
  name: string;
  atoms: RhythmAtom[];
  accessibleLabel: string;
}

export const VEXFLOW_DURATION: Record<RhythmDuration, 'q' | '8' | '16'> = {
  quarter: 'q',
  eighth: '8',
  sixteenth: '16',
};
