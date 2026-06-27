# VexFlow Music Notation skill for GitHub Copilot

This directory is a project-level GitHub Copilot agent skill.

## Install

Unzip the package at the root of the target repository. The final path must be:

```text
.github/skills/vexflow-music-notation/SKILL.md
```

GitHub Copilot can select the skill automatically when a request matches its description. In Copilot CLI it can also be invoked explicitly as:

```text
/vexflow-music-notation
```

## Contents

- `SKILL.md`: main routing and implementation rules.
- `references/`: technical guidance, API and example indexes, and upstream snapshots.
- `examples/`: TypeScript and Angular implementation templates.
- `assets/`: a JSON Schema and starter rhythm presets.
- `scripts/`: local validation and optional upstream refresh.

## Validate

From this skill directory:

```bash
python3 scripts/validate-skill.py
```

The updater is optional and requires network access:

```bash
node scripts/refresh-official-sources.mjs
```

Do not add `allowed-tools: shell` to the skill unless you have reviewed every script and intentionally want Copilot to execute shell commands without confirmation.
