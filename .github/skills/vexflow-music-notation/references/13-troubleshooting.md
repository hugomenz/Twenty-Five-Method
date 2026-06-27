# Troubleshooting

## Blank host

Check:

- width and height are non-zero;
- the component rendered after view initialization;
- fonts are available;
- the host was not immediately cleared by another effect;
- exceptions are visible in the console.

## Duplicate notation

Cause: appending a new renderer without removing the previous SVG.  
Fix: `host.replaceChildren()` before a full redraw.

## `IncompleteVoice`

Cause: strict voice does not fill its time.  
Fix: use `Voice.Mode.SOFT` for free-form visual patterns, or correct the measure duration when strict notation is intended.

## `TooManyTicks`

Cause: the voice exceeds the configured time.  
Fix: correct the model or select the appropriate voice mode.

## Triplet number missing or misplaced

- construct the tuplet before formatting;
- ensure all member notes are in the same voice;
- increase top space or SVG height;
- inspect `bracketed`, `location`, and `yOffset`.

## Beams look wrong

- create beams before formatting;
- use explicit groups for nonstandard grouping;
- ensure rests and tuplets are represented correctly;
- do not manually move note SVG groups.

## First render differs from later render

Cause: fonts arrived after layout measurements.  
Fix: wait for font readiness and render once.

## SVG clipped on phone

- increase logical height;
- inspect `viewBox`;
- remove `overflow: hidden` from the notation host unless deliberate;
- allow room for stems and tuplet labels.

## GitHub Pages works locally but not after deployment

- verify Angular `base-href`;
- verify service-worker asset paths;
- avoid absolute root paths;
- verify font assets are part of the build output;
- inspect the deployed network panel.
