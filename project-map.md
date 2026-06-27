# Project Map

Use this file before broad repo exploration. It is the fast path for locating the owning slice of the M25 application.

## Purpose

- Mobile-first Angular PWA for musical passage practice.
- Two user modes: `M25` and `Rhythms`.
- No backend, no routing, no heavy UI libraries.
- GitHub Pages deployment from `main`.

## Fast Entry Points

- App bootstrap: `src/main.ts`
- Root app shell bootstrap: `src/app/app.ts`
- Global providers: `src/app/app.config.ts`
- Single source app version export: `src/app/core/app-version.ts`
- Global page styles: `src/styles.scss`
- GitHub Pages base href and budgets: `angular.json`
- PWA manifest: `public/manifest.webmanifest`
- Pages workflow: `.github/workflows/deploy-pages.yml`
- Release workflow: `.github/workflows/release-please.yml`
- PR title validation workflow: `.github/workflows/validate-pr-title.yml`
- Release config: `release-please-config.json`, `.release-please-manifest.json`

## Main Architecture

### Root Composition

- `src/app/app.ts`
  - Thin bootstrap component.
  - Starts wake lock handling.
  - Syncs document language and title.
- `src/app/app.html`
  - Renders only the practice shell component.

### Core Domain

- `src/app/core/models/practice.models.ts`
  - Canonical domain types and enums.
  - Shared constants for persistence and UI options.
- `src/app/core/data/rhythm-presets.ts`
  - Built-in rhythm presets.
  - Preset names are translation keys, not final UI strings.
- `src/app/core/services/m25-state.service.ts`
  - Main application state facade.
  - Persistence, routines, custom rhythms, active practice, settings.
  - Primary target for behavior changes and most logic tests.
- `src/app/core/services/m25-labels.service.ts`
  - JSON-backed labels and translated musical block metadata.
  - Use this instead of hardcoding visible text.
- `src/app/core/services/m25-storage.service.ts`
  - LocalStorage access wrapper.
- `src/app/core/services/m25-feedback.service.ts`
  - Transient toast/snackbar message store. Notify after an operation completes.
- `src/app/core/services/m25-wake-lock.service.ts`
  - Screen wake lock lifecycle only.

### Rhythm notation (VexFlow)

- `src/app/core/notation/rhythm-notation.model.ts`
  - Atom-level notation types (durations, tuplets, beam groups). VexFlow-free.
- `src/app/core/notation/rhythm-transform.ts`
  - Pure transform from authoring `BlockKind[]` to atoms + beam groups.
  - Triplet blocks expand to three eighth atoms; beams grouped by quarter-note beat.
- `src/app/core/notation/render-rhythm.ts`
  - The only module that imports VexFlow. Renders atoms to a responsive SVG with real beams and tuplets.
- `src/app/features/notation/rhythm-notation.component.ts`
  - Standalone presentational component. ResizeObserver redraw, cleanup on destroy.
  - Loaded lazily via `@defer` so VexFlow stays out of the initial bundle.

### Localization Assets

- `src/app/core/i18n/locales/en.json`
- `src/app/core/i18n/locales/es.json`
- `src/app/core/i18n/locales/de.json`

All visible labels should come from these files through `M25LabelsService`.

### Practice UI

- `src/app/features/practice/practice-shell.component.*`
  - Main screen orchestrator.
  - Hosts home, practice, studio, back-navigation, settings overlay, and completion overlay.
  - Theme and button customization CSS variables live here.
- `src/app/features/completion/completion-overlay.component.*`
  - Full-screen completion overlay for M25 and rhythm completions.
  - Owns celebration visuals and mode-specific completion actions.
- `src/app/features/home/home-screen.component.*`
  - Main entry view.
  - Mode selection happens here, outside settings.
- `src/app/features/practice/views/m25-practice-view.component.*`
  - Center panel for M25 mode.
- `src/app/features/practice/views/rhythm-practice-view.component.*`
  - Center panel for Rhythms mode.
- `src/app/features/practice/views/history-list-view.component.*`
  - Simple saved-session list opened from settings.
  - Shows the latest records first and opens individual record details.
- `src/app/features/practice/views/history-detail-view.component.*`
  - Full saved-session detail view with deletion.
