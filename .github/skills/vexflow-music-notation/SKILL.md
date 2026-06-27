---
name: vexflow-music-notation
description: "Design, implement, refactor, test, and debug VexFlow 5 music-notation rendering in TypeScript web applications, especially Angular mobile PWAs. Use for VexFlow installation, SVG or Canvas rendering, notes, rests, beams, tuplets, fonts, responsive layouts, interaction, rhythm-pattern editors, and the M25 practice application."
license: MIT; see LICENSE.txt
metadata:
  version: 1.0.0
  upstream: vexflow/vexflow
  upstream-package-snapshot: 5.1.0-main
  generated: 2026-06-27
---

# VexFlow Music Notation — Main Skill

## Mission

Use VexFlow 5 correctly and conservatively. Produce maintainable TypeScript that fits the existing application instead of replacing its architecture. Prefer official VexFlow APIs, installed package types, official examples, and small isolated rendering adapters.

This skill is the routing layer. Read only the reference files required by the task.

## Trigger this skill when

- Installing, upgrading, importing, or configuring `vexflow`.
- Rendering notation with SVG, Canvas, Angular, a PWA, or Node.js.
- Working with `Factory`, `EasyScore`, `Renderer`, `Stave`, `StaveNote`, `Voice`, `Formatter`, `Beam`, `Tuplet`, `Dot`, fonts, modifiers, or interaction.
- Building visual rhythm patterns or a rhythm-pattern editor.
- Fixing missing glyphs, bad spacing, duplicated SVG, resize problems, lifecycle errors, or deployment failures involving VexFlow.
- Implementing notation inside M25.

## Authority order

When sources disagree, use this order:

1. The installed `vexflow` package version, its TypeScript declarations, and its source.
2. The version recorded in `package-lock.json` or the active package manager lockfile.
3. Official VexFlow dev API documentation.
4. Official release API documentation matching the installed major/minor version.
5. Official VexFlow examples and tests.
6. The summaries in this skill.

Never invent a method signature. Search the installed types or official source before using an unfamiliar API.

## First actions

1. Inspect `package.json`, the lockfile, Angular version, rendering component, tests, and deployment configuration.
2. Determine whether the task needs:
   - high-level `Factory` / `EasyScore`, or
   - native classes for precise rhythm rendering and interaction.
3. Choose SVG by default for a mobile interface. Use Canvas only for a demonstrated performance or integration reason.
4. Read the relevant references from the routing table below.
5. Implement the smallest coherent change.
6. Run tests, type checking, production build, and any existing end-to-end checks.
7. Verify the result at narrow portrait and landscape mobile sizes.

## Reference routing

| Task | Read |
|---|---|
| Install, package exports, bundlers | `references/01-installation-and-imports.md` |
| Fonts or missing symbols | `references/02-fonts-and-smufl.md` |
| Choose Factory, EasyScore, or native API | `references/03-api-strategy.md` |
| Renderer, SVG, Canvas, redraw lifecycle | `references/04-rendering-lifecycle.md` |
| Durations, rests, pitches, note models | `references/05-notes-durations-rests.md` |
| Voices, formatting, spacing | `references/06-voices-and-formatting.md` |
| Beams, tuplets, dots | `references/07-beams-tuplets-dots.md` |
| Staves, systems, signatures | `references/08-staves-and-systems.md` |
| Click, hover, selection | `references/09-interactivity.md` |
| Angular implementation | `references/10-angular-integration.md` |
| Mobile, responsive SVG, PWA | `references/11-responsive-mobile-pwa.md` |
| Tests and visual regression | `references/12-testing.md` |
| Errors and diagnosis | `references/13-troubleshooting.md` |
| M25 rhythm experience | `references/14-m25-rhythm-integration.md` |
| Public classes and source modules | `references/15-api-catalog.md` |
| Official demos | `references/16-examples-catalog.md` |
| Version upgrades | `references/17-versioning.md` |
| Upstream source record | `references/18-source-manifest.md` |

## Non-negotiable implementation rules

### Package and imports

