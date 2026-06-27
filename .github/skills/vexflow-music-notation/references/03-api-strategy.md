# API strategy

## Factory and EasyScore

Use `Factory` and `EasyScore` for conventional notation where concise code is more valuable than exact low-level control.

Good uses:

- normal staves and voices;
- quick prototypes;
- straightforward notes and modifiers;
- examples that closely match official tutorials.

`EasyScore` parses a compact notation language and produces VexFlow objects. It is convenient but should not become the application's persisted domain format.

## Native API

Use native classes for M25 rhythm patterns and interactive editors.

Reasons:

- precise control of each duration and rest;
- explicit triplet grouping;
- custom beaming;
- responsive redraws;
- element attributes for interaction;
- staff-line visibility control;
- direct conversion from a serializable model.

Typical pipeline:

```text
plain rhythm data
  -> StaveNote[]
  -> Beam[] and Tuplet[]
  -> Voice
  -> Formatter
  -> SVG drawing
```

## System

`System` is useful when aligning multiple staves or voices. For one compact rhythm row, a direct `Stave` + `Voice` + `Formatter` pipeline is usually smaller and easier to resize.

## Decision rule

If the user asks to render a user-authored sequence of duration blocks, choose the native API unless the current code already has a stable Factory abstraction.
