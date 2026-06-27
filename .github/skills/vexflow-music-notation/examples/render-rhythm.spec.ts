import { describe, expect, it } from 'vitest';
import type { RhythmPattern } from './rhythm-pattern.model';

const pattern: RhythmPattern = {
  schemaVersion: 1,
  id: 'quarter-triplet',
  name: 'Quarter and triplet',
  accessibleLabel: 'Quarter note followed by an eighth-note triplet',
  atoms: [
    { id: 'q1', duration: 'quarter' },
    {
      id: 't1-a',
      duration: 'eighth',
      tuplet: { id: 't1', numNotes: 3, notesOccupied: 2 },
    },
    {
      id: 't1-b',
      duration: 'eighth',
      tuplet: { id: 't1', numNotes: 3, notesOccupied: 2 },
    },
    {
      id: 't1-c',
      duration: 'eighth',
      tuplet: { id: 't1', numNotes: 3, notesOccupied: 2 },
    },
  ],
};

describe('rhythm pattern data', () => {
  it('contains a complete 3:2 tuplet group', () => {
    const members = pattern.atoms.filter((atom) => atom.tuplet?.id === 't1');
    expect(members).toHaveLength(3);
    expect(members[0]?.tuplet).toMatchObject({
      numNotes: 3,
      notesOccupied: 2,
    });
  });
});

// Add DOM-backed tests in the target application's existing test framework.
// Useful assertions:
// - one SVG is produced;
// - a second render replaces, rather than appends, the SVG;
// - SVG output contains no "NaN";
// - invalid tuplet groups throw a useful error;
// - zero width returns null.
