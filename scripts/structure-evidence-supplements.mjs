import fs from 'node:fs/promises';

const moduleFiles = [
  'structure-evidence-a1.mjs',
  'structure-evidence-a2.mjs',
  'structure-evidence-b.mjs'
];
const evidence = {};
const unresolved = {};

for (const filename of moduleFiles) {
  const moduleUrl = new URL(filename, import.meta.url);
  try {
    await fs.access(moduleUrl);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  const supplement = await import(moduleUrl.href);
  const records = supplement.evidence || supplement.default;
  if (!records || typeof records !== 'object' || Array.isArray(records)) {
    throw new Error(`${filename} must export an evidence object`);
  }
  for (const [wopId, record] of Object.entries(records)) {
    if (Object.hasOwn(evidence, wopId)) {
      throw new Error(`Duplicate structural-evidence supplement for ${wopId}`);
    }
    evidence[wopId] = record;
  }
  const gaps = supplement.unresolved || {};
  if (!gaps || typeof gaps !== 'object' || Array.isArray(gaps)) {
    throw new Error(`${filename} unresolved export must be an object`);
  }
  for (const [wopId, reason] of Object.entries(gaps)) {
    if (Object.hasOwn(unresolved, wopId)) {
      throw new Error(`Duplicate unresolved structural-evidence record for ${wopId}`);
    }
    unresolved[wopId] = reason;
  }
}

export { evidence, unresolved };
export default evidence;
