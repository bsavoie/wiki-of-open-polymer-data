// A route composes already sourced V3000 depictions; it never creates chemistry.
export function articleStructureItems(article) {
  const list = value => Array.isArray(value) ? value : [];
  return [...list(article.structuralDepictions?.items),
    ...Object.values(article.contextualStructures || {}).flatMap(group => list(group?.items))];
}

export function validateSynthesisRoutes(article, label, errors) {
  if (!Object.hasOwn(article, 'synthesisRoutes')) return;
  const fail = message => errors.push(`${label}.synthesisRoutes ${message}`);
  const routes = article.synthesisRoutes;
  if (!Array.isArray(routes) || !routes.length) return fail('must be a non-empty array');
  if (!article.sections?.feedstocksAndSynthesis?.trim()) fail('requires synthesis prose');
  const structures = new Set(articleStructureItems(article).map(item => item.structureId));
  const sources = new Map((Array.isArray(article.sources) ? article.sources : []).filter(Boolean).map(source => [source.sourceId, source]));
  const ids = new Set();
  const shape = (value, required, optional = []) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { fail('contains an invalid object'); return false; }
    const allowed = new Set([...required, ...optional]);
    if (Object.keys(value).some(key => !allowed.has(key)) || required.some(key => !Object.hasOwn(value, key))) fail('has missing or unknown fields');
    return true;
  };
  const text = value => { if (typeof value !== 'string' || !value.trim()) fail('contains empty text'); };
  const evidence = (values, allowed) => {
    if (!Array.isArray(values) || !values.length || new Set(values).size !== values.length) return fail('requires unique source IDs');
    for (const id of values) {
      if (!sources.get(id)?.supports?.includes('feedstocksAndSynthesis')) fail(`source ${id} must support feedstocksAndSynthesis`);
      if (allowed && (!Array.isArray(allowed) || !allowed.includes(id))) fail(`step source ${id} is absent from the route sources`);
    }
  };
  const structure = value => {
    if (Object.hasOwn(value, 'structureId') && !structures.has(value.structureId)) fail(`structure ${value.structureId} must have an article depiction with evidence and notes`);
  };
  for (const route of routes) {
    if (!shape(route, ['routeId', 'title', 'basis', 'scopeNote', 'sourceIds', 'inputs', 'products', 'reagents', 'conditions', 'mechanism', 'steps', 'limitations'], ['productMode', 'productNote'])) continue;
    if (route.productMode !== undefined && !['products', 'structural_reference'].includes(route.productMode)) fail('has an invalid productMode');
    if (route.productMode === 'structural_reference') text(route.productNote);
    else if (route.productNote !== undefined) text(route.productNote);
    for (const key of ['routeId', 'title', 'scopeNote', 'conditions', 'mechanism', 'limitations']) text(route[key]);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route.routeId) || ids.has(route.routeId)) fail('requires unique slug route IDs');
    ids.add(route.routeId);
    if (!['patent_example', 'laboratory_example', 'representative_route'].includes(route.basis)) fail('has an invalid basis');
    evidence(route.sourceIds);
    for (const key of ['inputs', 'products']) {
      if (!Array.isArray(route[key]) || !route[key].length) { fail(`${key} must be non-empty`); continue; }
      for (const participant of route[key]) {
        if (!shape(participant, ['label'], ['structureId'])) continue;
        text(participant.label); structure(participant);
      }
    }
    if (!Array.isArray(route.reagents)) fail('reagents must be an array');
    else for (const reagent of route.reagents) {
      if (!shape(reagent, ['name', 'role', 'detail'], ['structureId'])) continue;
      text(reagent.name); text(reagent.detail); structure(reagent);
      if (!['initiator', 'catalyst', 'ligand', 'reductant', 'crosslinker', 'chain_transfer_agent', 'emulsifier', 'medium', 'additive'].includes(reagent.role)) fail('has an invalid reagent role');
    }
    if (!Array.isArray(route.steps) || !route.steps.length) fail('steps must be non-empty');
    else for (const step of route.steps) {
      if (!shape(step, ['title', 'body', 'sourceIds'])) continue;
      text(step.title); text(step.body); evidence(step.sourceIds, route.sourceIds);
    }
  }
}
