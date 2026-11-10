import test from 'node:test';
import assert from 'node:assert/strict';
import { digest, validId } from './server.mjs';

test('plan IDs accept stable project names only', () => {
  assert.equal(validId('PLAN-20261110-feature'), true);
  assert.equal(validId('A_01'), true);
  assert.equal(validId('../secret'), false);
  assert.equal(validId('file.md'), false);
  assert.equal(validId(''), false);
  assert.equal(validId('a'.repeat(101)), false);
});

test('document revisions change with document contents', () => {
  assert.equal(digest('same plan'), digest('same plan'));
  assert.notEqual(digest('draft'), digest('approved'));
  assert.match(digest('sample'), /^[a-f0-9]{64}$/);
});
