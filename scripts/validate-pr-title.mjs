#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { exit } from 'node:process';

const TITLE_PATTERN =
  /^(feat|fix|refactor|perf|test|docs|chore|ci|build)(\([a-z0-9][a-z0-9-]*\))?(!)?: .+/;

export const VALID_EXAMPLES = [
  'feat: add session history',
  'fix(ui): prevent horizontal modal overflow',
  'feat(session)!: replace stored session format',
  'refactor(rhythm): simplify notation renderer',
  'perf(pwa): reduce initial bundle size',
  'test(session): cover cancellation behavior',
  'docs(release): document version workflow',
  'chore(release): configure release please',
  'ci(release): validate conventional pull request titles',
  'build(pwa): refresh service worker assets',
];

export const INVALID_EXAMPLES = [
  'update things',
  'changes',
  'final fixes',
  'work',
  'feat(scope) add missing colon',
  'feature(ui): unsupported type',
  'fix(UI): uppercase scope is not allowed',
];

export function isValidPrTitle(title) {
  return TITLE_PATTERN.test(title);
}

function assertExamples() {
  for (const title of VALID_EXAMPLES) {
    if (!isValidPrTitle(title)) {
      throw new Error(`Expected valid PR title: ${title}`);
    }
  }

  for (const title of INVALID_EXAMPLES) {
    if (isValidPrTitle(title)) {
      throw new Error(`Expected invalid PR title: ${title}`);
    }
  }

  console.log('pr title examples ok');
}

function validateTitle(title) {
  if (!title) {
    console.error('Missing PR title to validate.');
    exit(1);
  }

  if (!isValidPrTitle(title)) {
    console.error(`Invalid PR title: ${title}`);
    console.error(
      'Expected Conventional Commit format, for example: feat(rhythm): improve routine creation',
    );
    exit(1);
  }

  console.log('pr title ok');
}

function runCli() {
  const input = process.argv[2];

  if (input === '--self-test') {
    assertExamples();
    exit(0);
  }

  validateTitle(input);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