- `src/app/features/studio/routine-studio.component.*`
  - Full-screen routine preparation flow.
- `src/app/features/studio/pattern-studio.component.*`
  - Full-screen rhythm creation flow.

### Settings UI

- `src/app/features/settings/settings-sheet.component.*`
  - Native modal `<dialog>` (top-layer, Escape/focus handled by the platform, jsdom fallback).
  - Contains general settings plus mode-specific settings only.
- `src/app/features/settings/sections/appearance-settings-section.component.*`
  - General settings: language, theme, button tone, button shape, session-start defaults, history entry point.
- `src/app/features/settings/sections/m25-settings-section.component.*`
  - M25-specific controls.
- `src/app/features/settings/sections/rhythm-settings-section.component.*`
  - Rhythm-specific controls.
- `src/app/features/settings/sections/routine-editor-section.component.*`
  - Shared routine editor used by the routine studio.
- `src/app/features/settings/sections/rhythm-builder-section.component.*`
  - Shared rhythm builder used by the pattern studio.
- `src/app/features/settings/sections/settings-section.shared.scss`
  - Shared section-level settings styling.

### Feedback

- `src/app/features/feedback/feedback-toasts.component.*`
  - Accessible live-region toasts mounted in the practice shell.

### Shared Utilities

- `src/app/shared/utils/dom-event.utils.ts`
  - Small DOM event readers for inputs, selects, and checkboxes.

## Test Map

- `src/app/app.spec.ts`
  - Root composition and high-level appearance attributes.
- `src/app/core/services/m25-state.service.spec.ts`
  - Main logic coverage: persistence, targets, negatives, routines, active rhythm progress, completion-overlay state.
- `src/app/core/services/m25-labels.service.spec.ts`
  - Translation and label switching coverage.
- `src/app/core/notation/rhythm-transform.spec.ts`
  - Beam grouping, triplet expansion, mixed groups (pure, no DOM).
- `src/app/core/notation/render-rhythm.spec.ts`
  - VexFlow render orchestration: single SVG, redraw replaces, tuplets/beams per group.
- `src/app/core/services/m25-feedback.service.spec.ts`
  - Feedback store behavior.
- `src/app/features/settings/settings-sheet.component.spec.ts`
  - Dialog open, visible content, close, keyboard.
- `e2e/` (Playwright)
  - End-to-end flows across desktop, mobile portrait, and mobile landscape.
  - `completion.spec.ts` covers completion overlays and notation contrast.

If behavior changes, prefer adding or updating tests in the service spec first.

## Edit Routing Guide

- Visible text or translations: locale JSON files or `M25LabelsService`.
- Settings or persistence rules: `m25-state.service.ts` and related tests.
- Built-in rhythm definitions: `rhythm-presets.ts`.
- Practice layout or responsive behavior: practice shell or view components.
- Settings dialog layout: settings components.
- PWA or deployment: `manifest.webmanifest`, `index.html`, `angular.json`, workflow.

## Validation Commands

- Tests: `npm test -- --watch=false`
- Production build: `npm run build`
- End-to-end: `npm run e2e` (auto-starts the dev server on port 4327)
- E2E UI / report: `npm run e2e:ui`, `npm run e2e:report`
- Release config checks: `npm run validate:pr-title`, `npm run validate:release`

## Release Automation

- `.github/workflows/release-please.yml`
  - Runs Release Please on `push` to `main` and on manual dispatch.
- `release-please-config.json`
  - Defines changelog sections, SemVer behavior, and bootstrap settings.
- `.release-please-manifest.json`
  - Stores the tracked current version for the root package.
- `CHANGELOG.md`
  - User-facing release notes managed by Release Please after bootstrap.
- `docs/RELEASING.md`
  - Maintainer-facing release workflow guide.
- `scripts/validate-pr-title.mjs`
  - Conventional PR title validator used by CI and local checks.
- `scripts/validate-release-setup.mjs`
  - Local validation for release config, version sourcing, and PR title rules.

## Deployment Notes

- GitHub Pages path is `/Twenty-Five-Method/`.
- Production `baseHref` must stay aligned with repo casing in `angular.json`.
- Output for Pages upload is `dist/twenty-five-method/browser`.

## Maintenance Rule

When structure changes meaningfully, update this map in the same change so future work can start here instead of rediscovering the repo.