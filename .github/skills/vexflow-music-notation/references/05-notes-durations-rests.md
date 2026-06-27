# Notes, durations, and rests

## Common duration codes

| Musical value | VexFlow duration |
|---|---|
| Whole | `w` |
| Half | `h` |
| Quarter | `q` |
| Eighth | `8` |
| Sixteenth | `16` |
| Thirty-second | `32` |
| Sixty-fourth | `64` |

A rest commonly appends `r`, for example `qr`, `8r`, or `16r`.

A dotted duration can include `d` in EasyScore or note structures, but the native and most explicit approach is to attach `Dot` modifiers. Confirm behavior against the installed version.

## StaveNote

A `StaveNote` can represent one notehead or a chord:

```ts
new StaveNote({ keys: ['b/4'], duration: '8' });
new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' });
```

For a rhythm-only guide, use one neutral pitch consistently. `b/4` is useful on a treble staff because it sits on the middle line.

## Domain model separation

Persist semantic values such as:

```ts
type DurationName = 'quarter' | 'eighth' | 'sixteenth';
```

Convert them to VexFlow duration strings in one adapter. Do not store `'q'`, `'8'`, or VexFlow object instances throughout the application unless the product model intentionally uses VexFlow notation codes.

## Rests

A rest still requires a key position for vertical placement. The official tutorial demonstrates a quarter rest with `keys: ['b/4']` and `duration: 'qr'`.

## Measure completeness

Visual practice patterns may intentionally have an arbitrary total duration. Use a soft voice and do not invent a time signature merely to satisfy strict tick accounting.
