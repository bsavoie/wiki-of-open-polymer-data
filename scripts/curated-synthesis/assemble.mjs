import {item,participant,reagent,step,pubchemSource} from '../synthesis-authoring.mjs';
import a from './routes-001-100.mjs';
import b from './routes-101-150.mjs';
import c from './routes-151-213.mjs';
import d from './routes-214-262.mjs';

export const routeOutlines = [...a,...b,...c,...d];
const supplementary = [
 [202,'wheat-starch-fractionation-cn103936872','sichuan-agricultural-wheat-fractionation','CN103936872A','Method for purifying amylose and amylopectin of wheat (2014).','Description, wheat amylose extraction and purification; Example 1, part 2.'],
 [203,'wheat-starch-fractionation-cn103936872','sichuan-agricultural-wheat-fractionation','CN103936872A','Method for purifying amylose and amylopectin of wheat (2014).','Description, wheat amylopectin extraction and purification; Example 1, part 3.'],
 [207,'alginate-continuous-extraction-us3773753','kelco-continuous-alginate-extraction','US3773753A','Wright and Arendt, Process for production of alginates (1973).','Abstract and Description: kelp leaching, comminution, sodium-carbonate/steam plug-flow extraction, cooling and discharge.'],
 [208,'agarose-peg-fractionation-us3335127','agarose-peg-fractionation','US3335127A','Fractionation of mixtures of agarose and agaropectin (1967).','Description and Example 1: aqueous PEG precipitation above gelation, repeated precipitation, washing and removal of residual PEG.']
];
const scope = {
 copolymer_unit_set:'The drawings identify unit types in the product. Separate cards do not mean separate homopolymers and do not specify sequence or ratio.',
 component_set:'The drawings identify material components or phase motifs. Their placement does not imply covalent bonds between the cards or a fixed composition.',
 family_representative_set:'These are structural references for the family. They illustrate selected members or motifs, not simultaneous products of a single recipe.',
 variable_substitution_motif:'The drawings bound local substitution chemistry; they do not assign a uniform substitution level or sequence.',
 network_fragment:'This is a representative network fragment, not a unique repeat or a complete cured formulation.',
 block_or_graft_architecture:'This is an architecture reference. Block lengths and the full chain distribution depend on the selected preparation.',
 macromolecular_motif:'The motif identifies material-level connectivity within the limits stated in its figure notes.'
};
const sourceIdFor=(id)=>`wop-${String(id).padStart(6,'0')}`;
const productSelections={9:[0],43:[0],52:[1],81:[0],232:[1],244:[0],253:[0]};
const contextualProducts=new Set([98,101,102,103,104,105,106,108,109,110]);
const preparationIds=new Set([134,171,188,191,201,202,203,204,205,207,208,209,210,211,212,213,214,215,216,258,259,260,261]);
export function assembleCorpusRoutes(snapshot, finiteDefinitions, verified) {
 const before=structuredClone(snapshot);
 const original=new Map(before.polymers.map(p=>[p.wopId,p]));
 for(const def of finiteDefinitions){
  if(snapshot.chemicalStructures.some(d=>d.structureId===def.structureId))throw Error(`Existing definition: ${def.structureId}`);
  snapshot.chemicalStructures.push(def);
 }
 const monomers=new Map(verified.map(v=>[v.label,{...v,item:item(v.structureId,v.label,`${v.IUPACName}; finite feedstock molecule.`,v.label==='Formaldehyde'?'Molecular formaldehyde constitution; aqueous formalin speciation and oligomers are not depicted.':v.label==='Propylene oxide'?'Finite propylene oxide constitution; no enantiomer is selected.':'Finite feedstock molecule; this drawing does not assign formulation, concentration, or reaction conditions.')}]))
 const reusable=[
  ['Styrene',30,'styrene-monomer'],['Second styrene charge',30,'styrene-monomer'],
  ['1,3-Butadiene',33,'butadiene-monomer'],['Acrylonitrile',33,'acrylonitrile-monomer'],
  ['Methyl methacrylate',38,'methyl-methacrylate-monomer'],['Ethylene glycol',44,'ethylene-glycol-monomer'],['Dimethyl terephthalate',44,'dimethyl-terephthalate-monomer'],
  ['Bisphenol A',99,'bisphenol-a-feedstock'],['Epichlorohydrin',99,'epichlorohydrin-feedstock'],['BPA epoxy precursor',99,'dgeba-diepoxide-precursor'],
  ['DGEBF epoxy precursor',100,'dgebf-para-para-diepoxide-precursor'],
  ['Dicyclopentadiene',107,'dicyclopentadiene-feedstock'],['Bismaleimidodiphenylmethane',127,'bismaleimidodiphenylmethane-precursor'],['PEPE end-capper',133,'monoethyl-four-phenylethynylphthalate-endcapper'],
  ['Preformed polyethylene',5,'polyethylene-sru'],['Polyethylene',5,'polyethylene-sru'],['PVC',23,'polyvinyl-chloride-sru'],['PVC resin',23,'polyvinyl-chloride-sru'],
  ['Poly(vinyl acetate)',26,'polyvinyl-acetate-sru'],['Ethylene–vinyl acetate copolymer',18,null],
  ['Poly(vinyl alcohol)',27,'polyvinyl-alcohol-sru'],['Polypropylene',9,'polypropylene-unspecified-sru'],['PEEK',82,'polyether-ether-ketone-sru'],
  ['SBS precursor',166,'sbs-connected-aba-block-architecture'],['SIS precursor',167,'sis-connected-aba-block-architecture'],
  ['PPE',76,null],['Polystyrene',30,'polystyrene-sru'],['Cellulose',191,null],['Purified cellulose',191,null],['Chitin',205,null]
 ];
 // Resolve known aliases against already reviewed article depictions; no graph is inferred.
 const reuses=new Map();
 for(const [label,id,structureId] of reusable){const p=original.get(sourceIdFor(id));const groups=[p.structuralDepictions,...Object.values(p.contextualStructures||{})];let group=groups.find(g=>g.items.some(i=>i.structureId===structureId));if(!group&&structureId){
  // An explicit, single-item material depiction is unambiguous for these alias entries.
  if(p.structuralDepictions.items.length===1)group=p.structuralDepictions;
  else throw Error(`Cannot resolve reviewed structure ${label}: ${structureId}`);
 }if(!group&&!structureId&&p.structuralDepictions.items.length===1)group=p.structuralDepictions;
 if(group){const it=group.items.find(i=>i.structureId===structureId)||group.items[0];reuses.set(label,{item:it,sources:group.sourceIds.map(id=>p.sources.find(s=>s.sourceId===id)),scopeNote:group.scopeNote});}}
 const attach=(p,label)=>{
  let it,sources;
  const fresh=monomers.get(label),reuse=reuses.get(label);
  if(fresh){it=fresh.item;sources=[pubchemSource(`feedstock-${fresh.CID}-pubchem`,[fresh.CID],`PUG REST IUPACName and ConnectivitySMILES for CID ${fresh.CID}; checked against the Ketcher-authored ${fresh.label} connection table.`, '2026-09-04')];}
  else if(reuse){it=reuse.item;sources=reuse.sources;}else return participant(label);
  const existing=[p.structuralDepictions,...Object.values(p.contextualStructures||{})].some(g=>g.items.some(i=>i.structureId===it.structureId));
  if(!existing){
   p.contextualStructures??={};
   p.contextualStructures.feedstocksAndSynthesis??={reviewStatus:'reviewed',scopeNote:'Structures used in the route identify feedstock, precursor, or intermediate chemistry. Material motifs retain their figure-specific limits; none implies a unique final network.',sourceIds:[],items:[]};
   const g=p.contextualStructures.feedstocksAndSynthesis;
   g.items.push(structuredClone(it));
   for(const s of sources){if(!s)throw Error(`Missing structural evidence for ${label}`);if(!p.sources.some(old=>old.sourceId===s.sourceId))p.sources.push({...structuredClone(s),supports:['structuralDepictions']});if(!g.sourceIds.includes(s.sourceId))g.sourceIds.push(s.sourceId);}
  }
  return participant(label,it.structureId);
 };
 const ids=new Set();
 for(const row of routeOutlines){
  const [id,feeds,mechanism,conditions,preparation,formation,reagents]=row;
  const wopId=sourceIdFor(id);if(ids.has(wopId))throw Error(`Duplicate ${wopId}`);ids.add(wopId);
  const p=snapshot.polymers.find(p=>p.wopId===wopId);if(!p||p.synthesisRoutes)throw Error(`Unexpected route target ${wopId}`);
  const extra=supplementary.find(s=>s[0]===id);
  if(extra){const [,sourceId,lineageId,patent,citation,locator]=extra;p.sources.push({sourceId,lineageId,sourceType:'patent',citation,url:`https://patents.google.com/patent/${patent}/en`,locator,accessedDate:'2026-09-04',accessStatus:'anonymous_full_content',reuseStatus:'publicly_accessible_citation_only',permissionBasis:'The full public patent was read anonymously and independently paraphrased; no source figure or prose is copied.',supports:['feedstocksAndSynthesis']});}
  const sourceIds=extra?[extra[1]]:p.sources.filter(s=>s.supports.includes('feedstocksAndSynthesis')).map(s=>s.sourceId);
  const depiction=contextualProducts.has(id)?p.contextualStructures.feedstocksAndSynthesis:p.structuralDepictions;
  let productItems=depiction.items;
  if(productSelections[id])productItems=productSelections[id].map(i=>productItems[i]);
  if(id===98)productItems=productItems.filter(i=>i.structureId==='dgeba-diepoxide-precursor');
  const products=productItems.length?productItems.map(i=>participant(i.label,i.structureId)):[participant(id===207?'Sodium-alginate-containing extract':p.canonicalName)];
  const steps=[step(preparationIds.has(id)?'Prepare the feedstock':'Prepare the reaction',preparation,...sourceIds),step(preparationIds.has(id)?'Recover or form the material':'Form and recover the product',formation,...sourceIds)];
  if(id===207)steps[1].body='Extract with sodium carbonate in steam-heated flow, then cool and discharge the alginate-containing mixture.';
  p.synthesisRoutes=[{routeId:'representative-preparation',title:conditions.replace(/\.$/,''),basis:extra?'patent_example':'representative_route',scopeNote:'A bounded outline of the cited chemistry and preparation. The section below records alternative routes and material-specific controls.',sourceIds,
   inputs:feeds.split(';').map(label=>attach(p,label)),products,productMode:'structural_reference',productNote: `${scope[depiction.representationType] ? scope[depiction.representationType]+' ' : ''}${depiction.scopeNote}`,
   reagents:reagents?reagents.split(/;(?=[a-z_]+:)/).map(value=>{const [role,name,...detail]=value.split(':');const linked=attach(p,name);return reagent(name,role,detail.join(':'),linked.structureId);}):[],
   conditions,mechanism,steps,limitations:'This outline does not specify a universal recipe, reagent loading, operating schedule, or conversion endpoint. Those details must retain the material and process limits of the cited source. Figure notes distinguish exact molecules from representative motifs and variable architectures.'}];
  if(id===100){p.synthesisRoutes[0].inputs[0].label='DGEBF precursor (para–para isomer shown)';p.synthesisRoutes[0].scopeNote+=' The finite input drawing shows one precursor regioisomer; it does not fix commercial isomer proportions.';}
  if(id===130)p.synthesisRoutes[0].products=[participant('Nitrile-ended precursor oligomer for phthalonitrile cure')];
 }
 if(snapshot.polymers.some(p=>!p.synthesisRoutes?.length))throw Error('Corpus contains articles without a route outline');
 return {snapshot,changedIds:[...ids]};
}
