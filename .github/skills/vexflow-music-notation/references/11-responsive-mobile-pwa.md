# Responsive mobile PWA guidance

## Primary target

Design for a phone placed in front of the player, with landscape mode as the primary practice orientation.

## Layout contract

- Notation receives the center region.
- Decrement occupies the left side.
- Increment occupies the right side.
- Settings remain discreet and outside the rapid-tap zones.
- The practice screen does not scroll.

## Notation sizing

- Derive width from the actual host, not `window.innerWidth`.
- Use a compact fixed logical SVG height and a responsive width.
- Increase width spacing before shrinking glyphs below comfortable readability.
- For very long custom patterns, prefer horizontal paging, grouping, or line wrapping in the builder. Do not make the main practice screen horizontally scroll during active playing.

## Rotation

Phone rotation can trigger several intermediate sizes. Coalesce redraws into one animation frame and skip unchanged widths.

## PWA assets

Keep all required runtime assets local and precached. The launcher icon may remain separate from the in-app interface.

## Wake lock

Screen wake lock is an application concern, not a VexFlow concern. Request it only after user interaction, handle rejection, and reacquire it after visibility changes when appropriate.

## Accessibility

Include a human-readable pattern label such as “quarter, three eighth-note triplets, quarter.” Do not force assistive technology to interpret SVG paths.
