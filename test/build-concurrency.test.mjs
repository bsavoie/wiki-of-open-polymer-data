import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { buildSite } from '../lib/site.mjs';

const fixture = await readAndValidateSnapshot(path.resolve('fixtures/wop-publication-snapshot-v2'));

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-build-lock-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const output = path.join(root, 'site');
  const lockPath = path.join(await fs.realpath(root), '.site.wop-build.lock');
  await buildSite(fixture, output, { allowExternal: true });
  return { root, output, lockPath };
}

test('overlapping builds cannot replace the same output or bypass a lock with a parent alias', async t => {
  const { root, output, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  const updated = structuredClone(fixture);
  updated.polymers[0].canonicalName = 'Updated sample polyethylene';
  const aliasParent = path.join(root, 'alias');
  await fs.symlink(root, aliasParent, 'dir');

  let signalReady;
  const ready = new Promise(resolve => { signalReady = resolve; });
  let release;
  const hold = new Promise(resolve => { release = resolve; });
  const first = buildSite(updated, output, {
    allowExternal: true,
    beforePublish: async () => { signalReady(); await hold; }
  });
  try {
    await ready;
    await assert.rejects(buildSite(fixture, output, { allowExternal: true }), /output lock/);
    await assert.rejects(buildSite(fixture, path.join(aliasParent, 'site'), { allowExternal: true }), /output lock/);
    assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
  } finally {
    release();
    await first;
  }
  const published = JSON.parse(await fs.readFile(path.join(output, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
  assert.equal(published.polymers[0].canonicalName, updated.polymers[0].canonicalName);
  await assert.rejects(fs.lstat(lockPath), { code: 'ENOENT' });
});

test('failed builds remove their own lock and leave the previous site intact', async t => {
  const { output, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  await assert.rejects(buildSite(fixture, output, {
    allowExternal: true,
    beforePublish: () => { throw new Error('Injected publication failure'); }
  }), /Injected publication failure/);
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
  await assert.rejects(fs.lstat(lockPath), { code: 'ENOENT' });
  await buildSite(fixture, output, { allowExternal: true });
});

test('an existing lock is left untouched and the previous site is preserved', async t => {
  const { output, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  await fs.writeFile(lockPath, 'another builder or an uninspected stale lock');
  await assert.rejects(buildSite(fixture, output, { allowExternal: true }), /output lock/);
  assert.equal(await fs.readFile(lockPath, 'utf8'), 'another builder or an uninspected stale lock');
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
});

test('lock-cleanup failure after a site swap does not turn success into publication failure', async t => {
  const { output, lockPath } = await setup(t);
  const updated = structuredClone(fixture);
  updated.polymers[0].canonicalName = 'Updated sample polyethylene';
  const unlink = fs.unlink;
  const warn = console.warn;
  const warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected lock cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  let result;
  try {
    result = await buildSite(updated, output, { allowExternal: true });
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  const published = JSON.parse(await fs.readFile(path.join(output, 'data/wop-publication-snapshot-v2/snapshot.json'), 'utf8'));
  assert.equal(published.polymers[0].canonicalName, updated.polymers[0].canonicalName);
  assert.equal(result.retainedLock, lockPath);
  assert.match(warnings.join('\n'), /output-lock cleanup was incomplete/);
  assert.ok((await fs.lstat(lockPath)).isFile());
});

test('lock-cleanup failure does not mask a preceding build error', async t => {
  const { output, lockPath } = await setup(t);
  const original = await fs.readFile(path.join(output, 'index.html'));
  const unlink = fs.unlink;
  const warn = console.warn;
  const warnings = [];
  fs.unlink = async (file, ...args) => {
    if (file === lockPath) throw Object.assign(new Error('Injected lock cleanup failure'), { code: 'EACCES' });
    return unlink(file, ...args);
  };
  console.warn = message => warnings.push(message);
  try {
    await assert.rejects(buildSite(fixture, output, {
      allowExternal: true,
      beforePublish: () => { throw new Error('Injected publication failure'); }
    }), /Injected publication failure/);
  } finally {
    fs.unlink = unlink;
    console.warn = warn;
  }
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), original);
  assert.match(warnings.join('\n'), /output-lock cleanup was incomplete/);
  assert.ok((await fs.lstat(lockPath)).isFile());
});
