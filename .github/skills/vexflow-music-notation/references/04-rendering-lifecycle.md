# Rendering lifecycle

## SVG default

SVG is the default for a phone-first application because it scales cleanly, can expose element attributes, and is easy to inspect and test.

```ts
const renderer = new Renderer(host, Renderer.Backends.SVG);
renderer.resize(width, height);
const context = renderer.getContext();
```

## Full redraw strategy

For a small rhythm row, a full redraw is simpler and safer than mutating old VexFlow objects.

1. Calculate width from the host.
2. Skip if width is zero.
3. Clear only the notation host.
4. Create a new renderer and VexFlow object graph.
5. Draw.
6. Set responsive SVG attributes and accessible metadata.

```ts
host.replaceChildren();
```

Do not clear an ancestor that contains Angular-managed controls.

## Resize handling

Use `ResizeObserver` on the notation host. Schedule one redraw per animation frame and skip identical widths.

Do not:

- attach multiple observers after repeated input changes;
- redraw continuously while width is unchanged;
- use arbitrary timeouts as the main lifecycle mechanism;
- preserve old VexFlow instances across width changes.

## Responsive SVG

After drawing:

```ts
const svg = host.querySelector('svg');
svg?.setAttribute('viewBox', `0 0 ${width} ${height}`);
svg?.setAttribute('preserveAspectRatio', 'xMidYMid meet');
svg?.setAttribute('role', 'img');
svg?.setAttribute('aria-label', accessibleLabel);
```

CSS:

```css
:host svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
```

## Canvas

Canvas can be useful for very large scores or specialized pixel workflows, but it requires explicit device-pixel-ratio handling and is less convenient for accessible or interactive notation. Do not choose it by habit.
