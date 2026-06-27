# Installation and imports

## Angular and other bundler projects

Install a pinned version:

```bash
npm install vexflow@5.1.0
```

Use the version selected by the project owner. If `5.1.0` is not a published release in the target registry, use the latest approved VexFlow 5 release and record it in the lockfile.

Prefer named imports:

```ts
import {
  Beam,
  Dot,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Tuplet,
  Voice,
} from 'vexflow';
```

The package snapshot used by this skill exposes:

- `vexflow` — full entry.
- `vexflow/core` — core entry for deliberate font management.
- `vexflow/bravura` — Bravura-oriented entry.

Do not guess whether a subpath exists. Verify it in the installed package's `exports` field.

## Full entry versus core entry

Use the full `vexflow` entry for normal Angular work. It is the simplest option and includes the common bundled font setup.

Use `vexflow/core` only when bundle composition or font selection has been deliberately designed. In that case, load and select fonts before drawing.

## CDN scripts

The official guides demonstrate script tags because they also support plain HTML. Do not use a CDN script in an Angular application that already has a package manager and build pipeline.

## UTF-8

Keep the application document in UTF-8. The official guides explicitly require UTF-8 to avoid malformed notation symbols.

## GitHub Pages

VexFlow itself does not require special routing. The Angular application still needs the correct GitHub Pages base path and asset paths. Avoid runtime font URLs that are not cached by the service worker.
