#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INVALID_EXAMPLES,
  VALID_EXAMPLES,
  isValidPrTitle,
} from './validate-pr-title.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectFiles(relativeDir) {
  const directory = path.join(rootDir, relativeDir);
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry);
    const absolutePath = path.join(rootDir, relativePath);

    if (statSync(absolutePath).isDirectory()) {
      files.push(...collectFiles(relativePath));
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

function assertPrTitleExamples() {
  for (const title of VALID_EXAMPLES) {
    assert.equal(isValidPrTitle(title), true, `Expected valid PR title: ${title}`);
  }

  for (const title of INVALID_EXAMPLES) {
    assert.equal(isValidPrTitle(title), false, `Expected invalid PR title: ${title}`);
  }
}

function assertReleasePleaseConfig(packageVersion) {
  const config = readJson('release-please-config.json');
  const manifest = readJson('.release-please-manifest.json');

  assert.equal(config['release-type'], 'node');
  assert.equal(config.versioning, 'default');
  assert.equal(config['bump-minor-pre-major'], false);
  assert.equal(config['bump-patch-for-minor-pre-major'], false);
  assert.equal(config['include-component-in-tag'], false);
  assert.equal(config['include-v-in-tag'], true);
  assert.equal(config['always-update'], true);
  assert.equal(config.packages?.['.']?.['changelog-path'], 'CHANGELOG.md');
  assert.equal(manifest['.'], packageVersion);

  const sections = new Map(
    config['changelog-sections'].map((entry) => [entry.type, entry]),
  );
  assert.equal(sections.get('feat')?.section, 'Features');
  assert.equal(sections.get('fix')?.section, 'Bug Fixes');
  assert.equal(sections.get('perf')?.section, 'Improvements');
  assert.equal(sections.get('refactor')?.section, 'Improvements');
  assert.equal(sections.get('docs')?.hidden, true);
  assert.equal(sections.get('test')?.hidden, true);
  assert.equal(sections.get('chore')?.hidden, true);
  assert.equal(sections.get('ci')?.hidden, true);
  assert.equal(sections.get('build')?.hidden, true);

  const workflow = readText('.github/workflows/release-please.yml');
  assert.match(workflow, /googleapis\/release-please-action@v5/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /branches:\s+- main/);
  assert.match(workflow, /contents: write/);
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /issues: write/);
  assert.match(workflow, /config-file: release-please-config\.json/);
  assert.match(workflow, /manifest-file: \.release-please-manifest\.json/);
  assert.match(workflow, /token: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);

  const changelog = readText('CHANGELOG.md');
  assert.match(changelog, new RegExp(`## ${escapeRegExp(packageVersion)} `));
  assert.match(changelog, /managed by Release Please/i);
}

function assertSingleVersionSource(packageVersion) {
  const packageLock = readJson('package-lock.json');
  assert.equal(packageLock.version, packageVersion);
  assert.equal(packageLock.packages?.['']?.version, packageVersion);

  const versionHelper = readText('src/app/core/app-version.ts');
  assert.match(versionHelper, /import packageJson from '\.\.\/\.\.\/\.\.\/package\.json';/);
  assert.match(versionHelper, /packageJson\.version/);

  const forbiddenMatches = [];
  for (const relativePath of collectFiles('src')) {
    if (readText(relativePath).includes(packageVersion)) {
      forbiddenMatches.push(relativePath);
    }
  }

  assert.deepEqual(
    forbiddenMatches,
    [],
    `Unexpected hard-coded version literal in source files: ${forbiddenMatches.join(', ')}`,
  );
}

function assertPrTitleWorkflow() {
  const workflow = readText('.github/workflows/validate-pr-title.yml');
  assert.match(workflow, /pull_request_target:/);
  assert.match(workflow, /node scripts\/validate-pr-title\.mjs/);

  const template = readText('.github/pull_request_template.md');
  assert.match(template, /## Summary/);
  assert.match(template, /Feature/);
  assert.match(template, /Bug fix/);
  assert.match(template, /Improvement/);
  assert.match(template, /Internal change/);
  assert.match(template, /Conventional Commit/);
  assert.match(template, /squash merge/i);
}

function main() {
  const packageJson = readJson('package.json');
  assert.match(packageJson.version, /^\d+\.\d+\.\d+$/);

  assertPrTitleExamples();
  assertReleasePleaseConfig(packageJson.version);
  assertSingleVersionSource(packageJson.version);
  assertPrTitleWorkflow();

  console.log('release setup ok');
}

main();