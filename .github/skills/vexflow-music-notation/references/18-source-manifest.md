# Source manifest

Generated: 2026-06-27

## GitHub Copilot skill format

- About agent skills: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- Add agent skills: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills

The official format requires a lowercase skill directory, a file named `SKILL.md`, and YAML frontmatter with at least `name` and `description`. A skill may also contain referenced Markdown, scripts, examples, and other resources.

## VexFlow sources

- Repository: https://github.com/vexflow/vexflow
- Examples repository: https://github.com/vexflow/vexflow-examples
- Examples website: https://vexflow.github.io/vexflow-examples/
- API documentation: https://vexflow.github.io/vexflow-docs/
- Dev API: https://vexflow.github.io/vexflow-docs/api/dev/
- Release API snapshot: https://vexflow.github.io/vexflow-docs/api/5.0.0/

## Snapshot facts

- `vexflow/vexflow` default branch: `main`.
- `vexflow/vexflow-examples` default branch: `main`.
- Repository `package.json` snapshot version: `5.1.0`.
- Package exports in the snapshot: `.`, `./core`, and `./bravura`.
- VexFlow license: MIT.
- Examples repository license: MIT, with a separate notice for highlight.js assets in the upstream repository.

## Local upstream files

- `upstream/getting-started.md`
- `upstream/tutorial.md`
- `upstream/src-index.ts`
- `upstream/package.json`
- `upstream/VEXFLOW.md`
- `upstream/VEXFLOW-LICENSE.txt`

Use `scripts/refresh-official-sources.mjs` to refresh these files from official raw GitHub URLs.
