---
title: "Getting Started"
source: https://github.com/vexflow/vexflow-examples/blob/main/src/guides/getting-started.md
snapshot: 2026-06-27
license: MIT
---

# VexFlow

VexFlow is an open-source library for rendering music notation. It is written in TypeScript, outputs scores to HTML Canvas and SVG, and works in browsers and Node.js projects.

## Quick Start

The official guide requires UTF-8 and demonstrates the core browser build with explicit font loading:

```html
<meta charset="utf-8" />
<div id="output"></div>
<script src="https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow-core.js"></script>
<script>
VexFlow.loadFonts('Bravura', 'Academico').then(() => {
  VexFlow.setFonts('Bravura', 'Academico');
  // Render here.
});
</script>
```

For bundler projects:

```bash
npm install vexflow
```

## Factory and EasyScore

The official guide identifies Factory as the recommended high-level creation API and EasyScore as a concise voice and note API.

```js
const factory = new VexFlow.Factory({
  renderer: { elementId: 'output', width: 500, height: 200 },
});
const score = factory.EasyScore();
const system = factory.System();
system
  .addStave({
    voices: [
      score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
      score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
    ],
  })
  .addClef('treble')
  .addTimeSignature('4/4');
factory.draw();
```

## Native API

```js
const { Renderer, Stave } = VexFlow;
const div = document.getElementById('output');
const renderer = new Renderer(div, Renderer.Backends.SVG);
renderer.resize(500, 500);
const context = renderer.getContext();
const stave = new Stave(10, 40, 400);
stave.addClef('treble').addTimeSignature('4/4');
stave.setContext(context).draw();
```

This local file is a compact snapshot. Consult the official source URL for the complete current guide.
