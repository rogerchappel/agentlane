import test from 'node:test';
import assert from 'node:assert/strict';

import { extractProtectedPathHints } from '../dist/index.js';

test('extracts path hints from AGENTS guidance lines', () => {
  const input = [
    '# Repo Rules',
    '',
    '- Stop and ask before touching `scripts/release/` or `.github/workflows/`.',
    '- Ignore unrelated prose.'
  ].join('\n');

  assert.deepEqual(extractProtectedPathHints(input), ['.github/workflows/**', 'scripts/release/**']);
});
