import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { importSnapshot, SNAPSHOT_IMPORT_LOCK } from '../lib/importer.mjs';

const fixture = path.resolve('fixtures/wop-publication-snapshot-v2');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function storage(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-research-import-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const destination = path.join(root, 'wop-publication-snapshot-v2');
  await importSnapshot(fixture, destination);
  const file = path.join(destination, 'snapshot.json');
  return { root, destination, file, original: await fs.readFile(file) };
}

test('import rejects a stale raw-byte base and preserves the newer destination', async t => {
  const { root, destination, file, original } = await storage(t);
  const changed = Buffer.concat([original, Buffer.from('\n')]);
  await fs.writeFile(file, changed);
  await assert.rejects(importSnapshot(fixture, destination, {
    expectedSnapshotHash: hash(original)
  }), /Snapshot changed.*expected base/);
  assert.deepEqual(await fs.readFile(file), changed);
  assert.deepEqual(await fs.readdir(root), ['wop-publication-snapshot-v2']);

  // A matching raw-byte base remains valid even when the import normalizes
  // insignificant whitespace. The existing two-argument API still works.
  await importSnapshot(fixture, destination, { expectedSnapshotHash: hash(changed) });
  assert.deepEqual(await fs.readFile(file), original);
  await importSnapshot(fixture, destination);
});

test('a held import lock rejects every writer without altering or removing the lock', async t => {
  const { root, destination, file, original } = await storage(t);
  const lockPath = path.join(root, SNAPSHOT_IMPORT_LOCK);
  await fs.writeFile(lockPath, 'other writer', { flag: 'wx' });
  for (const options of [{}, { expectedSnapshotHash: hash(original) }]) {
    await assert.rejects(importSnapshot(fixture, destination, options), /Another snapshot import holds the lock/);
    assert.deepEqual(await fs.readFile(file), original);
    assert.equal(await fs.readFile(lockPath, 'utf8'), 'other writer');
  }
  await fs.rm(lockPath);
  await importSnapshot(fixture, destination, { expectedSnapshotHash: hash(original) });
  assert.deepEqual(await fs.readdir(root), ['wop-publication-snapshot-v2']);
});

test('an invalid or missing expected base cannot create a destination', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-research-import-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const destination = path.join(root, 'wop-publication-snapshot-v2');
  for (const expectedSnapshotHash of ['', null, ['0'.repeat(64)]]) {
    await assert.rejects(importSnapshot(fixture, destination, { expectedSnapshotHash }), /expectedSnapshotHash must/);
  }
  await assert.rejects(importSnapshot(fixture, destination, { expectedSnapshotHash: '0'.repeat(64) }), /Snapshot changed/);
  assert.deepEqual(await fs.readdir(root), []);
});

test('rollback can preserve the validated source bytes under the same import lock', async t => {
  const { root, destination, file, original } = await storage(t);
  const recovery = path.join(root, 'recovery');
  await fs.mkdir(recovery);
  const recoveryBytes = Buffer.from(`${JSON.stringify(JSON.parse(original))}\n\n`);
  await fs.writeFile(path.join(recovery, 'snapshot.json'), recoveryBytes);
  await importSnapshot(recovery, destination, {
    expectedSnapshotHash: hash(original), preserveSourceBytes: true
  });
  assert.deepEqual(await fs.readFile(file), recoveryBytes);
  await assert.rejects(importSnapshot(fixture, destination, {
    expectedSnapshotHash: hash(original), preserveSourceBytes: true
  }), /Snapshot changed/);
  assert.deepEqual(await fs.readFile(file), recoveryBytes);
});
