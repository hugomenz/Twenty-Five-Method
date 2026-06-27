# Staves and systems

## Stave

```ts
const stave = new Stave(x, y, width, {
  leftBar: false,
  rightBar: false,
});
```

Add conventional notation when needed:

```ts
stave.addClef('treble').addTimeSignature('4/4');
```

For a compact rhythm guide, omit clef and time signature unless they communicate something meaningful.

## Staff-line visibility

Current VexFlow 5 provides:

```ts
stave.setConfigForLine(lineNumber, { visible: false });
stave.setConfigForLines([...]);
```

A clean rhythm row can retain only the middle line:

```ts
stave.setConfigForLines([
  { visible: false },
  { visible: false },
  { visible: true },
  { visible: false },
  { visible: false },
]);
```

Keep five logical lines so neutral pitch placement remains predictable, while visually showing one line.

## System

Use `System` to align several staves, braces, connectors, or voices. Avoid it for one short row unless the existing architecture already uses Factory/System consistently.

## Coordinates

Leave enough vertical room above notes for stems, beams, and tuplet numbers. A container that appears vertically empty may simply be clipping content outside the SVG height.
