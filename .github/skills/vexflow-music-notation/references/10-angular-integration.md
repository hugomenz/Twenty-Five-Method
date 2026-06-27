# Angular integration

## Recommended component boundary

Create a standalone presentational component whose inputs are plain data:

```ts
@Component({
  selector: 'app-rhythm-notation',
  standalone: true,
  template: '<div #host class="notation-host"></div>',
})
export class RhythmNotationComponent { /* ... */ }
```

Responsibilities:

- own the VexFlow host;
- observe available width;
- convert the current pattern to VexFlow objects;
- redraw safely;
- expose a textual accessible label.

It should not own session counters, routine navigation, or persistence.

## Lifecycle

- `ngAfterViewInit`: create the observer and schedule first render.
- input change: schedule render.
- `ngOnDestroy`: disconnect observer and cancel an animation frame.

## Change detection

Rendering into an element with VexFlow is an imperative side effect. Keep it localized. Angular continues to own the surrounding DOM; VexFlow owns only the empty host.

## Browser-only APIs

When SSR or prerendering is enabled, guard `ResizeObserver`, `requestAnimationFrame`, `document`, and VexFlow rendering with `isPlatformBrowser` or an equivalent browser boundary.

## Signals or inputs

Signals are acceptable, but the VexFlow renderer should receive a snapshot of plain values. Avoid effects that trigger recursive redraws due to DOM measurements.

## Tests

- Test model conversion as pure functions without a browser.
- Test component orchestration with a mocked renderer adapter or JSDOM where available.
- Keep pixel-perfect comparisons in a separate visual test layer.
