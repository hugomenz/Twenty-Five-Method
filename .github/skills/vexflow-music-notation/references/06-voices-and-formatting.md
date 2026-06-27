# Voices and formatting

A `Voice` groups tickable objects. A `Formatter` assigns horizontal positions and coordinates across one or more voices.

## Voice modes

- `Voice.Mode.STRICT`: default; tick duration must fill the configured voice.
- `Voice.Mode.SOFT`: allows arbitrary total duration.
- `Voice.Mode.FULL`: does not need to fill the voice but cannot exceed its maximum length.

For a free-form rhythm pattern:

```ts
const voice = new Voice().setMode(Voice.Mode.SOFT);
voice.addTickables(notes);
```

`setStrict(false)` is also available in current VexFlow 5 source, but `setMode` states the intent more clearly.

## Formatting to a stave

```ts
new Formatter()
  .joinVoices([voice])
  .formatToStave([voice], stave, { context });

voice.draw(context, stave);
```

Confirm the optional formatter parameters against installed types.

## Width

The stave's usable note area is reduced by modifiers and padding. Prefer `formatToStave` for a stave-bound row. For custom layouts, use `format` with an explicit justify width.

## Multiple voices

Use multiple voices only when simultaneous independent rhythmic layers are part of the product. Do not create extra voices as a spacing hack.

## Common errors

- `IncompleteVoice`: strict voice duration does not fill the measure.
- `TooManyTicks`: the voice exceeds its configured total.
- Crowded notation: the justify width is smaller than the formatter's minimum.
- Incorrect alignment: beam, dot, or tuplet objects were added after formatting instead of before it.
