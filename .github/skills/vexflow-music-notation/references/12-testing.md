# Testing VexFlow integration

## Test layers

### 1. Pure model tests

Test:

- duration-name conversion;
- rest conversion;
- tuplet grouping;
- invalid group detection;
- preset serialization;
- accessible text generation.

These tests should not require VexFlow or the DOM.

### 2. Renderer orchestration tests

Verify that:

- old output is removed before drawing;
- zero-width hosts do not render;
- soft voice mode is used for arbitrary patterns;
- one `Tuplet` is created per group;
- resize changes schedule a redraw;
- destroy disconnects the observer.

Prefer dependency injection or a small adapter if direct VexFlow mocking becomes brittle.

### 3. Browser smoke tests

Render representative patterns:

- quarters only;
- eighths and sixteenths;
- triplet then quarter;
- quarter then triplet;
- rests and dots;
- long custom pattern;
- narrow portrait and landscape widths.

Assert that an SVG exists, has no `NaN`, and fits its host.

### 4. Visual regression

Use stable viewport sizes and bundled fonts. Compare a small curated set, not every possible pattern.

## Build verification

Always run the production Angular build because development mode can hide asset-path, optimization, or SSR issues.
