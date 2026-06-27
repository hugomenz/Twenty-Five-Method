# Versioning and upgrades

## Snapshot used by this skill

At generation time, the official repository `main` branch reported package version `5.1.0`. The public release API site prominently exposed `5.0.0` plus a dev reference. This means documentation can lag the repository.

## Upgrade procedure

1. Record the current installed version and lockfile state.
2. Read official release notes and changelog.
3. Inspect package `exports` and TypeScript declarations.
4. Search for changed signatures used by the application.
5. Upgrade in a dedicated commit.
6. Run unit, browser, visual, production-build, PWA, and GitHub Pages checks.
7. Confirm font behavior and bundle size.

## Avoid

- coding against dev documentation while the project uses an older release;
- adding `as any` to hide API changes;
- mixing v4 tutorials with v5 imports;
- using undocumented internal tables or generated font modules;
- assuming a repository package version is already published to npm.

## V4 versus V5

The official VexFlow organization repository contains version 5+. The historical 4.x repository remains under `0xfe/vexflow`. Use v5 sources for this skill.
