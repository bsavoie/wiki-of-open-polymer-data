import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('corrected structures use new identifiers instead of reusing historical chemistry', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const ids = new Set(snapshot.chemicalStructures.map(item => item.structureId));
  for (const [oldId, currentId] of [
    ['cellulose-trisubstitution-markush-motif', 'cellulose-trisubstitution-corrected-markush-motif'],
    ['isotactic-polypropylene-dyad', 'isotactic-polypropylene-corrected-dyad'],
    ['syndiotactic-polypropylene-dyad', 'syndiotactic-polypropylene-corrected-dyad'],
    ['tpu-ptmeg-mdi-ptmeg-connected-architecture', 'tpu-ptmeg-mdi-extended-connected-architecture'],
    ['hdi-urethane-motif', 'hdi-urethane-open-segment'],
    ['mdi-urethane-hard-segment-motif', 'mdi-urethane-hard-open-segment'],
    ['peba-pa12-ptmeg-connected-architecture', 'peba-pa12-ptmeg-corrected-architecture'],
    ['polyurea-linkage-motif', 'polyurea-open-linkage'],
    ['polyvinyl-butyral-acetal-motif', 'polyvinyl-butyral-acetal-open-motif'],
    ['polyvinyl-formal-acetal-motif', 'polyvinyl-formal-acetal-open-motif'],
    ['poly-3-hydroxybutyrate-unit', 'poly-3-hydroxybutyrate-chiral-unit'],
    ['poly-d-lactide-unit', 'poly-d-lactide-chiral-unit'],
    ['poly-l-lactide-unit', 'poly-l-lactide-chiral-unit'],
    ['poly-r-3-hydroxyalkanoate-markush-unit', 'poly-r-3-hydroxyalkanoate-chiral-markush-unit']
  ]) {
    assert.ok(!ids.has(oldId), `${oldId} must not silently publish different chemistry`);
    assert.ok(ids.has(currentId), `${currentId} must remain available to current articles`);
  }
});