- In Angular, install from npm and import from `vexflow`; do not add a CDN script to `index.html`.
- Pin a deliberate package version. Do not silently upgrade the major version while implementing a feature.
- Prefer named imports so the bundle and dependencies are explicit.
- Do not copy VexFlow source into application code.

### Rendering

- Prefer `Renderer.Backends.SVG` for responsive, inspectable, accessible notation.
- Create and redraw notation only after the host element exists.
- Before every full redraw, remove the previous SVG or clear the dedicated host element.
- Use a `ResizeObserver`; do not redraw on every global resize event without throttling or width-change checks.
- Keep VexFlow objects out of application state. Persist a plain serializable rhythm model and rebuild render objects from it.
- Keep rendering pure from the caller's perspective: model in, SVG result out.

### Rhythm patterns

- Use real VexFlow durations, beams, dots, and tuplets. Do not substitute Unicode note characters for engraved notation.
- Use `Voice.Mode.SOFT` or `setStrict(false)` when a visual pattern is intentionally not a complete measure.
- A triplet is a `Tuplet` with an explicit ratio, normally `numNotes: 3` and `notesOccupied: 2`.
- For a rhythm-only guide, use a stable neutral pitch and hide unnecessary staff lines rather than encoding fake melodic meaning.
- The rhythm model must remain independent from VexFlow classes.
- Do not validate that a pattern fills a bar unless the product explicitly requires measure validation.

### Angular

- Encapsulate VexFlow in a focused standalone component, directive, or renderer service.
- Render after `ngAfterViewInit`; redraw when relevant inputs or container width change.
- Disconnect observers and cancel queued work in `ngOnDestroy`.
- Avoid `document.getElementById` for component-owned elements; use `ElementRef` or a direct element argument.
- Guard browser-only APIs if server rendering is enabled.

### Mobile and accessibility

- The notation must remain readable in phone landscape mode without page scrolling.
- Preserve a meaningful SVG `viewBox` and `preserveAspectRatio`.
- Provide an accessible text description next to or on the SVG. The visual score is not a replacement for a textual pattern name.
- Touch targets belong to the application UI, not tiny notation glyphs, unless direct note editing is explicitly requested.
- Respect reduced-motion preferences and safe-area insets.

## M25 product constraints

When working in the M25 repository:

- Treat the PWA artwork as launcher artwork only unless the user explicitly requests it inside the interface.
- Use the text mark `M25` inside the application and a discreet settings control.
- Use neutral terms such as passage, fragment, pattern, rhythm, repetition, session, and practice.
- Prioritize phone landscape mode. The main practice screen should remain minimal and free of permanent navigation.
- Keep the counter system and rhythm notation separate in the domain model. The current rhythm explains *how* to play; the counter records *how many* repetitions were completed.
- Render the current rhythm prominently in the center region, with the decrement action on the left and increment action on the right.
- Presets and custom patterns must use the same serializable schema.

## Verification checklist

Before finishing a VexFlow task:

- The installed VexFlow version is known and recorded.
- No duplicate SVG appears after input changes, navigation, or rotation.
- Fonts load before the first meaningful render.
- Portrait and landscape layouts remain within the viewport.
- Tuplets and beams represent the data correctly.
- The application state contains plain data, not VexFlow instances.
- Unit tests cover model conversion and render orchestration.
- Production build succeeds with the GitHub Pages base path.
- PWA offline behavior does not depend on an uncached third-party font URL.

## Included working material

- `examples/render-rhythm.ts`: native VexFlow rhythm renderer.
- `examples/angular-rhythm-notation.component.ts`: Angular wrapper with resize handling.
- `examples/rhythm-pattern.model.ts`: serializable domain model.
- `examples/render-rhythm.spec.ts`: test outline.
- `assets/rhythm-presets.json`: initial preset data.
- `assets/rhythm-pattern.schema.json`: JSON Schema for persisted patterns.
- `scripts/validate-skill.py`: validates this package.
- `scripts/refresh-official-sources.mjs`: optional updater for official text sources.

## Source discipline

This skill summarizes and indexes official material. It is not a replacement for the installed package declarations. The official URLs, snapshot versions, licenses, and update instructions are in `references/18-source-manifest.md` and `THIRD_PARTY_NOTICES.md`.
