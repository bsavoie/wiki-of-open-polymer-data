import fs from 'node:fs/promises';
import { validateSnapshot } from '../lib/schema.mjs';
import { validateChemicalStructures } from '../lib/structure-renderer.mjs';

export const snapshotPath = 'public-data/wop-publication-snapshot-v2/snapshot.json';
export const load = async () => JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
export const item = (structureId, label, altText, caption = 'Exact finite molecule; no polymer sequence or formulation is implied.') => ({structureId, label, fidelity: 'exact', altText, caption});
export const participant = (label, structureId) => ({label, ...(structureId ? {structureId} : {})});
export const reagent = (name, role, detail, structureId) => ({name, role, detail, ...(structureId ? {structureId} : {})});
export const step = (title, body, ...sourceIds) => ({title, body, sourceIds});
export function pubchemSource(sourceId, cids, locator, accessedDate = new Date().toISOString().slice(0, 10)) {
  return { sourceId, lineageId: 'ncbi-pubchem', sourceType: 'public_dataset', citation: `NCBI PubChem, molecular connectivity records ${cids.join(', ')}.`,
    url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cids[0]}`,
    contentUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cids.join(',')}/property/CanonicalSMILES,IUPACName/JSON`,
    locator, accessedDate, accessStatus: 'anonymous_full_content', reuseStatus: 'publicly_accessible_citation_only', permissionBasis: 'Public PUG REST connectivity records were read anonymously. Molecular facts are independently encoded in Ketcher; no source drawing or coordinates are reused.', supports: ['structuralDepictions'] };
}
export async function save(snapshot, intendedIds, before) {
  const prior = new Map(before.polymers.map(p => [p.wopId, p]));
  if (snapshot.polymers.length !== prior.size || snapshot.polymers.some(p => !prior.has(p.wopId))) throw new Error('Synthesis authoring must preserve all stable article IDs');
  const changed = snapshot.polymers.filter(p => JSON.stringify(p) !== JSON.stringify(prior.get(p.wopId))).map(p => p.wopId);
  if (changed.some(id => !intendedIds.includes(id))) throw new Error(`Unintended article edits: ${changed}`);
  validateSnapshot(snapshot);
  await validateChemicalStructures(snapshot.chemicalStructures);
  if (JSON.stringify(await load()) !== JSON.stringify(before)) throw new Error('Snapshot changed during authoring; reload before saving');
  const pending = `${snapshotPath}.synthesis-next`;
  await fs.writeFile(pending, `${JSON.stringify(snapshot, null, 2)}\n`);
  await fs.rename(pending, snapshotPath);
  console.log(`Validated synthesis changes for ${changed.join(', ')}`);
}
