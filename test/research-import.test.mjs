import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { acquireSnapshotImportLease, importSnapshot, releaseSnapshotImportLease, SNAPSHOT_IMPORT_LOCK } from '../lib/importer.mjs';

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

test('an opaque lease remains bound to its destination and rejects forgery or reuse after release', async t => {
  const { root, destination } = await storage(t);
  const other = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-other-import-'));
  t.after(() => fs.rm(other, { recursive: true, force: true }));
  const lease = await acquireSnapshotImportLease(destination);
  try {
    await assert.rejects(importSnapshot(fixture, destination), /Another snapshot import holds the lock/);
    await assert.rejects(importSnapshot(fixture, destination, { lockLease: {} }), /lease is invalid/);
    await assert.rejects(importSnapshot(fixture, path.join(other, 'wop-publication-snapshot-v2'), { lockLease: lease }), /another destination/);
    await importSnapshot(fixture, destination, { lockLease: lease });
    await importSnapshot(fixture, destination, { lockLease: lease });
    assert.ok((await fs.lstat(path.join(root, SNAPSHOT_IMPORT_LOCK))).isFile());
  } finally {
    await releaseSnapshotImportLease(lease);
  }
  await assert.rejects(importSnapshot(fixture, destination, { lockLease: lease }), /lease is invalid/);
  await assert.rejects(releaseSnapshotImportLease(lease), /lease is invalid/);
});

test('an in-use lease cannot be released or used by a second import', async t => {
  const { destination } = await storage(t);
  const lease = await acquireSnapshotImportLease(destination);
  const writeFile = fs.writeFile;
  let signal, release;
  const ready = new Promise(resolve => { signal = resolve; });
  const hold = new Promise(resolve => { release = resolve; });
  fs.writeFile = async (file, ...args) => {
    if (String(file).includes('.wop-publication-snapshot-v2.next-') && String(file).endsWith('/snapshot.json')) {
      signal();
      await hold;
    }
    return writeFile(file, ...args);
  };
  let pending;
  try {
    pending = importSnapshot(fixture, destination, { lockLease: lease });
    await ready;
    await assert.rejects(releaseSnapshotImportLease(lease), /already in use/);
    await assert.rejects(importSnapshot(fixture, destination, { lockLease: lease }), /already in use/);
  } finally {
    release();
    if (pending) await pending;
    fs.writeFile = writeFile;
    await releaseSnapshotImportLease(lease);
  }
});

test('import lock cleanup failure does not mask an earlier import error', async t => {
  const { root, destination, file, original } = await storage(t);
  const lockPath = path.join(await fs.realpath(root), SNAPSHOT_IMPORT_LOCK);
  const unlink = fs.unlink, warn = console.warn, warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected lock cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  try {
    await assert.rejects(importSnapshot(fixture, destination, { expectedSnapshotHash: '0'.repeat(64) }), /Snapshot changed.*expected base/);
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  assert.deepEqual(await fs.readFile(file), original);
  assert.match(warnings.join('\n'), /Snapshot import lock cleanup was incomplete/);
  assert.ok((await fs.lstat(lockPath)).isFile());
});

test('import stops and does not remove another process’s replacement lock', async t => {
  const { root, destination, file, original } = await storage(t);
  const realRoot = await fs.realpath(root), lockPath = path.join(realRoot, SNAPSHOT_IMPORT_LOCK);
  const realDestination = path.join(realRoot, path.basename(destination));
  const lstat = fs.lstat, warn = console.warn, warnings = [];
  let replaced = false;
  fs.lstat = async (file, ...args) => {
    if (!replaced && file === realDestination) {
      replaced = true;
      await fs.unlink(lockPath);
      await fs.writeFile(lockPath, 'replacement lock');
    }
    return lstat(file, ...args);
  };
  console.warn = message => warnings.push(message);
  try {
    await assert.rejects(importSnapshot(fixture, destination), /no longer owns its lock/);
  } finally {
    fs.lstat = lstat;
    console.warn = warn;
  }
  assert.equal(await fs.readFile(lockPath, 'utf8'), 'replacement lock');
  assert.deepEqual(await fs.readFile(file), original);
  assert.match(warnings.join('\n'), /Snapshot import lock cleanup was incomplete/);
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
