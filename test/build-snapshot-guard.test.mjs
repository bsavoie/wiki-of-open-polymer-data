import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { acquireSnapshotBuildGuard } from '../lib/build-snapshot-guard.mjs';
import { importSnapshot, readValidatedSnapshotBytes, SNAPSHOT_IMPORT_LOCK } from '../lib/importer.mjs';
import { buildSite } from '../lib/site.mjs';

const fixture = path.resolve('fixtures/wop-publication-snapshot-v2');

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-build-snapshot-guard-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'wop-publication-snapshot-v2');
  const incoming = path.join(root, 'incoming');
  const output = path.join(root, 'site');
  await importSnapshot(fixture, source);
  await fs.cp(fixture, incoming, { recursive: true });
  const replacement = JSON.parse(await fs.readFile(path.join(incoming, 'snapshot.json'), 'utf8'));
  replacement.polymers[0].alternateNames.push(replacement.polymers[0].canonicalName);
  replacement.polymers[0].canonicalName = 'Updated fixture polymer';
  await fs.writeFile(path.join(incoming, 'snapshot.json'), `${JSON.stringify(replacement, null, 2)}\n`);
  const { raw, snapshot } = await readValidatedSnapshotBytes(source);
  await buildSite(snapshot, output, { allowExternal: true });
  return { root, source, incoming, output, raw, snapshot, lockPath: path.join(await fs.realpath(root), SNAPSHOT_IMPORT_LOCK) };
}

test('snapshot import cannot pass the final build check before the site swap', async t => {
  const { source, incoming, output, raw, snapshot, lockPath } = await setup(t);
  let ready;
  const checked = new Promise(resolve => { ready = resolve; });
  let unblock;
  const wait = new Promise(resolve => { unblock = resolve; });
  const building = buildSite(snapshot, output, {
    allowExternal: true,
    acquirePublishGuard: () => acquireSnapshotBuildGuard(source),
    beforePublish: async () => {
      assert.ok(raw.equals(await fs.readFile(path.join(source, 'snapshot.json'))));
      ready();
      await wait;
    }
  });
  try {
    await checked;
    await assert.rejects(importSnapshot(incoming, source), /snapshot import holds the lock/);
    assert.ok(raw.equals(await fs.readFile(path.join(source, 'snapshot.json'))));
  } finally {
    unblock();
    await building;
  }
  assert.ok(raw.equals(await fs.readFile(path.join(source, 'snapshot.json'))));
  const published = JSON.parse(await fs.readFile(path.join(output, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
  assert.equal(published.polymers[0].canonicalName, snapshot.polymers[0].canonicalName);
  await assert.rejects(fs.lstat(lockPath), { code: 'ENOENT' });
  await importSnapshot(incoming, source);
  assert.equal(JSON.parse(await fs.readFile(path.join(source, 'snapshot.json'), 'utf8')).polymers[0].canonicalName, 'Updated fixture polymer');
});

test('an existing snapshot lock cancels the build without removing the lock or previous site', async t => {
  const { source, output, snapshot, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  await fs.writeFile(lockPath, 'existing operation');
  await assert.rejects(buildSite(snapshot, output, {
    allowExternal: true, acquirePublishGuard: () => acquireSnapshotBuildGuard(source)
  }), /snapshot operation holds the import lock/);
  assert.equal(await fs.readFile(lockPath, 'utf8'), 'existing operation');
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
});

test('failed pre-publication checks release the snapshot lock and preserve the prior site', async t => {
  const { source, output, snapshot, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  await assert.rejects(buildSite(snapshot, output, {
    allowExternal: true,
    acquirePublishGuard: () => acquireSnapshotBuildGuard(source),
    beforePublish: () => { throw new Error('Snapshot changed while building'); }
  }), /Snapshot changed while building/);
  await assert.rejects(fs.lstat(lockPath), { code: 'ENOENT' });
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
});

test('snapshot lock cleanup failure after site swap reports a retained lock without failing the build', async t => {
  const { source, output, snapshot, lockPath } = await setup(t);
  const unlink = fs.unlink;
  const warn = console.warn;
  const warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  let result;
  try {
    result = await buildSite(snapshot, output, {
      allowExternal: true, acquirePublishGuard: () => acquireSnapshotBuildGuard(source)
    });
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  assert.equal(result.retainedSnapshotLock, lockPath);
  assert.match(warnings.join('\n'), /Snapshot publication guard cleanup was incomplete/);
  assert.ok((await fs.lstat(lockPath)).isFile());
});

test('snapshot lock cleanup failure does not mask a prior build failure', async t => {
  const { source, output, snapshot, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  const unlink = fs.unlink;
  const warn = console.warn;
  const warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  try {
    await assert.rejects(buildSite(snapshot, output, {
      allowExternal: true,
      acquirePublishGuard: () => acquireSnapshotBuildGuard(source),
      beforePublish: () => { throw new Error('Snapshot changed while building'); }
    }), /Snapshot changed while building/);
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
  assert.match(warnings.join('\n'), /Snapshot publication guard cleanup was incomplete/);
});
