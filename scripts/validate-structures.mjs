import path from 'node:path';
import { readAndValidateSnapshot } from '../lib/importer.mjs';
import { STRUCTURE_RENDERER_VERSION, STRUCTURE_STYLE_ID, validateChemicalStructures } from '../lib/structure-renderer.mjs';

const [requestedSource, unexpected] = process.argv.slice(2);
if (unexpected) {
  console.error('Usage: npm run structures:validate -- [snapshot-directory]');
  process.exitCode = 1;
} else {
  const source = path.resolve(requestedSource || 'public-data/wop-publication-snapshot-v2');
  const snapshot = await readAndValidateSnapshot(source);
  const results = await validateChemicalStructures(snapshot.chemicalStructures);
  const serializerOmissions = results.reduce(
    (count, result) => count + result.diagnostics.serializer.singleBondCfg2Omissions.length,
    0
  );
  console.log(`Validated and rendered ${results.length} V3000 chemical structures with ${STRUCTURE_RENDERER_VERSION} / ${STRUCTURE_STYLE_ID}.`);
  if (serializerOmissions) {
    console.log(`Disclosed ${serializerOmissions} diagnostic-only RDKit serializer omissions of canonical single-bond CFG=2 markers; canonical inputs and rendered wavy bonds passed direct validation.`);
  }
}
