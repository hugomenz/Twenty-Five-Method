#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys

BASE = Path(__file__).resolve().parent.parent
SKILL = BASE / 'SKILL.md'

errors: list[str] = []

if not SKILL.exists():
    errors.append('SKILL.md is missing.')
else:
    text = SKILL.read_text(encoding='utf-8')
    match = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not match:
        errors.append('SKILL.md has no valid YAML frontmatter block.')
    else:
        frontmatter = match.group(1)
        for field in ('name:', 'description:'):
            if field not in frontmatter:
                errors.append(f'SKILL.md frontmatter is missing {field}')
        name_match = re.search(r'^name:\s*(.+)$', frontmatter, re.M)
        if name_match and not re.fullmatch(r'[a-z0-9-]+', name_match.group(1).strip()):
            errors.append('Skill name must be lowercase with hyphens.')

required = [
    'README.md',
    'references/00-navigation.md',
    'references/10-angular-integration.md',
    'references/14-m25-rhythm-integration.md',
    'references/15-api-catalog.md',
    'references/18-source-manifest.md',
    'examples/render-rhythm.ts',
    'examples/angular-rhythm-notation.component.ts',
    'assets/rhythm-pattern.schema.json',
    'assets/rhythm-presets.json',
]
for rel in required:
    if not (BASE / rel).exists():
        errors.append(f'Missing required file: {rel}')

for rel in ('assets/rhythm-pattern.schema.json', 'assets/rhythm-presets.json'):
    try:
        json.loads((BASE / rel).read_text(encoding='utf-8'))
    except Exception as exc:
        errors.append(f'Invalid JSON in {rel}: {exc}')

if errors:
    print('Validation failed:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print('Skill validation passed.')
