import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { buildHistoryDirectory, copyHistoryBundle } from '../lib/structure-history.mjs';
import { buildSite } from '../lib/site.mjs';

const source = path.resolve('public-data/structure-history/2026-11-10');

test('canonical history selection follows symlinked snapshot sources', async t => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-source-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const canonical = path.resolve('public-data/wop-publication-snapshot-v2');
  const parentAlias = path.join(temporary, 'public-data-alias');
  const snapshotAlias = path.join(temporary, 'snapshot-alias');
  await fs.symlink(path.resolve('public-data'), parentAlias, 'dir');
  await fs.symlink(canonical, snapshotAlias, 'dir');
  assert.equal(buildHistoryDirectory(canonical), source);
  assert.equal(buildHistoryDirectory(path.join(parentAlias, path.basename(canonical))), source);
  assert.equal(buildHistoryDirectory(snapshotAlias), source);
  assert.equal(buildHistoryDirectory('fixtures/wop-publication-snapshot-v2'), null);
});

test('history regeneration refuses to overwrite an existing archive directory', async () => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-regeneration-'));
  try {
    const marker = path.join(temporary, 'marker');
    await fs.writeFile(marker, 'preserved');
    const result = spawnSync('python3', [
      'scripts/build-structure-history.py', '--reasons', 'scripts/structure-history-reasons.json', '--output', temporary
    ], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /output already exists/i);
    assert.equal(await fs.readFile(marker, 'utf8'), 'preserved');
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
});

test('historical archive is warned, complete, current, and never emitted as loose molfiles', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-test-'));
  try {
    const result = await copyHistoryBundle({ sourceDirectory: source, outputDirectory: temporary, snapshot });
    const files = ['README.md', 'historical-structures.zip', 'index.html', 'registry.json'];
    assert.deepEqual((await fs.readdir(result.destination)).sort(), files);
    for (const file of files) assert.deepEqual(await fs.readFile(path.join(result.destination, file)), await fs.readFile(path.join(source, file)));
    const registry = JSON.parse(await fs.readFile(path.join(source, 'registry.json'), 'utf8'));
    const page = await fs.readFile(path.join(result.destination, 'index.html'), 'utf8');
    assert.match(page, /class="table" tabindex="0" role="region" aria-label="Historical structure records; scroll horizontally"/);
    assert.match(page, /Scroll the table horizontally/);
    const withdrawn = registry.entries.find(entry => entry.status === 'withdrawn');
    const reactivated = structuredClone(snapshot);
    reactivated.chemicalStructures.push({ structureId: withdrawn.structureId, molfileV3000: 'obsolete' });
    const rejected = path.join(temporary, 'rejected');
    await assert.rejects(copyHistoryBundle({ sourceDirectory: source, outputDirectory: rejected, snapshot: reactivated }), /Withdrawn structure reactivated/);
    await assert.rejects(fs.stat(rejected), { code: 'ENOENT' });
    const unchanged = registry.baselineStructures.find(entry => !registry.entries.some(record => record.structureId === entry.structureId));
    const stale = structuredClone(snapshot);
    stale.chemicalStructures.find(entry => entry.structureId === unchanged.structureId).molfileV3000 += '\n';
    await assert.rejects(copyHistoryBundle({ sourceDirectory: source, outputDirectory: rejected, snapshot: stale }), /History inventory stale/);
    await assert.rejects(fs.stat(rejected), { code: 'ENOENT' });
    const alteredSource = path.join(temporary, 'altered-history');
    await fs.cp(source, alteredSource, { recursive: true });
    registry.baselineStructures.pop();
    await fs.writeFile(path.join(alteredSource, 'registry.json'), JSON.stringify(registry));
    await assert.rejects(copyHistoryBundle({ sourceDirectory: alteredSource, outputDirectory: rejected, snapshot }), /baseline inventory changed/);
    await assert.rejects(fs.stat(rejected), { code: 'ENOENT' });
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
});

