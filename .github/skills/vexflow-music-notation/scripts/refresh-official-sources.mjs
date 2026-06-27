#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'references', 'upstream');

const sources = [
  ['getting-started.md', 'https://raw.githubusercontent.com/vexflow/vexflow-examples/main/src/guides/getting-started.md'],
  ['tutorial.md', 'https://raw.githubusercontent.com/vexflow/vexflow-examples/main/src/guides/tutorial.md'],
  ['src-index.ts', 'https://raw.githubusercontent.com/vexflow/vexflow/main/src/index.ts'],
  ['package.json', 'https://raw.githubusercontent.com/vexflow/vexflow/main/package.json'],
  ['VEXFLOW.md', 'https://raw.githubusercontent.com/vexflow/vexflow/main/VEXFLOW.md'],
  ['VEXFLOW-LICENSE.txt', 'https://raw.githubusercontent.com/vexflow/vexflow/main/LICENSE'],
];

await mkdir(base, { recursive: true });

for (const [filename, url] of sources) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'vexflow-music-notation-skill' },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  const text = await response.text();
  await writeFile(resolve(base, filename), text, 'utf8');
  console.log(`Updated ${filename}`);
}

console.log('Official source snapshots refreshed. Review changes before committing.');
