# Interactivity

SVG is preferred when notation elements need hover, selection, or direct manipulation.

## Stable identifiers

Assign application identifiers to model items and transfer them to rendered elements through VexFlow element attributes where supported:

```ts
note.setAttribute('id', `rhythm-${atom.id}`);
note.setAttribute('class', 'rhythm-atom');
```

Inspect the generated SVG and installed VexFlow behavior before relying on an exact DOM structure.

## Event delegation

Attach one listener to the notation host and find the nearest meaningful group. Do not attach listeners to every SVG path after every redraw.

## Editing model

On interaction:

1. Resolve the application item ID.
2. Update the plain rhythm model.
3. Redraw from the model.

Do not mutate note duration, beam membership, or tuplet relationships directly in the SVG.

## M25 guidance

Direct notation editing belongs in the routine builder, not on the main practice screen. During practice, the score is primarily a visual instruction. Large left and right controls remain the primary touch targets.
