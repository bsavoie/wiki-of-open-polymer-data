import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'scripts/build.mjs');

test('CLI refuses a snapshot changed after its initial read and preserves the previous site', async t => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-build-source-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const source = path.join(temporary, 'source');
  await fs.cp(path.join(root, 'fixtures/wop-publication-snapshot-v2'), source, { recursive: true });
  const outputs = path.join(root, 'outputs');
  await fs.mkdir(outputs, { recursive: true });
  const output = await fs.mkdtemp(path.join(outputs, 'build-source-test-'));
  await fs.rmdir(output);
  t.after(() => fs.rm(output, { recursive: true, force: true }));

  const run = (args, env = process.env) => spawnSync(process.execPath, [...args, build, source, output], {
    cwd: root, env, encoding: 'utf8'
  });
  const initial = run([]);
  assert.equal(initial.status, 0, initial.stderr);
  const originalIndex = await fs.readFile(path.join(output, 'index.html'));
  const originalData = await fs.readFile(path.join(output, 'data/wop-publication-snapshot-v2/snapshot.json'));

  // Alter the disposable source after the CLI has read the exact bytes it will
  // validate and render. No canonical snapshot or restricted candidate is used.
  const preload = path.join(temporary, 'change-after-read.mjs');
  await fs.writeFile(preload, `
import fs from 'node:fs/promises';
import path from 'node:path';
const target = path.join(process.env.WOP_FIXTURE_SOURCE, 'snapshot.json');
const readFile = fs.readFile;
let changed = false;
fs.readFile = async function(file, ...args) {
  const data = await readFile.call(this, file, ...args);
  if (!changed && String(file) === target) {
    changed = true;
    const updated = JSON.parse(data.toString());
    updated.polymers[0].canonicalName = 'Changed during build';
    await fs.writeFile(target, JSON.stringify(updated, null, 2) + '\\n');
  }
  return data;
};
`);
  const raced = run(['--import', preload], { ...process.env, WOP_FIXTURE_SOURCE: await fs.realpath(source) });
  assert.notEqual(raced.status, 0);
  assert.match(raced.stderr, /Snapshot changed while building; publication cancelled/);
  const changed = JSON.parse(await fs.readFile(path.join(source, 'snapshot.json'), 'utf8'));
  assert.equal(changed.polymers[0].canonicalName, 'Changed during build');
  assert.deepEqual(await fs.readFile(path.join(output, 'index.html')), originalIndex);
  assert.deepEqual(await fs.readFile(path.join(output, 'data/wop-publication-snapshot-v2/snapshot.json')), originalData);
});
