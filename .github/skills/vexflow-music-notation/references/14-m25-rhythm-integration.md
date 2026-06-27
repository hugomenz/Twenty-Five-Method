# M25 rhythm integration

## Product model

M25 has two related practice flows:

- **M25 counter:** count successful repetitions toward a configurable target, with configurable error behavior and optional negative values.
- **Rhythm routine:** repeat the same passage with an ordered list of visual rhythm patterns and a configurable repetition target per pattern.

They share session and counter infrastructure but remain distinct modes in the interface.

## Separation of concerns

```text
PracticeSession
├── mode
├── counter policy
├── target
└── active routine state

RhythmPattern
├── id
├── name
├── atoms
└── accessible label

VexFlowRenderer
└── converts RhythmPattern -> SVG
```

VexFlow must not know about success penalties, localStorage, routine completion, or settings panels.

## Practice screen

In landscape:

- left: decrement action;
- center: current pattern, repetition count, and routine position;
- right: increment action.

Do not place the PWA launcher artwork in the center. Use `M25` as the small in-app mark and reserve a discreet settings control.

## Pattern builder

The builder may provide:

- quarter;
- eighth;
- sixteenth;
- rest versions where useful;
- triplet groups;
- dots as a later enhancement;
- add, remove, reorder, duplicate;
- a plain-language name.

The first implementation should be a visual ordered sequence, not a full measure editor. Do not require bar completion or audio playback.

## Presets

Use `assets/rhythm-presets.json` as starter content. Presets and user-created patterns must share the same schema.

## Completion behavior

When a pattern reaches its repetition target, stop incrementing that pattern and ask the user to advance. Do not change pattern automatically after a rapid tap.

## Persistence

Persist only plain JSON. Include a schema version so future rhythm features can migrate old saved routines.
