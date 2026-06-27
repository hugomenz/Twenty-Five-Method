---
name: project-map-first
description: 'Use when working in this repository and you need to navigate code quickly. Read project-map.md first, then jump only to the owning slice instead of scanning the whole repo. Triggers: project map, repo map, architecture map, where is X, fastest path, avoid broad search.'
user-invocable: false
---

# Project Map First

Use this skill for any code task in this repository where the first instinct would otherwise be broad search.

## Workflow

1. Read `project-map.md` before exploring implementation files.
2. Choose the smallest owning slice from the map:
   - core state and persistence
   - labels and localization
   - practice UI
   - settings UI
   - PWA or deployment
3. Read only the anchor files named in the map for that slice.
4. Form one local hypothesis and validate it before expanding further.
5. Update `project-map.md` if your change materially alters project structure.

## Rules

- Do not start with repo-wide reading when `project-map.md` already identifies the owning area.
- Prefer service-level reads before view-level reads when behavior is state-driven.
- Prefer the dedicated service specs before broad test exploration when changing logic.
- Only widen search after a nearby validation falsifies the current hypothesis.

## Primary Reference

Open `project-map.md` at the repository root.