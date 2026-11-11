import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('retired v1 migration refuses to replace the authoritative v2 corpus', async () => {
  const snapshot = 'public-data/wop-publication-snapshot-v2/snapshot.json';
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const before = hash(await fs.readFile(snapshot));
  const result = spawnSync(process.execPath, ['scripts/migrate-structures-v2.mjs'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /migration is retired/i);
  assert.equal(hash(await fs.readFile(snapshot)), before);
});
