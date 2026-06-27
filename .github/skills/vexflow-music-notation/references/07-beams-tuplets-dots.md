# Beams, tuplets, and dots

## Beams

Create beam relationships before formatting so spacing can account for them.

```ts
const beams = Beam.generateBeams(notes);
```

After the voice is drawn:

```ts
beams.forEach((beam) => beam.setContext(context).draw());
```

For strict grouping rules, inspect the installed `Beam.generateBeams` options and provide explicit groups instead of manually changing glyph positions.

## Tuplets

A basic triplet fits three notes into the time normally occupied by two:

```ts
const tuplet = new Tuplet(tripletNotes, {
  numNotes: 3,
  notesOccupied: 2,
});
```

Current VexFlow 5 source documents these options:

- `numNotes`
- `notesOccupied`
- `location`
- `bracketed`
- `ratioed`
- `yOffset`
- `textYOffset`
- `suffix`

All notes in a tuplet must belong to the same voice. Create the `Tuplet` before formatting, and draw it after the voice.

## Dots

```ts
Dot.buildAndAttach([note], { all: true });
```

For multiple dots, attach the required number explicitly and verify visual output.

## Data modeling

Represent tuplet membership with a stable group identifier:

```ts
{
  duration: 'eighth',
  tuplet: { id: 'triplet-1', numNotes: 3, notesOccupied: 2 }
}
```

The renderer groups atoms by `tuplet.id` and constructs one `Tuplet` per group.

## Drawing order

1. Create notes.
2. Attach dots and modifiers.
3. Create beams.
4. Create tuplets.
5. Format.
6. Draw stave and voice.
7. Draw beams and tuplets.
