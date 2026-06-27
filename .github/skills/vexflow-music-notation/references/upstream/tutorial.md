---
title: "Tutorial"
source: https://github.com/vexflow/vexflow-examples/blob/main/src/guides/tutorial.md
snapshot: 2026-06-27
license: MIT
---

# Official tutorial snapshot

The official tutorial describes VexFlow as a TypeScript/JavaScript engraving engine that renders to Canvas and SVG.

## Core concepts

- `StaveNote` represents one or more noteheads and can include stems and flags.
- `Voice` represents a sequence of notes or other tickables.
- `System` aligns, justifies, and renders voices across one or more staves.
- Modifiers such as accidentals, annotations, vibrato, and dots position themselves according to notation rules.

## Notes, rest, and chord example

```js
const notes = [
  factory.StaveNote({ keys: ['c/4'], duration: 'q' }),
  factory.StaveNote({ keys: ['d/4'], duration: 'q' }),
  factory.StaveNote({ keys: ['b/4'], duration: 'qr' }),
  factory.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
];
const voice = factory.Voice().addTickables(notes);
```

## Dots and accidentals example

```js
Dot.buildAndAttach([staveNote], { all: true });
staveNote.addModifier(factory.Accidental({ type: '#' }));
```

The complete current tutorial is available at:
https://vexflow.github.io/vexflow-examples/guides/tutorial/