test('history copy rejects missing, changed, extra, and duplicate ZIP members even with a new outer digest', async t => {
  // Read the public authoring snapshot only for inventory comparison. This
  // test never builds or renders the canonical site.
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-members-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const mutate = String.raw`
import hashlib, json, pathlib, sys, warnings, zipfile
bundle, mode = pathlib.Path(sys.argv[1]), sys.argv[2]
archive = bundle / 'historical-structures.zip'
target = 'molfiles/acrylic-rubber-alkyl-acrylate-markush-segment.mol'
with zipfile.ZipFile(archive) as source:
    members = [(info, source.read(info)) for info in source.infolist()]
assert any(info.filename == target for info, _ in members)
replacement = bundle / 'replacement.zip'
with warnings.catch_warnings():
    warnings.simplefilter('ignore', UserWarning)
    with zipfile.ZipFile(replacement, 'w') as output:
        for info, data in members:
            if info.filename == target and mode == 'missing':
                continue
            if info.filename == target and mode == 'changed':
                data += b'\nchanged content\n'
            if info.filename == target and mode == 'duplicate':
                output.writestr(info, b'wrong first duplicate')
            output.writestr(info, data)
        if mode == 'extra':
            output.writestr('molfiles/unexpected.mol', b'unexpected')
replacement.replace(archive)
registry_path = bundle / 'registry.json'
registry = json.loads(registry_path.read_text())
registry['archive']['sha256'] = hashlib.sha256(archive.read_bytes()).hexdigest()
registry_path.write_text(json.dumps(registry))
`;
  for (const mode of ['missing', 'changed', 'extra', 'duplicate']) {
    await t.test(mode, async () => {
      const altered = path.join(temporary, mode);
      const output = path.join(temporary, `${mode}-output`);
      await fs.cp(source, altered, { recursive: true });
      const mutation = spawnSync('python3', ['-c', mutate, altered, mode], { encoding: 'utf8' });
      assert.equal(mutation.status, 0, mutation.stderr);
      await assert.rejects(
        copyHistoryBundle({ sourceDirectory: altered, outputDirectory: output, snapshot }),
        error => {
          assert.match(error.message, /Invalid historical structure archive or records/);
          if (mode === 'duplicate') assert.match(error.cause?.stderr || '', /Duplicate historical archive member/);
          return true;
        }
      );
      await assert.rejects(fs.stat(output), { code: 'ENOENT' });
    });
  }
});

test('a corrupt historical archive cannot replace a previous validated site', async () => {
  const snapshot = JSON.parse(await fs.readFile('fixtures/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-build-'));
  try {
    const destination = path.join(temporary, 'site');
    await buildSite(snapshot, destination, { allowExternal: true });
    const previous = await fs.readFile(path.join(destination, 'index.html'));
    const corrupt = path.join(temporary, 'corrupt-history');
    await fs.cp(source, corrupt, { recursive: true });
    await fs.appendFile(path.join(corrupt, 'historical-structures.zip'), 'invalid');
    await assert.rejects(buildSite(snapshot, destination, { allowExternal: true, historyDirectory: corrupt }), /archive or digest/);
    assert.deepEqual(await fs.readFile(path.join(destination, 'index.html')), previous);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
});

test('a canonical build links the warned archive without recreating withdrawn asset URLs', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'wop-history-canonical-'));
  try {
    const destination = path.join(temporary, 'site');
    await buildSite(snapshot, destination, { allowExternal: true, historyDirectory: source });
    assert.match(await fs.readFile(path.join(destination, 'index.html'), 'utf8'), /href="structure-history\/2026-11-10\/"/);
    const history = path.join(destination, 'structure-history', '2026-11-10');
    const registry = JSON.parse(await fs.readFile(path.join(history, 'registry.json'), 'utf8'));
    assert.deepEqual(await fs.readFile(path.join(history, 'historical-structures.zip')), await fs.readFile(path.join(source, 'historical-structures.zip')));
    for (const item of registry.entries.filter(entry => entry.status === 'withdrawn')) {
      await assert.rejects(fs.stat(path.join(destination, 'assets', 'structures', `${item.structureId}.mol`)), { code: 'ENOENT' });
    }
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
});
