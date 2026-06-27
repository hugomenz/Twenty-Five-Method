# Fonts and SMuFL

VexFlow uses music fonts for glyphs and text fonts for labels. Missing, late, or mismatched fonts can produce blank symbols, incorrect spacing, or a first render that changes after fonts arrive.

## Safe default

For a bundled Angular application, prefer the full `vexflow` entry and render only after the component host is ready.

## Explicit font loading

When using the core build or an explicit font strategy:

```ts
import VexFlow from 'vexflow/core';

await VexFlow.loadFonts('Bravura', 'Academico');
VexFlow.setFonts('Bravura', 'Academico');
```

Confirm this API against the installed package version.

## Face-font loading

The official examples also demonstrate `@font-face` plus `document.fonts.ready`. If the app uses this approach:

- bundle the `.woff2` assets locally;
- add them to the Angular build assets;
- wait for `document.fonts.ready` before the first render;
- cache them in the PWA;
- do not include font files inside this Copilot skill.

## Font selection

Common official font names include Bravura, Gonville, Petaluma, Finale Ash, and their associated text fonts. Not every entry bundle includes every font. Verify availability before calling `setFonts`.

## Diagnosis

When glyphs are wrong:

1. Check the installed VexFlow version.
2. Check whether the full or core entry is imported.
3. Check network failures and CSP rules.
4. Check that rendering occurs after fonts are ready.
5. Check that the document is UTF-8.
6. Re-render once after fonts resolve rather than repeatedly polling.
