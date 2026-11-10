// Curated migration scaffolding for structural depictions, wop-000001–wop-000131.
// SMILES are used only to generate initial V3000 connection tables for review.

export default {
  "wop-000001": {
    reviewStatus: "reviewed",
    sourceIds: ["polyethylene-phillips-us9617355"],
    representationType: "family_representative_set",
    scopeNote: "The ethylene constitutional unit is common to the family; branching, comonomer-derived units, molecular mass, and network junctions vary among narrower polyethylene materials and are not implied by this single motif.",
    items: [{ key: "polyethylene-sru", label: "Ethylene unit", smiles: "[*]CC[*]", fidelity: "representative", altText: "Polyethylene ethylene-derived chain unit with carbon–carbon backbone continuation", caption: "Representative ethylene constitutional unit; it does not encode the branching or comonomer content of every polyethylene family member." }]
  },
  "wop-000002": {
    reviewStatus: "reviewed",
    sourceIds: ["dow-ldpe-high-pressure-radical-2020"],
    representationType: "macromolecular_motif",
    scopeNote: "LDPE has the polyethylene backbone but a grade-dependent population of short- and long-chain branches created during radical polymerization; no single branch spacing or length is asserted.",
    items: [{ key: "polyethylene-sru", label: "Polyethylene backbone", smiles: "[*]CC[*]", fidelity: "representative", altText: "Polyethylene carbon–carbon backbone unit", caption: "Representative backbone motif; the defining irregular short- and long-chain branches are deliberately not assigned a fixed topology." }]
  },
  "wop-000003": {
    reviewStatus: "reviewed",
    sourceIds: ["basell-lldpe-ziegler-natta-catalyst-2003"],
    representationType: "copolymer_unit_set",
    scopeNote: "LLDPE contains ethylene units and a variable, usually low fraction of alpha-olefin-derived branch-bearing units; 1-butene is shown only as a representative comonomer and no sequence or ratio is implied.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived carbon–carbon backbone unit in LLDPE", caption: "Ethylene-derived constitutional unit; its frequency relative to the comonomer unit is not shown." },
      { key: "poly-1-butene-sru", label: "Representative 1-butene-derived unit", smiles: "[*]CC(CC)[*]", fidelity: "representative", altText: "Alpha-olefin-derived LLDPE unit bearing an ethyl side chain", caption: "Representative 1-butene-derived unit illustrating short-chain branching; commercial LLDPE may use another alpha-olefin." }
    ]
  },
  "wop-000004": {
    reviewStatus: "reviewed",
    sourceIds: ["mdpe-dura-line-pe2708-gas-pipe-data"],
    representationType: "macromolecular_motif",
    scopeNote: "MDPE is a density-classed polyethylene whose branch population and possible comonomer identity vary by route and grade; the common ethylene backbone is shown without assigning branch frequency.",
    items: [{ key: "polyethylene-sru", label: "Polyethylene backbone", smiles: "[*]CC[*]", fidelity: "representative", altText: "Polyethylene carbon–carbon backbone unit", caption: "Representative ethylene backbone motif; density and branching are not encoded by a unique repeat unit." }]
  },
  "wop-000005": {
    reviewStatus: "reviewed",
    sourceIds: ["hdpe-openstax-structure-properties"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction shows the ethylene constitutional unit of the predominantly linear HDPE chain; occasional comonomer-derived branches, end groups, molecular mass, and grade formulation are outside the drawing.",
    items: [{ key: "polyethylene-sru", label: "Ethylene unit", smiles: "[*]CC[*]", fidelity: "representative", altText: "High-density polyethylene ethylene repeat unit", caption: "Ethylene constitutional unit representative of the predominantly linear HDPE backbone; rare branch or comonomer units are omitted." }]
  },
  "wop-000006": {
    reviewStatus: "reviewed",
    sourceIds: ["uhmwpe-disentangled-slurry-zn-ep2907829"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "UHMWPE differs from other polyethylene chiefly in molar mass and chain entanglement, neither of which changes the ethylene constitutional unit or can be conveyed by a finite repeat-unit drawing.",
    items: [{ key: "polyethylene-sru", label: "Ethylene unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ultra-high-molecular-weight polyethylene ethylene repeat unit", caption: "Exact constitutional unit of polyethylene; the ultra-high molar mass and entanglement state are not depicted." }]
  },
  "wop-000007": {
    reviewStatus: "reviewed",
    sourceIds: ["vldpe-branching-crystallization-study-2017"],
    representationType: "copolymer_unit_set",
    scopeNote: "VLDPE combines ethylene with a variable alpha-olefin content. A 1-octene-derived unit is a representative branch-bearing comonomer unit; comonomer identity, sequence, and fraction remain unspecified.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived VLDPE chain unit", caption: "Ethylene-derived constitutional unit; no unit ratio is implied." },
      { key: "poly-1-octene-sru", label: "Representative 1-octene-derived unit", smiles: "[*]CC(CCCCCC)[*]", fidelity: "representative", altText: "Alpha-olefin-derived VLDPE unit bearing a hexyl side chain", caption: "Representative 1-octene-derived branch-bearing unit; another alpha-olefin may be used in a particular VLDPE." }
    ]
  },
  "wop-000008": {
    reviewStatus: "reviewed",
    sourceIds: ["xlpe-hussain-uhmwpe-crosslinking-review-2020"],
    representationType: "network_fragment",
    scopeNote: "PEX is a polyethylene network whose sparse junction chemistry and distribution depend on peroxide, silane, irradiation, or related routes. The fragment shows a representative direct carbon–carbon junction, not a universal crosslink mechanism or network repeat.",
    items: [{ key: "pex-carbon-carbon-junction", label: "Representative polyethylene junction", smiles: "[*]CC(CC[*])C(CC[*])C[*]", unknownTetrahedralStereo: false, fidelity: "schematic", altText: "Two polyethylene chain fragments joined through a representative carbon–carbon network junction", caption: "Schematic direct carbon–carbon junction between polyethylene strands; junction spacing and route-specific linkages are not specified." }]
  },
  "wop-000009": {
    reviewStatus: "reviewed",
    sourceIds: ["pp-bulk-hydrogen-control-us5098967"],
    representationType: "family_representative_set",
    scopeNote: "The family includes tactic polypropylene homopolymers and propylene-rich copolymers. The drawings show an unspecified-stereochemistry propylene unit and a common ethylene comonomer unit without claiming tacticity, sequence, or composition.",
    items: [
      { key: "polypropylene-unspecified-sru", label: "Propylene-derived unit", smiles: "[*]CC(C)[*]", fidelity: "representative", altText: "Polypropylene chain unit bearing a methyl substituent with unspecified stereochemistry", caption: "Representative propylene-derived unit with stereochemistry intentionally unspecified at family scope." },
      { key: "polyethylene-sru", label: "Common ethylene comonomer unit", smiles: "[*]CC[*]", fidelity: "representative", altText: "Ethylene-derived comonomer unit used in some polypropylene copolymers", caption: "Representative ethylene-derived unit found in narrower polypropylene copolymers; it is not present in every family member." }
    ]
  },
  "wop-000010": {
    reviewStatus: "reviewed",
    sourceIds: ["borealis-isotactic-polypropylene-slurry-2015"],
    representationType: "stereochemical_repeat_segment",
    scopeNote: "A two-center propylene dyad encodes the isotactic relationship. It represents ideal local stereoregularity and does not quantify stereodefects, molar mass, crystal form, or grade additives.",
    items: [{ key: "isotactic-polypropylene-dyad", label: "Isotactic propylene dyad", smiles: "[*]C[C@H](C)C[C@H](C)C[*]", fidelity: "exact", altText: "Polypropylene dyad with two methyl-bearing stereocenters in an isotactic relationship", caption: "Stereochemical dyad showing the isotactic relationship; real grades may contain a small population of stereodefects." }]
  },
  "wop-000011": {
    reviewStatus: "reviewed",
    sourceIds: ["spp-elastic-behavior-structure-study-2001"],
    representationType: "stereochemical_repeat_segment",
    scopeNote: "A two-center propylene dyad encodes the syndiotactic relationship between adjacent configurational units. It does not quantify stereodefects or crystal polymorph.",
    items: [{ key: "syndiotactic-polypropylene-dyad", label: "Syndiotactic propylene dyad", smiles: "[*]C[C@H](C)C[C@@H](C)C[*]", fidelity: "exact", altText: "Polypropylene dyad with methyl-bearing stereocenters in a syndiotactic relationship", caption: "Stereochemical dyad showing a syndiotactic relationship; defect frequency and solid-state conformation are outside the depiction." }]
  },
  "wop-000012": {
    reviewStatus: "reviewed",
    sourceIds: ["pp-r-blazquez-pipe-ageing-antioxidants-2021"],
    representationType: "copolymer_unit_set",
    scopeNote: "PP-R is propylene-rich and contains statistically distributed ethylene-derived units. The set does not encode a particular composition, run length, tacticity defect population, or sequence realization.",
    items: [
      { key: "polypropylene-unspecified-sru", label: "Propylene-derived unit", smiles: "[*]CC(C)[*]", fidelity: "representative", altText: "Propylene-derived copolymer unit with unspecified stereochemistry", caption: "Propylene-derived unit with stereochemistry not asserted by this composition-level drawing." },
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived unit in random propylene–ethylene copolymer", caption: "Ethylene-derived unit; the random sequence and unit fraction are not represented by spatial order." }
    ]
  },
  "wop-000013": {
    reviewStatus: "reviewed",
    sourceIds: ["heco-basell-2006114358"],
    representationType: "component_set",
    scopeNote: "Heterophasic polypropylene contains a polypropylene-rich matrix and a dispersed ethylene/propylene-rich rubber phase. The structures are separate phase motifs and do not imply a blend ratio, particle morphology, or a single covalent sequence connecting all items.",
    items: [
      { key: "isotactic-polypropylene-dyad", label: "Polypropylene-rich matrix motif", smiles: "[*]C[C@H](C)C[C@H](C)C[*]", fidelity: "representative", altText: "Isotactic polypropylene dyad representing the crystalline matrix phase", caption: "Representative isotactic polypropylene matrix segment; phase crystallinity and stereodefects are not quantified." },
      { key: "polyethylene-sru", label: "Rubber-phase ethylene unit", smiles: "[*]CC[*]", fidelity: "representative", altText: "Ethylene-derived unit in an ethylene–propylene rubber-rich phase", caption: "One possible unit of the dispersed ethylene/propylene-rich phase; no sequence or phase fraction is implied." },
      { key: "polypropylene-unspecified-sru", label: "Rubber-phase propylene unit", smiles: "[*]CC(C)[*]", fidelity: "representative", altText: "Propylene-derived unit in an ethylene–propylene rubber-rich phase", caption: "One possible unit of the dispersed ethylene/propylene-rich phase, shown without an assigned tactic relationship." }
    ]
  },
  "wop-000014": {
    reviewStatus: "reviewed",
    sourceIds: ["pb1-buteline-pipe-design-data"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the 1-butene-derived constitutional unit. Tacticity, crystal polymorph, comonomer content in a particular grade, and chain ends are not specified.",
    items: [{ key: "poly-1-butene-sru", label: "1-Butene-derived unit", smiles: "[*]CC(CC)[*]", fidelity: "exact", altText: "Poly(1-butene) chain unit bearing an ethyl side group", caption: "Exact constitutional unit of the 1-butene homopolymer with stereochemistry left unspecified." }]
  },
  "wop-000015": {
    reviewStatus: "reviewed",
    sourceIds: ["pmp-tu-high-performance-polyolefin-review-2025"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the 4-methyl-1-pentene-derived constitutional unit. It does not assign tacticity, crystal form, molar mass, or any grade-specific comonomer content.",
    items: [{ key: "poly-4-methyl-1-pentene-sru", label: "4-Methyl-1-pentene-derived unit", smiles: "[*]CC(CC(C)C)[*]", fidelity: "exact", altText: "Poly(4-methyl-1-pentene) chain unit bearing an isobutyl side group", caption: "Exact constitutional unit with stereochemistry intentionally unspecified." }]
  },
  "wop-000016": {
    reviewStatus: "reviewed",
    sourceIds: ["cyclo-olefin-polymer-weikart-blood-tubes-2020"],
    representationType: "family_representative_set",
    scopeNote: "Cyclo-olefin polymers span cyclic monomers and polymerization routes. An addition-polymerized norbornene unit is shown as one representative ring-retaining member, not as the unique structure of the family.",
    items: [{ key: "addition-polynorbornene-sru", label: "Representative norbornene-derived unit", smiles: "[*]C1C([*])C2CCC1C2", unknownTetrahedralStereo: false, fidelity: "representative", altText: "Ring-retaining norbornene-derived unit with two polymer-chain attachment points", caption: "Representative addition-polynorbornene unit; other cyclo-olefin polymers can have different cyclic units or ring-opened backbones." }]
  },
  "wop-000017": {
    reviewStatus: "reviewed",
    sourceIds: ["coc-polyplastics-20230192930"],
    representationType: "copolymer_unit_set",
    scopeNote: "COC composition varies with the acyclic and cyclic olefin. Ethylene and addition-polymerized norbornene units illustrate a common COC chemistry; sequence, ratio, stereochemistry, and alternative cyclic comonomers are not fixed.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived unit in a cyclic olefin copolymer", caption: "Ethylene-derived unit in a representative ethylene/norbornene COC; no unit ratio is implied." },
      { key: "addition-polynorbornene-sru", label: "Norbornene-derived unit", smiles: "[*]C1C([*])C2CCC1C2", fidelity: "representative", altText: "Ring-retaining norbornene-derived COC unit", caption: "Representative norbornene-derived unit; commercial COCs can use other cyclic olefins and stereochemical distributions." }
    ]
  },
  "wop-000018": {
    reviewStatus: "reviewed",
    sourceIds: ["ethylene-vinyl-acetate-evatane-40-55-tds"],
    representationType: "copolymer_unit_set",
    scopeNote: "EVA contains ethylene- and vinyl-acetate-derived units in a grade-dependent distribution. The set does not imply sequence, composition, branching, hydrolysis, or cure state.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived EVA chain unit", caption: "Ethylene-derived constitutional unit; no composition or sequence is encoded." },
      { key: "polyvinyl-acetate-sru", label: "Vinyl-acetate-derived unit", smiles: "[*]CC(OC(=O)C)[*]", fidelity: "exact", altText: "Vinyl-acetate-derived EVA unit bearing an acetate ester", caption: "Vinyl-acetate-derived constitutional unit; its fraction varies among EVA grades." }
    ]
  },
  "wop-000019": {
    reviewStatus: "reviewed",
    sourceIds: ["ethylene-vinyl-alcohol-luzi-zno-film-2019"],
    representationType: "copolymer_unit_set",
    scopeNote: "EVOH contains ethylene- and vinyl-alcohol-derived units, with possible residual acetate depending on hydrolysis. The primary set does not assign sequence, ethylene fraction, tacticity, or hydrolysis completeness.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived EVOH chain unit", caption: "Ethylene-derived constitutional unit; its fraction varies by EVOH grade." },
      { key: "polyvinyl-alcohol-sru", label: "Vinyl-alcohol-derived unit", smiles: "[*]CC(O)[*]", fidelity: "exact", altText: "Vinyl-alcohol-derived EVOH unit bearing a hydroxyl group", caption: "Vinyl-alcohol-derived constitutional unit; sequence and residual acetate are not shown." }
    ]
  },
  "wop-000020": {
    reviewStatus: "reviewed",
    sourceIds: ["eaa-primacor-extrusion-processing-guide"],
    representationType: "copolymer_unit_set",
    scopeNote: "EAA contains ethylene- and acrylic-acid-derived units. The drawings show the unneutralized acid form and do not assign comonomer fraction, sequence, branching, or an ionomer counterion.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived EAA unit", caption: "Ethylene-derived constitutional unit; no sequence or composition is implied." },
      { key: "polyacrylic-acid-sru", label: "Acrylic-acid-derived unit", smiles: "[*]CC(C(=O)O)[*]", fidelity: "exact", altText: "Acrylic-acid-derived EAA unit bearing a carboxylic acid group", caption: "Unneutralized acrylic-acid-derived unit; neutralized EAA belongs to the ionomer scope." }
    ]
  },
  "wop-000021": {
    reviewStatus: "reviewed",
    sourceIds: ["ethylene-methacrylic-acid-zeng-ion-aggregates-1999"],
    representationType: "copolymer_unit_set",
    scopeNote: "EMAA contains ethylene- and methacrylic-acid-derived units. The unneutralized form is shown without assigning sequence, acid fraction, tacticity, or a counterion.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived EMAA unit", caption: "Ethylene-derived constitutional unit; no sequence or composition is implied." },
      { key: "polymethacrylic-acid-sru", label: "Methacrylic-acid-derived unit", smiles: "[*]CC(C)(C(=O)O)[*]", fidelity: "exact", altText: "Methacrylic-acid-derived EMAA unit bearing methyl and carboxylic acid substituents", caption: "Unneutralized methacrylic-acid-derived unit with stereochemistry unspecified." }
    ]
  },
  "wop-000022": {
    reviewStatus: "reviewed",
    sourceIds: ["polyolefin-ionomer-high-pressure-us9093710"],
    representationType: "family_representative_set",
    scopeNote: "Polyolefin ionomers contain ethylene/acid copolymer chains with partial metal neutralization. Ethylene and a sodium-neutralized acrylic-acid unit illustrate one member; acid identity, counterion, neutralization fraction, aggregation, sequence, and composition vary.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "representative", altText: "Ethylene-derived unit in a polyolefin ionomer chain", caption: "Representative ethylene-derived chain unit; no composition is implied." },
      { key: "sodium-polyacrylate-sru", label: "Representative sodium carboxylate unit", smiles: "[*]CC(C(=O)[O-])[*].[Na+]", fidelity: "representative", altText: "Acrylic-acid-derived chain unit shown as a sodium carboxylate with sodium counterion", caption: "Representative sodium-neutralized acrylic-acid unit; other acid units, metals, and neutralization levels occur." }
    ]
  },
  "wop-000023": {
    reviewStatus: "reviewed",
    sourceIds: ["pvc-geon-rigid-profile-extrusion-guide"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing is the vinyl-chloride constitutional unit of PVC. It does not represent tacticity distribution, chain defects, molar mass, plasticizers, stabilizers, fillers, or a particular compound formulation.",
    items: [{ key: "polyvinyl-chloride-sru", label: "Vinyl-chloride-derived unit", smiles: "[*]CC(Cl)[*]", fidelity: "exact", altText: "PVC carbon–carbon chain unit bearing one chlorine substituent", caption: "Exact PVC constitutional unit with stereochemistry unspecified; formulation ingredients are not part of the connection table." }]
  },
  "wop-000024": {
    reviewStatus: "reviewed",
    sourceIds: ["cpvc-kaneka-6242539"],
    representationType: "variable_substitution_motif",
    scopeNote: "CPVC is post-chlorinated PVC with a distribution of additional chlorine substitution along the chain. The two motifs illustrate retained PVC units and one possible additionally chlorinated backbone unit without asserting substitution frequency or sequence.",
    items: [
      { key: "polyvinyl-chloride-sru", label: "Retained vinyl-chloride unit", smiles: "[*]CC(Cl)[*]", fidelity: "representative", altText: "PVC-like chain unit retained in chlorinated PVC", caption: "Representative retained PVC unit within a compositionally distributed CPVC chain." },
      { key: "cpvc-dichlorinated-backbone-motif", label: "Additional chlorine substitution motif", smiles: "[*]C(Cl)C(Cl)[*]", fidelity: "representative", altText: "CPVC backbone motif with chlorine substituents on both adjacent carbons", caption: "One representative post-chlorination motif; CPVC contains a distribution of substitution states rather than this unit alone." }
    ]
  },
  "wop-000025": {
    reviewStatus: "reviewed",
    sourceIds: ["pvdc-epa-market-material-properties-1977"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the vinylidene-chloride homopolymer unit. Commercial VDC-rich copolymers, latex ingredients, chain ends, and processing morphology are not represented.",
    items: [{ key: "polyvinylidene-chloride-sru", label: "Vinylidene-chloride-derived unit", smiles: "[*]CC(Cl)(Cl)[*]", fidelity: "exact", altText: "PVDC chain unit bearing two chlorine substituents on one backbone carbon", caption: "Exact constitutional unit of vinylidene-chloride homopolymer; copolymer grade composition is outside this record." }]
  },
  "wop-000026": {
    reviewStatus: "reviewed",
    sourceIds: ["pvac-bookbinding-formulation-processing-guide"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the vinyl-acetate-derived constitutional unit. Tacticity, hydrolysis, copolymer content, chain ends, and emulsion formulation are not shown.",
    items: [{ key: "polyvinyl-acetate-sru", label: "Vinyl-acetate-derived unit", smiles: "[*]CC(OC(=O)C)[*]", fidelity: "exact", altText: "Poly(vinyl acetate) chain unit bearing an acetate ester", caption: "Exact constitutional unit of PVAc with stereochemistry unspecified." }]
  },
  "wop-000027": {
    reviewStatus: "reviewed",
    sourceIds: ["pva-kuraray-mowiflex-fff-guide"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the vinyl-alcohol constitutional unit of fully hydrolyzed PVA. Residual acetate in partially hydrolyzed grades, tacticity, crosslinks, and formulation components are not included.",
    items: [{ key: "polyvinyl-alcohol-sru", label: "Vinyl-alcohol-derived unit", smiles: "[*]CC(O)[*]", fidelity: "exact", altText: "Poly(vinyl alcohol) chain unit bearing a hydroxyl group", caption: "Exact constitutional unit of fully hydrolyzed PVA with stereochemistry unspecified; partially hydrolyzed grades also contain acetate units." }]
  },
  "wop-000028": {
    reviewStatus: "reviewed",
    sourceIds: ["pvb-eastman-saflex-q-lamination-guide"],
    representationType: "variable_substitution_motif",
    scopeNote: "PVB is a PVA-derived statistical material containing butyral acetal rings plus variable residual vinyl-alcohol and sometimes vinyl-acetate units. The set does not imply unit ratio, acetal sequence, tacticity, or plasticizer content.",
    items: [
      { key: "polyvinyl-butyral-acetal-motif", label: "Butyral acetal motif", smiles: "O1C(CCC)OC(C[*])CC1C[*]", fidelity: "representative", altText: "Six-membered poly(vinyl butyral) acetal ring bearing a propyl substituent and two chain continuations", caption: "Representative intrachain butyral acetal motif; acetalization is incomplete and distributed along real PVB chains." },
      { key: "polyvinyl-alcohol-sru", label: "Residual vinyl-alcohol unit", smiles: "[*]CC(O)[*]", fidelity: "representative", altText: "Residual hydroxyl-bearing vinyl-alcohol unit in PVB", caption: "Representative residual hydroxyl-bearing unit; its fraction varies with acetalization." },
      { key: "polyvinyl-acetate-sru", label: "Possible residual vinyl-acetate unit", smiles: "[*]CC(OC(=O)C)[*]", fidelity: "representative", altText: "Residual acetate-bearing vinyl unit in PVB", caption: "Possible residual acetate unit inherited from the precursor; not every PVB has the same residual fraction." }
    ]
  },
  "wop-000029": {
    reviewStatus: "reviewed",
    sourceIds: ["pvfm-ge-wire-enamel-coating-cure-patent"],
    representationType: "variable_substitution_motif",
    scopeNote: "Poly(vinyl formal) contains formal acetal rings distributed along a PVA-derived chain together with residual hydroxyl-bearing units. The drawings do not specify acetalization degree, sequence, tacticity, or coating formulation.",
    items: [
      { key: "polyvinyl-formal-acetal-motif", label: "Formal acetal motif", smiles: "O1COC(C[*])CC1C[*]", fidelity: "representative", altText: "Six-membered poly(vinyl formal) acetal ring with two polymer-chain continuations", caption: "Representative formaldehyde-derived intrachain acetal motif; its placement and abundance are variable." },
      { key: "polyvinyl-alcohol-sru", label: "Residual vinyl-alcohol unit", smiles: "[*]CC(O)[*]", fidelity: "representative", altText: "Residual hydroxyl-bearing vinyl-alcohol unit in poly(vinyl formal)", caption: "Representative residual vinyl-alcohol unit; no residual fraction is asserted." }
    ]
  },
  "wop-000030": {
    reviewStatus: "reviewed",
    sourceIds: ["polystyrene-suspension-peroxide-us7132485"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the styrene-derived constitutional unit with stereochemistry unspecified. It excludes rubber modification, comonomers, end groups, foam morphology, and additives.",
    items: [{ key: "polystyrene-sru", label: "Styrene-derived unit", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "exact", altText: "Polystyrene carbon–carbon chain unit bearing a phenyl group", caption: "Exact constitutional unit of polystyrene with tacticity unspecified." }]
  },
  "wop-000031": {
    reviewStatus: "reviewed",
    sourceIds: ["hips-ineos-2008035055"],
    representationType: "component_set",
    scopeNote: "HIPS is a multiphase rubber-modified material rather than a single repeat-unit polymer. Polystyrene and 1,4-polybutadiene motifs are shown as representative matrix and rubber components; grafting, branch points, rubber microstructure, composition, and particle morphology vary.",
    items: [
      { key: "polystyrene-sru", label: "Polystyrene matrix", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "representative", altText: "Styrene-derived unit representing the polystyrene matrix in HIPS", caption: "Representative polystyrene matrix unit; it does not encode matrix–rubber grafting." },
      { key: "polybutadiene-1-4-sru", label: "Representative rubber motif", smiles: "[*]CC=CC[*]", fidelity: "representative", altText: "1,4-polybutadiene unsaturated chain motif representing the HIPS rubber phase", caption: "Representative 1,4-butadiene-derived rubber motif; cis/trans and 1,2-unit content are not specified." }
    ]
  },
  "wop-000032": {
    reviewStatus: "reviewed",
    sourceIds: ["san-netzsch-mechanical-overview"],
    representationType: "copolymer_unit_set",
    scopeNote: "SAN contains styrene- and acrylonitrile-derived units in a composition- and sequence-dependent chain. The set does not assign sequence, ratio, tacticity, or chain architecture.",
    items: [
      { key: "polystyrene-sru", label: "Styrene-derived unit", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "exact", altText: "Styrene-derived SAN chain unit bearing a phenyl group", caption: "Styrene-derived constitutional unit; no copolymer sequence or fraction is implied." },
      { key: "polyacrylonitrile-sru", label: "Acrylonitrile-derived unit", smiles: "[*]CC(C#N)[*]", fidelity: "exact", altText: "Acrylonitrile-derived SAN chain unit bearing a nitrile group", caption: "Acrylonitrile-derived constitutional unit with stereochemistry unspecified." }
    ]
  },
  "wop-000033": {
    reviewStatus: "reviewed",
    sourceIds: ["traceability-abs-review-2024"],
    representationType: "component_set",
    scopeNote: "ABS is a multiphase, often grafted material comprising a styrene/acrylonitrile-rich matrix and a butadiene-rich rubber phase. The three motifs are shown separately and do not assert composition, graft topology, rubber microstructure, or phase morphology.",
    items: [
      { key: "polystyrene-sru", label: "Matrix styrene unit", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "representative", altText: "Styrene-derived unit in the ABS matrix", caption: "Representative styrene-derived SAN-matrix unit; no matrix sequence is implied." },
      { key: "polyacrylonitrile-sru", label: "Matrix acrylonitrile unit", smiles: "[*]CC(C#N)[*]", fidelity: "representative", altText: "Acrylonitrile-derived unit in the ABS matrix", caption: "Representative acrylonitrile-derived SAN-matrix unit; no matrix composition is implied." },
      { key: "polybutadiene-1-4-sru", label: "Butadiene-rich rubber motif", smiles: "[*]CC=CC[*]", fidelity: "representative", altText: "Unsaturated 1,4-polybutadiene motif representing the ABS rubber phase", caption: "Representative butadiene-rich rubber motif; grafting and cis/trans or 1,2 microstructure are not fixed." }
    ]
  },
  "wop-000034": {
    reviewStatus: "reviewed",
    sourceIds: ["liu-asa-core-shell-preprint-2023"],
    representationType: "component_set",
    scopeNote: "ASA combines a styrene/acrylonitrile-rich phase with an acrylic-rubber phase, commonly in a grafted or core–shell morphology. The motifs do not encode composition, graft points, core–shell dimensions, or a unique acrylate identity.",
    items: [
      { key: "polystyrene-sru", label: "Matrix styrene unit", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "representative", altText: "Styrene-derived unit in the ASA matrix", caption: "Representative styrene-derived matrix unit; no sequence or graft topology is implied." },
      { key: "polyacrylonitrile-sru", label: "Matrix acrylonitrile unit", smiles: "[*]CC(C#N)[*]", fidelity: "representative", altText: "Acrylonitrile-derived unit in the ASA matrix", caption: "Representative acrylonitrile-derived matrix unit; no composition is implied." },
      { key: "poly-n-butyl-acrylate-sru", label: "Representative acrylic-rubber unit", smiles: "[*]CC(C(=O)OCCCC)[*]", fidelity: "representative", altText: "n-Butyl-acrylate-derived rubber unit bearing a butyl ester", caption: "Representative n-butyl-acrylate rubber unit; actual acrylic-rubber composition and crosslinking vary." }
    ]
  },
  "wop-000035": {
    reviewStatus: "reviewed",
    sourceIds: ["mbs-kaneka-core-shell-pvc-mechanism"],
    representationType: "component_set",
    scopeNote: "MBS impact modifiers have a butadiene-containing rubber core and methacrylate/styrene-associated outer material. The motifs are separate representatives and do not assert layer sequence, graft sites, composition, or rubber microstructure.",
    items: [
      { key: "polybutadiene-1-4-sru", label: "Butadiene-rich core motif", smiles: "[*]CC=CC[*]", fidelity: "representative", altText: "1,4-polybutadiene motif representing an MBS rubber core", caption: "Representative rubber-core motif; cis/trans and 1,2 content and crosslinking are not specified." },
      { key: "polymethyl-methacrylate-sru", label: "Methacrylate shell motif", smiles: "[*]CC(C)(C(=O)OC)[*]", fidelity: "representative", altText: "Methyl-methacrylate-derived MBS shell unit", caption: "Representative methyl-methacrylate-derived outer-phase unit; no graft topology is implied." },
      { key: "polystyrene-sru", label: "Styrene-associated motif", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "representative", altText: "Styrene-derived unit associated with an MBS outer phase", caption: "Representative styrene-derived unit; composition and radial layer placement vary among MBS products." }
    ]
  },
  "wop-000036": {
    reviewStatus: "reviewed",
    sourceIds: ["sma-recycling-mechanics-study-2026"],
    representationType: "copolymer_unit_set",
    scopeNote: "SMA contains styrene- and maleic-anhydride-derived units. The set does not prescribe alternation, composition, chain-end chemistry, hydrolysis, or tacticity.",
    items: [
      { key: "polystyrene-sru", label: "Styrene-derived unit", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "exact", altText: "Styrene-derived SMA unit bearing a phenyl group", caption: "Styrene-derived constitutional unit; no sequence or ratio is implied." },
      { key: "polymaleic-anhydride-sru", label: "Maleic-anhydride-derived unit", smiles: "[*]C1C([*])C(=O)OC1=O", fidelity: "exact", altText: "Maleic-anhydride-derived cyclic anhydride unit with two chain attachments", caption: "Maleic-anhydride-derived constitutional unit; ring hydrolysis and copolymer sequence are not shown." }
    ]
  },
  "wop-000037": {
    reviewStatus: "reviewed",
    sourceIds: ["smma-lxmma-product-brochure-2021"],
    representationType: "copolymer_unit_set",
    scopeNote: "SMMA contains styrene- and methyl-methacrylate-derived units. The structures do not assign sequence, composition, tacticity, or chain architecture.",
    items: [
      { key: "polystyrene-sru", label: "Styrene-derived unit", smiles: "[*]CC(c1ccccc1)[*]", fidelity: "exact", altText: "Styrene-derived SMMA unit bearing a phenyl group", caption: "Styrene-derived constitutional unit; no copolymer sequence is implied." },
      { key: "polymethyl-methacrylate-sru", label: "Methyl-methacrylate-derived unit", smiles: "[*]CC(C)(C(=O)OC)[*]", fidelity: "exact", altText: "Methyl-methacrylate-derived SMMA unit bearing methyl and methyl ester substituents", caption: "Methyl-methacrylate-derived constitutional unit with stereochemistry unspecified." }
    ]
  },
  "wop-000038": {
    reviewStatus: "reviewed",
    sourceIds: ["pmma-roehm-plexiglas-8n-product-data"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the methyl-methacrylate constitutional unit with tacticity unspecified. It excludes comonomers, crosslinks, chain ends, additives, and article morphology.",
    items: [{ key: "polymethyl-methacrylate-sru", label: "Methyl-methacrylate-derived unit", smiles: "[*]CC(C)(C(=O)OC)[*]", fidelity: "exact", altText: "PMMA chain unit bearing methyl and methyl ester substituents", caption: "Exact PMMA constitutional unit with stereochemistry unspecified." }]
  },
  "wop-000039": {
    reviewStatus: "reviewed",
    sourceIds: ["pan-ahn-yeo-lee-fiber-process-review-2021"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing gives the acrylonitrile-derived homopolymer unit. It does not represent commercial acrylic-fiber comonomers, tacticity, cyclization during carbon-fiber conversion, or processing orientation.",
    items: [{ key: "polyacrylonitrile-sru", label: "Acrylonitrile-derived unit", smiles: "[*]CC(C#N)[*]", fidelity: "exact", altText: "Polyacrylonitrile chain unit bearing a nitrile group", caption: "Exact PAN constitutional unit with stereochemistry unspecified; precursor-fiber copolymers require additional units." }]
  },
  "wop-000040": {
    reviewStatus: "reviewed",
    sourceIds: ["polyalkylacrylate-pba-upy-physical-crosslinking-2024"],
    representationType: "family_representative_set",
    scopeNote: "Poly(alkyl acrylates) differ in ester alkyl group and may be copolymerized or crosslinked. Methyl and n-butyl acrylate units illustrate two real family members without exhausting side-chain chemistry or assigning tacticity.",
    items: [
      { key: "poly-methyl-acrylate-sru", label: "Poly(methyl acrylate) unit", smiles: "[*]CC(C(=O)OC)[*]", fidelity: "representative", altText: "Acrylate chain unit bearing a methyl ester", caption: "Representative methyl-acrylate-derived family member with stereochemistry unspecified." },
      { key: "poly-n-butyl-acrylate-sru", label: "Poly(n-butyl acrylate) unit", smiles: "[*]CC(C(=O)OCCCC)[*]", fidelity: "representative", altText: "Acrylate chain unit bearing an n-butyl ester", caption: "Representative n-butyl-acrylate-derived family member; other alkyl groups and copolymer units occur." }
    ]
  },
  "wop-000041": {
    reviewStatus: "reviewed",
    sourceIds: ["paam-crosslink-density-multimode-mechanics-study-2025"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the acrylamide homopolymer unit. It does not represent hydrolysis, ionic comonomers, tacticity, a crosslinker, or a hydrogel network formulation.",
    items: [{ key: "polyacrylamide-sru", label: "Acrylamide-derived unit", smiles: "[*]CC(C(=O)N)[*]", fidelity: "exact", altText: "Polyacrylamide chain unit bearing a carboxamide group", caption: "Exact constitutional unit of uncrosslinked polyacrylamide with stereochemistry unspecified." }]
  },
  "wop-000042": {
    reviewStatus: "reviewed",
    sourceIds: ["paa-graphene-oxide-tough-hydrogel-2022"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure is the unneutralized acrylic-acid homopolymer unit. Ionization state in solution, counterions, tacticity, crosslinks, and copolymer composition are not specified.",
    items: [{ key: "polyacrylic-acid-sru", label: "Acrylic-acid-derived unit", smiles: "[*]CC(C(=O)O)[*]", fidelity: "exact", altText: "Poly(acrylic acid) chain unit bearing a carboxylic acid group", caption: "Exact constitutional unit in the neutral acid form with stereochemistry unspecified." }]
  },
  "wop-000043": {
    reviewStatus: "reviewed",
    sourceIds: ["thermoplastic-polyester-celanese-family-technical-manual-2013"],
    representationType: "family_representative_set",
    scopeNote: "Thermoplastic polyesters encompass multiple linear ester-backbone chemistries. PET and PBT repeat units illustrate two established members; copolyesters, liquid-crystalline polyesters, and thermoset unsaturated resins are not represented by this pair.",
    items: [
      { key: "polyethylene-terephthalate-sru", label: "PET representative", smiles: "[*]OCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "Poly(ethylene terephthalate) unit with ethylene glycol and para-terephthalate segments", caption: "Representative PET family member; this drawing does not exhaust thermoplastic polyester structures." },
      { key: "polybutylene-terephthalate-sru", label: "PBT representative", smiles: "[*]OCCCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "Poly(butylene terephthalate) unit with butylene glycol and para-terephthalate segments", caption: "Representative PBT family member illustrating a longer glycol segment." }
    ]
  },
  "wop-000044": {
    reviewStatus: "reviewed",
    sourceIds: ["glanzstoff-pet-continuous-transesterification-1961"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing is the ethylene terephthalate constitutional unit. It does not convey molar mass, end groups, branching, comonomers, crystallinity, orientation, or article history.",
    items: [{ key: "polyethylene-terephthalate-sru", label: "Ethylene terephthalate unit", smiles: "[*]OCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "PET repeat unit with ethylene glycol and para-terephthalate ester segments", caption: "Exact constitutional repeat unit of PET; morphology and chain length are not depicted." }]
  },
  "wop-000045": {
    reviewStatus: "reviewed",
    sourceIds: ["petg-eastman-9228051"],
    representationType: "copolymer_unit_set",
    scopeNote: "PETG contains ethylene-terephthalate units and glycol-modified terephthalate units. A cyclohexanedimethanol-derived unit illustrates a common PETG modifier; modifier identity, cis/trans composition, sequence, and fraction are grade-dependent.",
    items: [
      { key: "polyethylene-terephthalate-sru", label: "Ethylene terephthalate unit", smiles: "[*]OCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "Ethylene terephthalate unit in PETG", caption: "Ethylene-terephthalate constitutional unit; no copolymer sequence is implied." },
      { key: "poly-chdm-terephthalate-sru", label: "Representative CHDM terephthalate unit", smiles: "[*]OCC1CCC(CC1)COC(=O)c1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "Cyclohexanedimethanol terephthalate copolyester unit with para-terephthalate ester linkages", caption: "Representative cyclohexanedimethanol-derived modifier unit; actual PETG modifier chemistry and cis/trans ratio can vary." }
    ]
  },
  "wop-000046": {
    reviewStatus: "reviewed",
    sourceIds: ["pbt-nolte-sheet-technical-data-2019"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing is the butylene terephthalate constitutional unit. It excludes end groups, molar mass, branching, copolyester units, reinforcement, and crystallization history.",
    items: [{ key: "polybutylene-terephthalate-sru", label: "Butylene terephthalate unit", smiles: "[*]OCCCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "PBT repeat unit with tetramethylene glycol and para-terephthalate ester segments", caption: "Exact constitutional repeat unit of PBT; grade formulation and morphology are not shown." }]
  },
  "wop-000047": {
    reviewStatus: "reviewed",
    sourceIds: ["ptt-rubber-toughened-blend-mechanics-study-2018"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the trimethylene terephthalate constitutional unit. It does not encode chain length, end groups, comonomers, orientation, crystallinity, or rubber modification.",
    items: [{ key: "polytrimethylene-terephthalate-sru", label: "Trimethylene terephthalate unit", smiles: "[*]OCCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "PTT repeat unit with trimethylene glycol and para-terephthalate ester segments", caption: "Exact constitutional repeat unit of PTT; solid-state morphology is outside the drawing." }]
  },
  "wop-000048": {
    reviewStatus: "reviewed",
    sourceIds: ["pen-naphthalenedicarboxylate-ester-route-2001"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ethylene 2,6-naphthalenedicarboxylate constitutional unit. It does not represent chain ends, molar mass, orientation, crystallinity, or copolyester modification.",
    items: [{ key: "polyethylene-naphthalate-sru", label: "Ethylene naphthalate unit", smiles: "[*]OCCOC(=O)c1ccc2cc(C(=O)[*])ccc2c1", fidelity: "exact", altText: "PEN repeat unit with ethylene glycol and a fused naphthalenedicarboxylate segment", caption: "Constitutional repeat unit of the common ethylene 2,6-naphthalate polymer; morphology is not depicted." }]
  },
  "wop-000049": {
    reviewStatus: "reviewed",
    sourceIds: ["pct-eastman-36294-36296-crystallization-mechanics"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows a cyclohexane-1,4-dimethanol terephthalate constitutional unit. It does not assign the cis/trans CHDM ratio, chain length, end groups, copolymer content, or crystalline morphology.",
    items: [{ key: "poly-chdm-terephthalate-sru", label: "CHDM terephthalate unit", smiles: "[*]OCC1CCC(CC1)COC(=O)c1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "PCT chain unit containing cyclohexanedimethanol and para-terephthalate ester segments", caption: "Representative PCT constitutional unit with CHDM stereoisomerism left unspecified." }]
  },
  "wop-000050": {
    reviewStatus: "reviewed",
    sourceIds: ["polyarylate-ester-interchange-us4485230"],
    representationType: "family_representative_set",
    scopeNote: "Polyarylates comprise multiple aromatic polyester chemistries. A bisphenol-A/terephthalate repeat is shown as one established member; other bisphenols, aromatic diacids, copolymer ratios, and sequence distributions are not implied.",
    items: [{ key: "bpa-polyarylate-terephthalate-sru", label: "Representative bisphenol-A polyarylate", smiles: "[*]Oc1ccc(C(C)(C)c2ccc(OC(=O)c3ccc(C(=O)[*])cc3)cc2)cc1", fidelity: "representative", altText: "Aromatic polyester repeat containing bisphenol A and para-terephthalate segments", caption: "Representative bisphenol-A/terephthalate polyarylate member; it does not define the entire polyarylate family." }]
  },
  "wop-000051": {
    reviewStatus: "reviewed",
    sourceIds: ["tlcp-celanese-vectra-design-guide"],
    representationType: "family_representative_set",
    scopeNote: "Thermotropic aromatic copolyesters use several rigid aromatic hydroxy-acid and diol/diacid units. p-Hydroxybenzoate and hydroxynaphthoate units illustrate a common mesogenic pair without asserting sequence, composition, linkage distribution, or a commercial formulation.",
    items: [
      { key: "poly-p-hydroxybenzoate-sru", label: "p-Hydroxybenzoate unit", smiles: "[*]Oc1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "Rigid para-hydroxybenzoate polyester unit with aromatic ester continuation", caption: "Representative p-hydroxybenzoate-derived mesogenic unit; no copolyester fraction is implied." },
      { key: "poly-hydroxynaphthoate-sru", label: "6-Hydroxy-2-naphthoate unit", smiles: "[*]Oc1ccc2cc(C(=O)[*])ccc2c1", fidelity: "representative", altText: "Rigid 6-hydroxy-2-naphthoate polyester unit with fused aromatic rings", caption: "Representative 6-hydroxy-2-naphthoate-derived mesogenic unit; sequence and fraction remain material-specific." }
    ]
  },
  "wop-000052": {
    reviewStatus: "reviewed",
    sourceIds: ["polyamide-water-effects-review-2021"],
    representationType: "family_representative_set",
    scopeNote: "Polyamides share backbone amide linkages but differ in methylene spacing, aromatic content, and monomer pairing. PA6 and PA66 are two representative aliphatic members, not an exhaustive definition of nylons, semiaromatic PPAs, or aramids.",
    items: [
      { key: "polyamide-6-sru", label: "PA6 representative", smiles: "[*]NCCCCCC(=O)[*]", fidelity: "representative", altText: "Polyamide 6 unit with one amide group and five methylene groups", caption: "Representative PA6 member of the polyamide family." },
      { key: "polyamide-66-sru", label: "PA66 representative", smiles: "[*]NCCCCCCNC(=O)CCCCC(=O)[*]", fidelity: "representative", altText: "Polyamide 66 unit containing hexamethylene diamine and adipamide segments", caption: "Representative PA66 member illustrating an AABB-type aliphatic polyamide." }
    ]
  },
  "wop-000053": {
    reviewStatus: "reviewed",
    sourceIds: ["pa6-zheng-ionic-liquid-mechanics-processing-2018"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the caprolactam-derived PA6 constitutional unit. It does not show chain ends, molar mass, branching, copolyamide units, hydrogen-bonded packing, crystallinity, or absorbed water.",
    items: [{ key: "polyamide-6-sru", label: "PA6 unit", smiles: "[*]NCCCCCC(=O)[*]", fidelity: "exact", altText: "Polyamide 6 repeat unit with one amide and five methylene groups", caption: "Exact constitutional repeat unit of PA6; solid-state hydrogen bonding is not drawn." }]
  },
  "wop-000054": {
    reviewStatus: "reviewed",
    sourceIds: ["pa66-injection-molded-microstructure-mechanics-2019"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure combines a hexamethylenediamine residue and an adipic-acid residue in the PA66 repeat. End groups, molar mass, crystal form, water, additives, and copolymers are omitted.",
    items: [{ key: "polyamide-66-sru", label: "PA66 unit", smiles: "[*]NCCCCCCNC(=O)CCCCC(=O)[*]", fidelity: "exact", altText: "PA66 repeat unit with hexamethylene diamine and adipamide segments", caption: "Exact PA66 constitutional repeat unit; intermolecular hydrogen bonding is not shown." }]
  },
  "wop-000055": {
    reviewStatus: "reviewed",
    sourceIds: ["pa46-injection-molded-tribology-temperature-pressure-2019"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure combines a tetramethylenediamine residue and an adipic-acid residue in PA46. Chain ends, molecular mass, crystal form, water, and formulation are outside the depiction.",
    items: [{ key: "polyamide-46-sru", label: "PA46 unit", smiles: "[*]NCCCCNC(=O)CCCCC(=O)[*]", fidelity: "exact", altText: "PA46 repeat unit with tetramethylene diamine and adipamide segments", caption: "Exact PA46 constitutional repeat unit; hydrogen-bonded morphology is not depicted." }]
  },
  "wop-000056": {
    reviewStatus: "reviewed",
    sourceIds: ["pa610-cellulose-glass-fiber-composites-2023"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure combines a hexamethylenediamine residue and a sebacic-acid residue in PA610. It omits end groups, molecular mass, crystal form, moisture, additives, and copolyamide content.",
    items: [{ key: "polyamide-610-sru", label: "PA610 unit", smiles: "[*]NCCCCCCNC(=O)CCCCCCCCC(=O)[*]", fidelity: "exact", altText: "PA610 repeat unit containing hexamethylene diamine and sebacamide segments", caption: "Exact PA610 constitutional repeat unit; intermolecular packing is not shown." }]
  },
  "wop-000057": {
    reviewStatus: "reviewed",
    sourceIds: ["pa612-vestamid-compound-water-plasticization-guide"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure combines a hexamethylenediamine residue and a dodecanedioic-acid residue in PA612. End groups, molecular mass, morphology, moisture, and formulation are omitted.",
    items: [{ key: "polyamide-612-sru", label: "PA612 unit", smiles: "[*]NCCCCCCNC(=O)CCCCCCCCCCC(=O)[*]", fidelity: "exact", altText: "PA612 repeat unit containing hexamethylene diamine and dodecanediamide segments", caption: "Exact PA612 constitutional repeat unit; solid-state organization is not depicted." }]
  },
  "wop-000058": {
    reviewStatus: "reviewed",
    sourceIds: ["pa11-rotomold-cooling-crystallinity-mechanics-2023"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing gives the 11-aminoundecanoic-acid-derived PA11 unit. It does not show chain ends, molecular mass, crystallinity, moisture, additives, or comonomers.",
    items: [{ key: "polyamide-11-sru", label: "PA11 unit", smiles: "[*]NCCCCCCCCCCC(=O)[*]", fidelity: "exact", altText: "PA11 repeat unit with one amide group and ten methylene groups", caption: "Exact PA11 constitutional repeat unit; morphology and bio-based feedstock origin are not encoded." }]
  },
  "wop-000059": {
    reviewStatus: "reviewed",
    sourceIds: ["pa12-temperature-water-tube-dogbone-tensile-2021"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the laurolactam-derived PA12 unit. It omits chain ends, molecular mass, crystallinity, moisture, additives, and copolyamide units.",
    items: [{ key: "polyamide-12-sru", label: "PA12 unit", smiles: "[*]NCCCCCCCCCCCC(=O)[*]", fidelity: "exact", altText: "PA12 repeat unit with one amide group and eleven methylene groups", caption: "Exact PA12 constitutional repeat unit; solid-state morphology is not shown." }]
  },
  "wop-000060": {
    reviewStatus: "reviewed",
    sourceIds: ["pa1010-cast-extruded-film-mechanics-2023"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure combines a decamethylenediamine residue and a sebacic-acid residue in PA1010. Chain ends, molecular mass, morphology, moisture, and additives are omitted.",
    items: [{ key: "polyamide-1010-sru", label: "PA1010 unit", smiles: "[*]NCCCCCCCCCCNC(=O)CCCCCCCCC(=O)[*]", fidelity: "exact", altText: "PA1010 repeat unit containing decamethylene diamine and sebacamide segments", caption: "Exact PA1010 constitutional repeat unit; packing and feedstock origin are not depicted." }]
  },
  "wop-000061": {
    reviewStatus: "reviewed",
    sourceIds: ["pa1012-li-antistatic-pipe-extrusion-2020"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure combines a decamethylenediamine residue and a dodecanedioic-acid residue in PA1012. Chain ends, molecular mass, morphology, moisture, and formulation are outside the drawing.",
    items: [{ key: "polyamide-1012-sru", label: "PA1012 unit", smiles: "[*]NCCCCCCCCCCNC(=O)CCCCCCCCCCC(=O)[*]", fidelity: "exact", altText: "PA1012 repeat unit containing decamethylene diamine and dodecanediamide segments", caption: "Exact PA1012 constitutional repeat unit; intermolecular organization is not shown." }]
  },
  "wop-000062": {
    reviewStatus: "reviewed",
    sourceIds: ["pa6t-continuous-carbon-fiber-composite-mechanics-2024"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction combines a hexamethylenediamine residue and para-terephthalate residue in PA6T. It excludes copolyamide units, sequence variation, end groups, molecular mass, and crystal morphology.",
    items: [{ key: "polyamide-6t-sru", label: "PA6T unit", smiles: "[*]NCCCCCCNC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "PA6T repeat unit with hexamethylene diamine and para-terephthalamide segments", caption: "Exact PA6T constitutional repeat unit; mixed 6T copolyamides require additional units." }]
  },
  "wop-000063": {
    reviewStatus: "reviewed",
    sourceIds: ["pa9t-glass-fiber-crosslinked-grade-comparison"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction combines a nonamethylenediamine residue and para-terephthalate residue in PA9T. It omits copolyamide units, sequence, end groups, molecular mass, and morphology.",
    items: [{ key: "polyamide-9t-sru", label: "PA9T unit", smiles: "[*]NCCCCCCCCCNC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "PA9T repeat unit with nonamethylene diamine and para-terephthalamide segments", caption: "Exact PA9T constitutional repeat unit; commercial modifiers and solid-state structure are not shown." }]
  },
  "wop-000064": {
    reviewStatus: "reviewed",
    sourceIds: ["pa10t-ppo-blend-neat-injection-tensile-impact-2024"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction combines a decamethylenediamine residue and para-terephthalate residue in PA10T. It excludes copolyamide units, sequence variation, end groups, molecular mass, and morphology.",
    items: [{ key: "polyamide-10t-sru", label: "PA10T unit", smiles: "[*]NCCCCCCCCCCNC(=O)c1ccc(C(=O)[*])cc1", fidelity: "exact", altText: "PA10T repeat unit with decamethylene diamine and para-terephthalamide segments", caption: "Exact PA10T constitutional repeat unit; formulation and solid-state packing are not depicted." }]
  },
  "wop-000065": {
    reviewStatus: "reviewed",
    sourceIds: ["mxd6-mgc-basic-properties-technical-page"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing combines m-xylylenediamine and adipic-acid residues. It omits chain ends, molecular mass, moisture, crystal morphology, copolyamide content, and reinforcement.",
    items: [{ key: "poly-m-xylylene-adipamide-sru", label: "m-Xylylene adipamide unit", smiles: "[*]NCc1cccc(CNC(=O)CCCCC(=O)[*])c1", fidelity: "exact", altText: "MXD6 repeat unit with meta-xylylene diamine and adipamide segments", caption: "Exact MXD6 constitutional repeat unit; hydrogen-bonded packing and morphology are not shown." }]
  },
  "wop-000066": {
    reviewStatus: "reviewed",
    sourceIds: ["ppa-salt-polycondensation-us5550208"],
    representationType: "family_representative_set",
    scopeNote: "Polyphthalamides vary in aliphatic diamine and terephthalic or isophthalic acid residues. PA6T and PA6I units illustrate para- and meta-aromatic members without defining composition, sequence, copolyamide ratio, or reinforcement.",
    items: [
      { key: "polyamide-6t-sru", label: "PA6T representative", smiles: "[*]NCCCCCCNC(=O)c1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "Semiaromatic polyamide unit containing hexamethylene diamine and para-terephthalamide", caption: "Representative para-linked PPA member; no family-wide composition is implied." },
      { key: "polyamide-6i-sru", label: "PA6I representative", smiles: "[*]NCCCCCCNC(=O)c1cccc(C(=O)[*])c1", fidelity: "representative", altText: "Semiaromatic polyamide unit containing hexamethylene diamine and meta-isophthalamide", caption: "Representative meta-linked PPA member; commercial PPAs commonly combine several units." }
    ]
  },
  "wop-000067": {
    reviewStatus: "reviewed",
    sourceIds: ["pa6-66-copolymer-hydrogen-bond-fiber-study-2022"],
    representationType: "copolymer_unit_set",
    scopeNote: "PA6/66 contains PA6- and PA66-derived amide sequences in a composition-dependent copolyamide. The set does not prescribe sequence, ratio, blockiness, end groups, or crystal morphology.",
    items: [
      { key: "polyamide-6-sru", label: "PA6-derived unit", smiles: "[*]NCCCCCC(=O)[*]", fidelity: "exact", altText: "Caprolactam-derived PA6 unit in PA6/66 copolyamide", caption: "PA6-derived constitutional unit; no copolyamide sequence is implied." },
      { key: "polyamide-66-sru", label: "PA66-derived unit", smiles: "[*]NCCCCCCNC(=O)CCCCC(=O)[*]", fidelity: "exact", altText: "Hexamethylene-adipamide PA66 unit in PA6/66 copolyamide", caption: "PA66-derived constitutional unit; no unit ratio or block length is implied." }
    ]
  },
  "wop-000068": {
    reviewStatus: "reviewed",
    sourceIds: ["kuroda-bpa-pc-injection-2023","fang-bpa-pc-fff-2020"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the bisphenol-A carbonate constitutional repeat. It excludes end groups, molecular mass, branching, comonomers, additives, and processing-induced morphology.",
    items: [{ key: "bisphenol-a-polycarbonate-sru", label: "Bisphenol-A carbonate unit", smiles: "[*]Oc1ccc(C(C)(C)c2ccc(OC(=O)[*])cc2)cc1", fidelity: "exact", altText: "Bisphenol A polycarbonate repeat containing two aromatic rings, an isopropylidene bridge, and carbonate linkage", caption: "Exact BPA-PC constitutional repeat unit; chain length and amorphous morphology are not depicted." }]
  },
  "wop-000069": {
    reviewStatus: "reviewed",
    sourceIds: ["ppc-processing-degradation-review-2022"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure is the alternating propylene-oxide/carbon-dioxide-derived carbonate unit, with stereochemistry and regiochemistry distribution not assigned. Terpolymer units, crosslinks, chain ends, and blends are excluded.",
    items: [{ key: "polypropylene-carbonate-sru", label: "Propylene carbonate unit", smiles: "[*]OC(C)COC(=O)[*]", fidelity: "representative", altText: "Poly(propylene carbonate) unit with methyl-substituted aliphatic carbonate linkage", caption: "Representative PPC constitutional unit with stereochemistry and head–tail regiochemistry unspecified." }]
  },
  "wop-000070": {
    reviewStatus: "reviewed",
    sourceIds: ["pvf-tedlar-general-properties-film-mechanics"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the vinyl-fluoride homopolymer unit. It does not represent tacticity, chain defects, end groups, molar mass, film orientation, or additives.",
    items: [{ key: "polyvinyl-fluoride-sru", label: "Vinyl-fluoride-derived unit", smiles: "[*]CC(F)[*]", fidelity: "exact", altText: "Poly(vinyl fluoride) chain unit bearing one fluorine substituent", caption: "Exact PVF constitutional unit with stereochemistry unspecified." }]
  },
  "wop-000071": {
    reviewStatus: "reviewed",
    sourceIds: ["pc-siloxane-block-us5530083"],
    representationType: "copolymer_unit_set",
    scopeNote: "PC–siloxane materials covalently connect carbonate-rich and siloxane-rich segments, but block length, junction chemistry, grafting, and composition depend on the product. The two cards identify segment chemistry only; they do not depict a particular covalent junction or block sequence.",
    items: [
      { key: "bisphenol-a-polycarbonate-sru", label: "Representative polycarbonate segment", smiles: "[*]Oc1ccc(C(C)(C)c2ccc(OC(=O)[*])cc2)cc1", fidelity: "representative", altText: "Bisphenol A carbonate unit representing the rigid segment of a PC–siloxane copolymer", caption: "Representative BPA-PC segment; junction and block length are not specified." },
      { key: "polydimethylsiloxane-sru", label: "Polydimethylsiloxane segment", smiles: "[*][Si](C)(C)O[*]", fidelity: "representative", altText: "Polydimethylsiloxane unit with dimethylsilicon and siloxane linkage", caption: "Representative PDMS segment; end-group and covalent junction chemistry to the carbonate segment are product-specific." }
    ]
  },
  "wop-000072": {
    reviewStatus: "reviewed",
    sourceIds: ["polyester-pc-block-ep3406648"],
    representationType: "copolymer_unit_set",
    scopeNote: "Polyester–polycarbonate copolymers covalently combine carbonate and ester segments with product-dependent identity, sequence, and block length. BPA-PC and PET cards illustrate one possible segment pair; they do not depict a physical blend, a particular covalent junction, or a universal sequence.",
    items: [
      { key: "bisphenol-a-polycarbonate-sru", label: "Representative carbonate segment", smiles: "[*]Oc1ccc(C(C)(C)c2ccc(OC(=O)[*])cc2)cc1", fidelity: "representative", altText: "Bisphenol A carbonate unit representing a polycarbonate segment", caption: "Representative carbonate-rich segment; the copolymer junction is not assigned." },
      { key: "polyethylene-terephthalate-sru", label: "Representative polyester segment", smiles: "[*]OCCOC(=O)c1ccc(C(=O)[*])cc1", fidelity: "representative", altText: "Ethylene terephthalate unit representing a polyester segment", caption: "Representative PET-like ester segment; other polyesters and sequence distributions can be used." }
    ]
  },
  "wop-000073": {
    reviewStatus: "reviewed",
    sourceIds: ["pom-family-manufacture-us10131782"],
    representationType: "family_representative_set",
    scopeNote: "The POM family includes oxymethylene homopolymer and copolymer grades containing occasional oxyalkylene units. The motifs distinguish these chemistries without encoding comonomer identity, fraction, sequence, end-capping, or stabilization.",
    items: [
      { key: "polyoxymethylene-sru", label: "Oxymethylene unit", smiles: "[*]CO[*]", fidelity: "exact", altText: "Polyoxymethylene unit with alternating methylene and oxygen atoms", caption: "Exact oxymethylene constitutional unit common to POM chains." },
      { key: "polyethylene-oxide-sru", label: "Representative oxyethylene comonomer unit", smiles: "[*]CCO[*]", fidelity: "representative", altText: "Oxyethylene unit representing a cyclic-ether-derived POM copolymer comonomer", caption: "Representative oxyethylene comonomer unit; POM-C composition and comonomer identity vary." }
    ]
  },
  "wop-000074": {
    reviewStatus: "reviewed",
    sourceIds: ["pom-formaldehyde-catalyst-us20050176924"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing gives the oxymethylene homopolymer unit. It excludes end caps, unstable end sequences, molecular mass, branching, stabilizers, additives, and solid-state morphology.",
    items: [{ key: "polyoxymethylene-sru", label: "Oxymethylene unit", smiles: "[*]CO[*]", fidelity: "exact", altText: "POM homopolymer unit with one methylene and one ether oxygen", caption: "Exact constitutional repeat unit of POM homopolymer; end-group stabilization is not depicted." }]
  },
  "wop-000075": {
    reviewStatus: "reviewed",
    sourceIds: ["pom-copolymer-process-us7906609"],
    representationType: "copolymer_unit_set",
    scopeNote: "POM-C contains oxymethylene sequences interrupted by a low fraction of cyclic-ether-derived oxyalkylene units. Oxyethylene is representative; comonomer identity, fraction, sequence, and end stabilization vary.",
    items: [
      { key: "polyoxymethylene-sru", label: "Oxymethylene unit", smiles: "[*]CO[*]", fidelity: "exact", altText: "Oxymethylene unit in POM copolymer", caption: "Oxymethylene constitutional unit; no sequence length is implied." },
      { key: "polyethylene-oxide-sru", label: "Representative oxyethylene unit", smiles: "[*]CCO[*]", fidelity: "representative", altText: "Oxyethylene comonomer unit interrupting a POM chain", caption: "Representative cyclic-ether-derived unit; exact POM-C comonomer and concentration are grade-specific." }
    ]
  },
  "wop-000076": {
    reviewStatus: "reviewed",
    sourceIds: ["ppe-autodesk-processing-overview"],
    representationType: "family_representative_set",
    scopeNote: "Poly(phenylene ether) is a family, commonly represented by poly(2,6-dimethyl-1,4-phenylene ether). That unit is shown as a representative member, not as a blend with polystyrene or a definition of every substituted PPE.",
    items: [{ key: "poly-2-6-dimethyl-phenylene-ether-sru", label: "Representative 2,6-dimethyl PPE unit", smiles: "[*]Oc1c(C)cc([*])cc1C", fidelity: "representative", altText: "Poly(2,6-dimethyl-1,4-phenylene ether) unit with aromatic ether backbone and two methyl groups", caption: "Representative 2,6-dimethyl-1,4-phenylene ether member; other PPE substitution patterns are outside this one drawing." }]
  },
  "wop-000077": {
    reviewStatus: "reviewed",
    sourceIds: ["verdugo-psu-membranes-review-2026"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the bisphenol-A/diphenyl-sulfone repeat of PSU. It omits end groups, molecular mass, functionalization, blends, reinforcement, and processing morphology.",
    items: [{ key: "bisphenol-a-polysulfone-sru", label: "Bisphenol-A polysulfone unit", smiles: "[*]Oc1ccc(C(C)(C)c2ccc(Oc3ccc(S(=O)(=O)c4ccc([*])cc4)cc3)cc2)cc1", fidelity: "exact", altText: "Bisphenol A polysulfone repeat with aromatic ether and sulfone linkages", caption: "Exact constitutional repeat unit of BPA polysulfone; amorphous morphology is not depicted." }]
  },
  "wop-000078": {
    reviewStatus: "reviewed",
    sourceIds: ["pes-cn116948176"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure shows a para-linked aromatic ether–sulfone unit used for poly(ether sulfone). It excludes end groups, molecular mass, copolymer variation, functionalization, blends, and morphology.",
    items: [{ key: "polyether-sulfone-sru", label: "Aromatic ether–sulfone unit", smiles: "[*]Oc1ccc(S(=O)(=O)c2ccc([*])cc2)cc1", fidelity: "exact", altText: "Poly(ether sulfone) repeat containing para-phenylene ether and sulfone linkages", caption: "Constitutional repeat unit of para-linked PESU; product-specific end groups and modifications are omitted." }]
  },
  "wop-000079": {
    reviewStatus: "reviewed",
    sourceIds: ["ppsu-low-chlorine-us9051432"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the biphenol/diphenyl-sulfone repeat of PPSU. It omits end caps, molecular mass, functionalization, reinforcement, blends, and processing morphology.",
    items: [{ key: "polyphenylsulfone-sru", label: "Polyphenylsulfone unit", smiles: "[*]Oc1ccc(-c2ccc(Oc3ccc(S(=O)(=O)c4ccc([*])cc4)cc3)cc2)cc1", fidelity: "exact", altText: "Polyphenylsulfone repeat with biphenyl, aromatic ether, and sulfone linkages", caption: "Exact PPSU constitutional repeat unit; amorphous morphology and chain length are not depicted." }]
  },
  "wop-000080": {
    reviewStatus: "reviewed",
    sourceIds: ["pps-fdm-printing-parameters-mechanics-2021"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure is the para-phenylene sulfide constitutional unit. It excludes branching defects, end groups, molecular mass, oxidative cure changes, additives, reinforcement, and crystallinity.",
    items: [{ key: "polyphenylene-sulfide-sru", label: "p-Phenylene sulfide unit", smiles: "[*]Sc1ccc([*])cc1", fidelity: "exact", altText: "Poly(phenylene sulfide) repeat with para-linked aromatic ring and sulfur", caption: "Exact constitutional repeat unit of linear para-PPS; grade formulation and solid-state morphology are omitted." }]
  },
  "wop-000081": {
    reviewStatus: "reviewed",
    sourceIds: ["paek-russo-blends-processing-review-2023"],
    representationType: "family_representative_set",
    scopeNote: "PAEK members differ in the sequence and ratio of aromatic ether and ketone linkages. PEEK and an all-para PEKK unit illustrate two established members without exhausting isomer ratios, sequences, copolymers, or reinforced grades.",
    items: [
      { key: "polyether-ether-ketone-sru", label: "PEEK representative", smiles: "[*]Oc1ccc(Oc2ccc(C(=O)c3ccc([*])cc3)cc2)cc1", fidelity: "representative", altText: "PEEK unit with aromatic ether–ether–ketone sequence", caption: "Representative PEEK member of the PAEK family." },
      { key: "polyether-ketone-ketone-para-sru", label: "PEKK representative", smiles: "[*]Oc1ccc(C(=O)c2ccc(C(=O)c3ccc([*])cc3)cc2)cc1", fidelity: "representative", altText: "All-para PEKK unit with aromatic ether–ketone–ketone sequence", caption: "Representative all-para PEKK motif; commercial PEKK can contain meta-linked isophthaloyl sequences." }
    ]
  },
  "wop-000082": {
    reviewStatus: "reviewed",
    sourceIds: ["peek-kurtz-devine-biomaterials-review-2007"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the para-linked ether–ether–ketone constitutional repeat of PEEK. It omits end groups, molecular mass, branching, copolymers, reinforcement, and crystalline morphology.",
    items: [{ key: "polyether-ether-ketone-sru", label: "Ether–ether–ketone unit", smiles: "[*]Oc1ccc(Oc2ccc(C(=O)c3ccc([*])cc3)cc2)cc1", fidelity: "exact", altText: "PEEK repeat with three para-phenylene rings, two ether links, and one ketone", caption: "Exact constitutional repeat unit of para-linked PEEK; solid-state morphology is not depicted." }]
  },
  "wop-000083": {
    reviewStatus: "reviewed",
    sourceIds: ["pekk-arkema-ep3438085"],
    representationType: "variable_substitution_motif",
    scopeNote: "PEKK contains ether–ketone–ketone aromatic sequences, while the terephthaloyl/isophthaloyl ratio varies by polymer. The all-para unit is shown as a representative limiting motif rather than a universal PEKK sequence.",
    items: [{ key: "polyether-ketone-ketone-para-sru", label: "All-para PEKK motif", smiles: "[*]Oc1ccc(C(=O)c2ccc(C(=O)c3ccc([*])cc3)cc2)cc1", fidelity: "representative", altText: "All-para aromatic PEKK motif with one ether and two ketone linkages", caption: "Representative all-para PEKK constitutional motif; meta-linked isophthaloyl content and sequence are material-specific." }]
  },
  "wop-000084": {
    reviewStatus: "reviewed",
    sourceIds: ["pei-bpada-mpd-ep2935404"],
    representationType: "macromolecular_motif",
    scopeNote: "Polyetherimide is a chemistry family whose dianhydride and diamine residues can differ. The drawing is a representative aromatic ether–phthalimide chain motif and does not claim a unique commercial PEI repeat, end group, or sequence.",
    items: [{ key: "aromatic-polyetherimide-motif", label: "Representative ether–imide motif", smiles: "[*]c1ccc(Oc2ccc3C(=O)N(c4cccc([*])c4)C(=O)c3c2)cc1", fidelity: "representative", altText: "Aromatic polyetherimide chain motif containing an ether bridge and cyclic imide", caption: "Representative aromatic ether–imide motif; specific dianhydride/diamine pairs define particular PEI polymers." }]
  },
  "wop-000085": {
    reviewStatus: "reviewed",
    sourceIds: ["pai-diamine-diisocyanate-us3847878"],
    representationType: "macromolecular_motif",
    scopeNote: "Polyamide-imides vary with precursor route and aromatic residues. The drawing shows a representative aromatic chain motif containing both amide and imide functions; it does not fix the complete commercial repeat, sequence, or end groups.",
    items: [{ key: "aromatic-polyamide-imide-motif", label: "Representative amide–imide motif", smiles: "[*]NC(=O)c1ccc2C(=O)N(c3cccc([*])c3)C(=O)c2c1", fidelity: "representative", altText: "Aromatic polymer motif containing one amide and one cyclic imide group", caption: "Representative amide–imide chain motif; monomer residues and sequence vary among PAI materials." }]
  },
  "wop-000086": {
    reviewStatus: "reviewed",
    sourceIds: ["polyimide-6fda-chemical-imidization-pmc3388866"],
    representationType: "family_representative_set",
    scopeNote: "Polyimides span many dianhydride/diamine pairs and linear or network architectures. An aromatic phthalimide-linked motif illustrates the defining cyclic imide functionality without claiming a universal repeat unit.",
    items: [{ key: "aromatic-polyimide-motif", label: "Representative aromatic imide motif", smiles: "[*]c1ccc2C(=O)N(c3ccc(Oc4ccc([*])cc4)cc3)C(=O)c2c1", fidelity: "representative", altText: "Aromatic polymer chain motif containing a cyclic imide and diaryl ether segment", caption: "Representative aromatic polyimide motif; the family includes different dianhydrides, diamines, and network-forming resins." }]
  },
  "wop-000087": {
    reviewStatus: "reviewed",
    sourceIds: ["thermoplastic-polyimide-mitsui-aurum-brochure-2013"],
    representationType: "macromolecular_motif",
    scopeNote: "Thermoplastic polyimides are linear, melt-processable imide polymers with grade-dependent dianhydride, diamine, and end-cap chemistry. The aromatic ether–imide motif is representative rather than a unique TPI repeat.",
    items: [{ key: "aromatic-polyetherimide-motif", label: "Representative thermoplastic imide motif", smiles: "[*]c1ccc(Oc2ccc3C(=O)N(c4cccc([*])c4)C(=O)c3c2)cc1", fidelity: "representative", altText: "Linear aromatic ether–imide chain motif representing a thermoplastic polyimide", caption: "Representative flexible aromatic ether–imide motif; a particular TPI grade requires its exact dianhydride/diamine structure." }]
  },
  "wop-000088": {
    reviewStatus: "reviewed",
    sourceIds: ["russian-chemical-reviews-polyketones-2004"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction is the alternating ethylene/carbon-monoxide constitutional unit, –CH2–CH2–C(O)–. It excludes propylene terpolymer units, nonalternating defects, chain ends, molecular mass, and crystalline morphology.",
    items: [{ key: "alternating-ethylene-carbon-monoxide-sru", label: "Ethylene–carbon monoxide unit", smiles: "[*]CCC(=O)[*]", fidelity: "exact", altText: "Alternating polyketone repeat with two methylene groups followed by one ketone carbonyl", caption: "Exact constitutional repeat of the ideal alternating ethylene/CO polyketone." }]
  },
  "wop-000089": {
    reviewStatus: "reviewed",
    sourceIds: ["ptfe-cyclic-plasticity-creep-study-2023"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure is the tetrafluoroethylene-derived PTFE unit. It omits end groups, molecular mass, branching, comonomers, fillers, and crystalline or helical chain conformation.",
    items: [{ key: "polytetrafluoroethylene-sru", label: "Tetrafluoroethylene-derived unit", smiles: "[*]C(F)(F)C(F)(F)[*]", fidelity: "exact", altText: "PTFE chain unit with a fully fluorinated two-carbon backbone", caption: "Exact PTFE constitutional unit; chain conformation and crystallinity are not drawn." }]
  },
  "wop-000090": {
    reviewStatus: "reviewed",
    sourceIds: ["fep-chenguang-cn102443092b"],
    representationType: "copolymer_unit_set",
    scopeNote: "FEP contains tetrafluoroethylene- and hexafluoropropylene-derived units in a grade-dependent sequence and ratio. The set does not encode composition, sequence, optional minor vinyl-ether units, end groups, or crystallinity.",
    items: [
      { key: "polytetrafluoroethylene-sru", label: "TFE-derived unit", smiles: "[*]C(F)(F)C(F)(F)[*]", fidelity: "exact", altText: "Tetrafluoroethylene-derived fully fluorinated chain unit in FEP", caption: "TFE-derived constitutional unit; no run length or fraction is implied." },
      { key: "polyhexafluoropropylene-sru", label: "HFP-derived unit", smiles: "[*]C(F)(F)C(F)(C(F)(F)F)[*]", fidelity: "exact", altText: "Hexafluoropropylene-derived fully fluorinated unit bearing a trifluoromethyl group", caption: "HFP-derived constitutional unit; sequence and composition are not represented spatially." }
    ]
  },
  "wop-000091": {
    reviewStatus: "reviewed",
    sourceIds: ["pfa-pexco-virgin-rod-properties-2025"],
    representationType: "copolymer_unit_set",
    scopeNote: "PFA contains tetrafluoroethylene and perfluoroalkyl-vinyl-ether units. A perfluoromethyl-vinyl-ether unit is shown as one representative ether comonomer; alkyl group, sequence, composition, end groups, and crystallinity vary.",
    items: [
      { key: "polytetrafluoroethylene-sru", label: "TFE-derived unit", smiles: "[*]C(F)(F)C(F)(F)[*]", fidelity: "exact", altText: "Tetrafluoroethylene-derived fully fluorinated chain unit in PFA", caption: "TFE-derived constitutional unit; no run length or fraction is implied." },
      { key: "poly-perfluoromethyl-vinyl-ether-sru", label: "Representative perfluoroalkyl-vinyl-ether unit", smiles: "[*]C(F)(F)C(F)(OC(F)(F)F)[*]", fidelity: "representative", altText: "Perfluoromethyl-vinyl-ether-derived unit bearing a trifluoromethoxy group", caption: "Representative PMVE-derived ether unit; PFA products may instead use another perfluoroalkyl vinyl ether." }
    ]
  },
  "wop-000092": {
    reviewStatus: "reviewed",
    sourceIds: ["etfe-surholt-uhlemann-stranghoener-foil-tension-2022"],
    representationType: "copolymer_unit_set",
    scopeNote: "ETFE contains ethylene- and tetrafluoroethylene-derived units, often in near-alternating sequences but with product-specific defects and minor modifiers. The set does not assert strict alternation, ratio, end groups, or crystallinity.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived hydrocarbon chain unit in ETFE", caption: "Ethylene-derived constitutional unit; its spatial position does not prescribe sequence." },
      { key: "polytetrafluoroethylene-sru", label: "TFE-derived unit", smiles: "[*]C(F)(F)C(F)(F)[*]", fidelity: "exact", altText: "Tetrafluoroethylene-derived fully fluorinated chain unit in ETFE", caption: "TFE-derived constitutional unit; strict alternation and composition are not asserted by this set." }
    ]
  },
  "wop-000093": {
    reviewStatus: "reviewed",
    sourceIds: ["ectfe-zeus-material-introduction-guide"],
    representationType: "copolymer_unit_set",
    scopeNote: "ECTFE contains ethylene- and chlorotrifluoroethylene-derived units. The set does not assert a particular sequence, composition, chain defect population, end group, or crystalline morphology.",
    items: [
      { key: "polyethylene-sru", label: "Ethylene-derived unit", smiles: "[*]CC[*]", fidelity: "exact", altText: "Ethylene-derived hydrocarbon chain unit in ECTFE", caption: "Ethylene-derived constitutional unit; no copolymer sequence is implied." },
      { key: "polychlorotrifluoroethylene-sru", label: "CTFE-derived unit", smiles: "[*]C(F)(F)C(F)(Cl)[*]", fidelity: "exact", altText: "Chlorotrifluoroethylene-derived chain unit bearing three fluorines and one chlorine", caption: "CTFE-derived constitutional unit; sequence and unit ratio remain unspecified." }
    ]
  },
  "wop-000094": {
    reviewStatus: "reviewed",
    sourceIds: ["pctfe-daikin-neoflon-processing-brochure"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing gives the chlorotrifluoroethylene homopolymer unit. It excludes chain ends, molecular mass, defects, comonomers, additives, and cooling-dependent crystalline morphology.",
    items: [{ key: "polychlorotrifluoroethylene-sru", label: "CTFE-derived unit", smiles: "[*]C(F)(F)C(F)(Cl)[*]", fidelity: "exact", altText: "PCTFE chain unit bearing three fluorines and one chlorine on a two-carbon backbone", caption: "Exact PCTFE constitutional unit; solid-state morphology is not depicted." }]
  },
  "wop-000095": {
    reviewStatus: "reviewed",
    sourceIds: ["pvdf-hollow-fiber-stretch-anneal-mechanics-2020"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The structure is the vinylidene-fluoride homopolymer unit. It does not specify head–tail defects, tacticity, end groups, molecular mass, additives, orientation, or crystalline phase.",
    items: [{ key: "polyvinylidene-fluoride-sru", label: "Vinylidene-fluoride-derived unit", smiles: "[*]CC(F)(F)[*]", fidelity: "exact", altText: "PVDF chain unit with one methylene and one difluoromethylene carbon", caption: "Exact PVDF constitutional unit; alpha, beta, gamma, and other crystal conformations are not encoded." }]
  },
  "wop-000096": {
    reviewStatus: "reviewed",
    sourceIds: ["tfe-hfp-vdf-freimuth-structure-deformation-1996"],
    representationType: "copolymer_unit_set",
    scopeNote: "THV is a statistical terpolymer containing TFE-, HFP-, and VDF-derived units. The set does not encode sequence, relative fractions, end groups, chain defects, or composition-dependent crystallinity.",
    items: [
      { key: "polytetrafluoroethylene-sru", label: "TFE-derived unit", smiles: "[*]C(F)(F)C(F)(F)[*]", fidelity: "exact", altText: "Tetrafluoroethylene-derived unit in THV", caption: "TFE-derived constitutional unit; no sequence or fraction is implied." },
      { key: "polyhexafluoropropylene-sru", label: "HFP-derived unit", smiles: "[*]C(F)(F)C(F)(C(F)(F)F)[*]", fidelity: "exact", altText: "Hexafluoropropylene-derived unit in THV bearing a trifluoromethyl group", caption: "HFP-derived constitutional unit; no sequence or fraction is implied." },
      { key: "polyvinylidene-fluoride-sru", label: "VDF-derived unit", smiles: "[*]CC(F)(F)[*]", fidelity: "exact", altText: "Vinylidene-fluoride-derived unit in THV with methylene and difluoromethylene carbons", caption: "VDF-derived constitutional unit; no sequence or fraction is implied." }
    ]
  },
  "wop-000097": {
    reviewStatus: "reviewed",
    sourceIds: ["parylene-c-implant-encapsulation-processing-2023"],
    representationType: "constitutional_repeat_unit",
    scopeNote: "The depiction gives the unsubstituted p-xylylene constitutional unit. Chlorinated and other substituted parylenes, chain ends, molecular mass, deposition defects, and film morphology are outside this record's drawing.",
    items: [{ key: "poly-para-xylylene-sru", label: "p-Xylylene unit", smiles: "[*]Cc1ccc(C[*])cc1", fidelity: "exact", altText: "Poly(p-xylylene) repeat containing a para-phenylene ring between two methylene groups", caption: "Exact unsubstituted PPX constitutional repeat unit; substituted parylenes require distinct structures." }]
  },
  "wop-000098": {
    reviewStatus: "reviewed",
    sourceIds: ["epoxy-shundo-network-properties-perspective-2022"],
    representationType: "family_representative_set",
    scopeNote: "Epoxy resins are reactive epoxide-bearing molecules or oligomers that form hardener-dependent networks, so the family has no unique linear repeat. DGEBA and a cycloaliphatic diepoxide illustrate two established precursor classes without defining any cured topology.",
    items: [
      { key: "dgeba-diepoxide-precursor", label: "Representative glycidyl-ether epoxy", smiles: "CC(C)(c1ccc(OCC2CO2)cc1)c1ccc(OCC2CO2)cc1", unknownTetrahedralStereo: false, fidelity: "representative", altText: "Bisphenol A diglycidyl ether molecule with two terminal oxirane rings", caption: "Representative DGEBA diepoxide precursor; hardener identity and cure determine the eventual network." },
      { key: "cycloaliphatic-diepoxide-precursor", label: "Representative cycloaliphatic epoxy", smiles: "O=C(OCC1CCC2OC2C1)C1CCC2OC2C1", unknownTetrahedralStereo: false, fidelity: "representative", altText: "Cycloaliphatic diepoxide ester molecule with two fused oxirane rings", caption: "Representative cycloaliphatic diepoxide precursor; it does not define all cycloaliphatic epoxies or a cured network." }
    ]
  },
  "wop-000099": {
    reviewStatus: "reviewed",
    sourceIds: ["dgeba-acs-network-formation-2022"],
    representationType: "macromolecular_motif",
    scopeNote: "DGEBA epoxy resins are distributions of bisphenol-A glycidyl ethers and possible higher oligomers; curing introduces hardener-specific junctions. The lowest-mass DGEBA diepoxide is shown as the defining precursor motif, not as a network repeat.",
    items: [{ key: "dgeba-diepoxide-precursor", label: "DGEBA diepoxide precursor", smiles: "CC(C)(c1ccc(OCC2CO2)cc1)c1ccc(OCC2CO2)cc1", fidelity: "representative", altText: "Bisphenol A diglycidyl ether with two terminal oxirane groups", caption: "Representative lowest-oligomer DGEBA precursor; oligomer distribution, hardener, stoichiometry, and cure topology are not shown." }]
  },
  "wop-000100": {
    reviewStatus: "reviewed",
    sourceIds: ["meissner-bfdge-detda-arxiv-2020"],
    representationType: "macromolecular_motif",
    scopeNote: "DGEBF resins include bisphenol-F diglycidyl ether isomers and oligomers, and cured topology depends on the hardener. A representative DGEBF diepoxide is shown without assigning isomer distribution or network structure.",
    items: [{ key: "dgebf-diepoxide-precursor", label: "DGEBF diepoxide precursor", smiles: "C(c1ccc(OCC2CO2)cc1)c1ccc(OCC2CO2)cc1", fidelity: "representative", altText: "Bisphenol F diglycidyl ether molecule with a methylene bridge and two terminal oxirane groups", caption: "Representative DGEBF diepoxide; positional isomers, oligomers, hardener chemistry, and cure topology vary." }]
  },
  "wop-000101": {
    reviewStatus: "reviewed",
    sourceIds: ["epn-stanzione-epon-164-dma-2021"],
    representationType: "variable_substitution_motif",
    scopeNote: "Epoxy cresol novolacs are distributions of methylene-linked methylphenolic oligomers bearing one glycidyl ether at each phenolic oxygen. The motif shows one source-aligned cresol-derived ring with open oligomer continuations; positional isomers, functionality, oligomer length, and cured topology vary.",
    items: [{ key: "epoxy-novolac-glycidyl-motif", label: "Epoxy cresol novolac motif", smiles: "[*]Cc1cc(C)c(OCC2CO2)c(C[*])c1", fidelity: "representative", altText: "Methylene-linked methylphenolic ring bearing one glycidyl ether oxirane group", caption: "Representative epoxy cresol novolac ring bearing one glycidyl ether; positional isomers and hardener-derived network junctions are not prescribed." }]
  },
  "wop-000102": {
    reviewStatus: "reviewed",
    sourceIds: ["glycidylamine-shell-2951822"],
    representationType: "family_representative_set",
    scopeNote: "Glycidyl amine epoxies vary in aromatic amine core and functionality. A tetraglycidyl methylenedianiline-type molecule is shown as one established multifunctional precursor, not as a universal resin molecule or cured-network repeat.",
    items: [{ key: "tetraglycidyl-methylenedianiline-precursor", label: "Representative tetraglycidyl amine", smiles: "C(c1ccc(N(CC2CO2)CC2CO2)cc1)c1ccc(N(CC2CO2)CC2CO2)cc1", fidelity: "representative", altText: "Methylenedianiline core bearing four glycidyl oxirane groups on two tertiary amines", caption: "Representative tetraglycidyl methylenedianiline-type precursor; glycidyl amine identity and cured topology are formulation-specific." }]
  },
  "wop-000103": {
    reviewStatus: "reviewed",
    sourceIds: ["cycloaliphatic-epoxy-patry-anhydride-comparison-2025"],
    representationType: "family_representative_set",
    scopeNote: "Cycloaliphatic epoxy resins encompass several epoxidized ring structures and oligomers. A commonly used cycloaliphatic diepoxide is shown as a representative precursor; hardener, stoichiometry, and cured network are not defined.",
    items: [{ key: "cycloaliphatic-diepoxide-precursor", label: "Representative cycloaliphatic diepoxide", smiles: "O=C(OCC1CCC2OC2C1)C1CCC2OC2C1", fidelity: "representative", altText: "Cycloaliphatic diepoxide ester molecule with two fused oxirane rings", caption: "Representative cycloaliphatic diepoxide precursor; the family includes other ring systems and functionality." }]
  },
  "wop-000104": {
    reviewStatus: "reviewed",
    sourceIds: ["upr-spasojevic-prepolymer-network-synthesis-2021"],
    representationType: "family_representative_set",
    scopeNote: "Unsaturated polyester resins are compositionally variable oligomer mixtures whose carbon–carbon unsaturation is later crosslinked with a reactive diluent. Itaconate- and succinate-containing 1,2-propanediol segments illustrate the cited bio-based precursor without defining sequence, ratio, diluent, or cured network.",
    items: [
      { key: "propylene-itaconate-polyester-motif", label: "Itaconate-containing segment", smiles: "[*]OC(C)COC(=O)CC(=C)C(=O)[*]", fidelity: "representative", altText: "1,2-propanediol itaconate polyester segment with a pendant methylene double bond", caption: "Representative unsaturated 1,2-propanediol/itaconate segment from the cited resin; its sequence and fraction are not implied." },
      { key: "propylene-succinate-polyester-motif", label: "Succinate-containing segment", smiles: "[*]OC(C)COC(=O)CCC(=O)[*]", fidelity: "representative", altText: "1,2-propanediol succinate polyester segment with a saturated aliphatic diester residue", caption: "Representative saturated 1,2-propanediol/succinate segment from the cited resin; no precursor-unit ratio or sequence is implied." }
    ]
  },
  "wop-000105": {
    reviewStatus: "reviewed",
    sourceIds: ["ortho-upr-resin-library-norsodyne-h13212-tae-tds-2020"],
    representationType: "copolymer_unit_set",
    scopeNote: "Orthophthalic UPRs commonly combine ortho-phthalate residues with unsaturated maleate or fumarate residues and one or more glycol residues. Ethylene-glycol-based motifs are representative; sequence, ratios, glycol identity, reactive diluent, and cure topology vary.",
    items: [
      { key: "ethylene-ortho-phthalate-polyester-motif", label: "Orthophthalate segment", smiles: "[*]OCCOC(=O)c1ccccc1C(=O)[*]", fidelity: "representative", altText: "Ethylene glycol orthophthalate polyester segment", caption: "Representative ortho-phthalate-containing precursor segment; glycol and composition are formulation-dependent." },
      { key: "ethylene-maleate-polyester-motif", label: "Unsaturated segment", smiles: "[*]OCCOC(=O)C=CC(=O)[*]", fidelity: "representative", altText: "Ethylene glycol unsaturated dicarboxylate polyester segment containing a polymerizable double bond with unspecified alkene geometry", caption: "Representative unsaturated segment; crossed double-bond notation leaves maleate/fumarate geometry unspecified, and cure with styrene or another reactive diluent is not encoded." }
    ]
  },
  "wop-000106": {
    reviewStatus: "reviewed",
    sourceIds: ["california-research-isophthalic-up-resin-1959"],
    representationType: "copolymer_unit_set",
    scopeNote: "Isophthalic UPRs combine meta-isophthalate residues with unsaturated maleate or fumarate residues and variable glycols. Ethylene-glycol-based motifs are representative; unit sequence, composition, reactive diluent, and cured topology are not assigned.",
    items: [
      { key: "ethylene-isophthalate-polyester-motif", label: "Isophthalate segment", smiles: "[*]OCCOC(=O)c1cccc(C(=O)[*])c1", fidelity: "representative", altText: "Ethylene glycol isophthalate polyester segment with meta aromatic carbonyl positions", caption: "Representative isophthalate-containing precursor segment; glycol and composition are formulation-dependent." },
      { key: "ethylene-maleate-polyester-motif", label: "Unsaturated segment", smiles: "[*]OCCOC(=O)C=CC(=O)[*]", fidelity: "representative", altText: "Ethylene glycol unsaturated dicarboxylate polyester segment containing a polymerizable double bond with unspecified alkene geometry", caption: "Representative unsaturated segment; crossed double-bond notation leaves maleate/fumarate geometry unspecified, and cure topology and reactive diluent are not shown." }
    ]
  },
  "wop-000107": {
    reviewStatus: "reviewed",
    sourceIds: ["dcpd-upr-perrot-2021"],
    representationType: "no_unique_repeat",
    scopeNote: "DCPD-modified UPR is a composition- and process-defined resin in which dicyclopentadiene can enter the unsaturated polyester through more than one addition, end-capping, or incorporation pathway before a formulation-dependent radical cure. The current entry does not establish one bounded DCPD-derived connectivity that could be depicted without inventing topology.",
    items: []
  },
  "wop-000108": {
    reviewStatus: "reviewed",
    sourceIds: ["vinyl-ester-epoxy-methacrylation-us20080039590"],
    representationType: "family_representative_set",
    scopeNote: "Vinyl ester resins are epoxy-derived oligomers terminated or substituted with polymerizable methacrylate groups, then crosslinked with a reactive diluent. The source-aligned bisphenol-A derivative is one established family member; it does not define novolac variants, diluent, oligomer distribution, or network topology.",
    items: [{ key: "bisphenol-a-epoxy-vinyl-ester-precursor", label: "Bisphenol-A vinyl ester representative", smiles: "CC(=C)C(=O)OCC(O)COc1ccc(C(C)(C)c2ccc(OCC(O)COC(=O)C(=C)C)cc2)cc1", unknownTetrahedralStereo: false, fidelity: "representative", altText: "Bisphenol A epoxy vinyl ester precursor with two terminal methacrylate groups and secondary hydroxyls", caption: "Representative bisphenol-A epoxy vinyl ester precursor; oligomer length and reactive-diluent cure are not shown." }]
  },
  "wop-000109": {
    reviewStatus: "reviewed",
    sourceIds: ["vinylester-mdpi-hydrothermal-2019"],
    representationType: "macromolecular_motif",
    scopeNote: "Bisphenol-A epoxy vinyl ester resins are oligomer distributions with methacrylate end groups and are commonly supplied with a reactive diluent. The lowest bisphenol-A-derived dimethacrylate motif is shown without defining oligomer length, diluent content, or cured topology.",
    items: [{ key: "bisphenol-a-epoxy-vinyl-ester-precursor", label: "Bisphenol-A epoxy vinyl ester precursor", smiles: "CC(=C)C(=O)OCC(O)COc1ccc(C(C)(C)c2ccc(OCC(O)COC(=O)C(=C)C)cc2)cc1", fidelity: "representative", altText: "Bisphenol A epoxy vinyl ester precursor with terminal methacrylate groups and secondary hydroxyls", caption: "Representative low-oligomer bisphenol-A vinyl ester; formulation and radical-cure network are not represented." }]
  },
  "wop-000110": {
    reviewStatus: "reviewed",
    sourceIds: ["apicella-dulzer-novolac-vinyl-ester-patent", "jaswal-gaur-o-cresol-epoxy-novolac-vinyl-ester-2015"],
    representationType: "no_unique_repeat",
    scopeNote: "Epoxy-novolac vinyl esters vary in phenol or cresol precursor, methylene-linkage distribution, epoxide conversion, unsaturated-acid identity, reactive diluent, and radical-cure topology. No canonical prepolymer, repeat unit, or bounded network fragment represents the family.",
    items: []
  },
  "wop-000111": {
    reviewStatus: "reviewed",
    sourceIds: ["pf-nist-resole-novolac-network-reference-2003"],
    representationType: "family_representative_set",
    scopeNote: "Phenol–formaldehyde resins include novolac and resole precursors and formulation-dependent cured networks. Methylene-linked phenol and hydroxymethyl-bearing phenol motifs illustrate these subfamilies without fixing substitution positions, bridge distribution, formaldehyde ratio, or cure topology.",
    items: [
      { key: "novolac-phenolic-network-motif", label: "Novolac-type phenolic motif", smiles: "[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1", fidelity: "schematic", altText: "Two hydroxyl-bearing phenyl rings joined by a methylene bridge with open phenolic-chain continuations", caption: "Schematic methylene-bridged novolac motif; ortho/para substitution and oligomer sequence vary." },
      { key: "resole-phenolic-network-motif", label: "Resole-type phenolic motif", smiles: "[*]Cc1cc(CO)c(O)c(C[*])c1", fidelity: "schematic", altText: "Hydroxymethyl-bearing phenol ring with two open methylene network continuations", caption: "Schematic resole motif showing both methylol functionality and possible methylene continuations; cure topology is not fixed." }
    ]
  },
  "wop-000112": {
    reviewStatus: "reviewed",
    sourceIds: ["novolac-sumitomo-fm4005-technical-data-sheet"],
    representationType: "macromolecular_motif",
    scopeNote: "Novolac precursors contain methylene-linked phenolic rings and require a curing agent to form a network. The motif illustrates the linear/branched precursor chemistry without depicting a curing-agent-derived junction or fixing ortho/para substitution, oligomer sequence, or crosslink density.",
    items: [{ key: "novolac-phenolic-network-motif", label: "Methylene-linked novolac precursor motif", smiles: "[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1", fidelity: "schematic", altText: "Methylene-linked hydroxyl-bearing phenyl rings with open precursor-chain continuations", caption: "Schematic novolac precursor motif; curing-agent-derived junctions and positional isomers are omitted." }]
  },
  "wop-000113": {
    reviewStatus: "reviewed",
    sourceIds: ["resole-phenolic-resin-status-review-2019"],
    representationType: "network_fragment",
    scopeNote: "Resoles contain hydroxymethylated phenols that self-condense through several methylene and ether linkages. The fragment shows one hydroxymethyl-bearing phenolic junction with open continuations, not a unique precursor molecule or cured-network repeat.",
    items: [{ key: "resole-phenolic-network-motif", label: "Hydroxymethyl phenolic junction", smiles: "[*]Cc1cc(CO)c(O)c(C[*])c1", fidelity: "schematic", altText: "Hydroxymethyl-bearing phenol ring with two open methylene network connections", caption: "Schematic resole motif; methylol count, ortho/para substitution, ether bridges, and cure conversion vary." }]
  },
  "wop-000114": {
    reviewStatus: "reviewed",
    sourceIds: ["cresol-formaldehyde-weber-coating-patent-1958"],
    representationType: "network_fragment",
    scopeNote: "Cresol–formaldehyde resins vary with cresol isomer, formaldehyde ratio, catalyst, advancement, and cure. The methyl-substituted phenolic fragment shows representative methylene continuation points without assigning isomer distribution or network topology.",
    items: [{ key: "cresol-formaldehyde-network-motif", label: "Methyl-substituted phenolic motif", smiles: "[*]Cc1cc(C)c(O)c(C[*])c1", polymerSgroup: false, fidelity: "schematic", altText: "Methyl- and hydroxyl-substituted phenyl ring with two open methylene network continuations", caption: "Schematic unbracketed cresol–formaldehyde network fragment; cresol isomer and bridge placement remain variable." }]
  },
  "wop-000115": {
    reviewStatus: "reviewed",
    sourceIds: ["rf-resin-schwan-flexible-aerogel-mechanics"],
    representationType: "network_fragment",
    scopeNote: "RF resins form highly branched methylene- and ether-linked networks whose connectivity depends on monomer ratio, pH, cure, and gel conditions. The fragment shows a resorcinol ring with representative methylene continuations, not a unique network repeat.",
    items: [{ key: "resorcinol-formaldehyde-network-motif", label: "Resorcinol junction motif", smiles: "[*]Cc1c(O)cc(O)c(C[*])c1", fidelity: "schematic", altText: "Meta-dihydroxyphenyl resorcinol ring with two open methylene network continuations", caption: "Schematic resorcinol–formaldehyde junction with meta hydroxyl groups; substitution sites, bridge types, and porosity are not fixed." }]
  },
  "wop-000116": {
    reviewStatus: "reviewed",
    sourceIds: ["prf-ozparpucu-wood-extract-curing-2022"],
    representationType: "family_representative_set",
    scopeNote: "PRF is a co-condensed network containing phenol- and resorcinol-derived aromatic sites connected by a distribution of formaldehyde-derived bridges. The motifs identify both site chemistries without implying sequence, ratio, bridge placement, or crosslink density.",
    items: [
      { key: "novolac-phenolic-network-motif", label: "Phenol-derived motif", smiles: "[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1", fidelity: "schematic", altText: "Methylene-linked phenolic rings representing phenol-derived PRF sites", caption: "Schematic phenol-derived condensation motif; it is not a separate component or fixed block." },
      { key: "resorcinol-formaldehyde-network-motif", label: "Resorcinol-derived motif", smiles: "[*]Cc1c(O)cc(O)c(C[*])c1", fidelity: "schematic", altText: "Meta-dihydroxyphenyl motif representing resorcinol-derived PRF sites", caption: "Schematic resorcinol-derived junction with meta hydroxyl groups; co-condensation sequence and ratio are unspecified." }
    ]
  },
  "wop-000117": {
    reviewStatus: "reviewed",
    sourceIds: ["uf-li-condensation-mechanism-2017"],
    representationType: "network_fragment",
    scopeNote: "UF resins contain a distribution of methylolated ureas and methylene, methylene-ether, and related condensation links. The urea-centered fragment uses open methylene continuations to show network functionality without fixing bridge types, substitution, or cure conversion.",
    items: [{ key: "urea-formaldehyde-network-junction", label: "Urea condensation junction", smiles: "[*]CN(C(=O)NC[*])C[*]", fidelity: "schematic", altText: "Urea carbonyl with nitrogen-bound methylene continuations representing a UF network junction", caption: "Schematic urea-centered junction; real UF networks contain mixed substitution and methylene or methylene-ether bridges." }]
  },
  "wop-000118": {
    reviewStatus: "reviewed",
    sourceIds: ["ullah-mf-synthesis-thermal-study"],
    representationType: "network_fragment",
    scopeNote: "MF resins cure from variably methylolated melamine through several methylene and ether linkage types. The triazine-centered fragment shows three representative amino-methylene continuations without assigning substitution completeness, bridge distribution, or cure conversion.",
    items: [{ key: "melamine-formaldehyde-network-junction", label: "Melamine junction", smiles: "n1c(NC[*])nc(NC[*])nc1NC[*]", fidelity: "schematic", altText: "Melamine triazine ring bearing three amino-methylene network continuations", caption: "Schematic melamine-centered junction; methylolation, condensation linkage types, and crosslink density vary." }]
  },
  "wop-000119": {
    reviewStatus: "reviewed",
    sourceIds: ["muf-park-jeong-park-wood-adhesion-review-2021"],
    representationType: "family_representative_set",
    scopeNote: "MUF is a co-condensed amino-resin network containing melamine- and urea-derived sites connected through variable formaldehyde-derived bridges. The motifs identify both site types without implying sequence, ratio, bridge distribution, or cure conversion.",
    items: [
      { key: "melamine-formaldehyde-network-junction", label: "Melamine-derived junction", smiles: "n1c(NC[*])nc(NC[*])nc1NC[*]", fidelity: "schematic", altText: "Melamine triazine ring with amino-methylene network continuations", caption: "Schematic melamine-derived site; no MUF composition or linkage distribution is implied." },
      { key: "urea-formaldehyde-network-junction", label: "Urea-derived junction", smiles: "[*]CN(C(=O)NC[*])C[*]", fidelity: "schematic", altText: "Urea carbonyl with nitrogen-bound methylene network continuations", caption: "Schematic urea-derived site; co-condensation sequence and bridge types vary." }
    ]
  },
  "wop-000120": {
    reviewStatus: "reviewed",
    sourceIds: ["puf-eco-friendly-resorcinol-plywood-2018"],
    representationType: "family_representative_set",
    scopeNote: "PUF is a co-condensed network containing phenolic and urea-derived sites connected by a distribution of formaldehyde-derived bridges. The motifs do not assign phenol/urea ratio, sequence, bridge placement, or cure conversion.",
    items: [
      { key: "novolac-phenolic-network-motif", label: "Phenol-derived motif", smiles: "[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1", fidelity: "schematic", altText: "Methylene-linked phenolic rings representing phenol-derived PUF sites", caption: "Schematic phenol-derived condensation motif; not a fixed block or separate component." },
      { key: "urea-formaldehyde-network-junction", label: "Urea-derived junction", smiles: "[*]CN(C(=O)NC[*])C[*]", fidelity: "schematic", altText: "Urea carbonyl with nitrogen-bound methylene network continuations", caption: "Schematic urea-derived site; bridge types and co-condensation sequence vary." }
    ]
  },
  "wop-000121": {
    reviewStatus: "reviewed",
    sourceIds: ["benzoguanamine-us2819246-molding-1958"],
    representationType: "network_fragment",
    scopeNote: "Benzoguanamine–formaldehyde resins cure through variably methylolated exocyclic amino groups and several condensation linkages. The fragment shows a benzoguanamine triazine core with two representative amino-methylene continuations, not a unique network repeat.",
    items: [{ key: "benzoguanamine-formaldehyde-network-junction", label: "Benzoguanamine junction", smiles: "c1ccc(-c2nc(NC[*])nc(NC[*])n2)cc1", polymerSgroup: false, fidelity: "schematic", altText: "Phenyl-substituted triazine benzoguanamine core with two amino-methylene network continuations", caption: "Schematic unbracketed benzoguanamine-centered network fragment; methylolation, co-resins, bridge chemistry, and cure conversion vary." }]
  },
  "wop-000122": {
    reviewStatus: "reviewed",
    sourceIds: ["thermoset-pu-possart-network-synthesis-2024"],
    representationType: "network_fragment",
    scopeNote: "Thermoset polyurethanes combine polyfunctional isocyanates and polyols into formulation-dependent networks. A glycerol-like trifunctional junction is shown only to illustrate carbamate (urethane) linkages and branching; actual soft segments, isocyanate residues, stoichiometry, and side reactions vary.",
    items: [{ key: "thermoset-polyurethane-junction", label: "Representative urethane junction", smiles: "C(COC(=O)N[*])(COC(=O)N[*])OC(=O)N[*]", fidelity: "schematic", altText: "Trifunctional polyol-derived junction bearing three urethane linkages and open network continuations", caption: "Schematic trifunctional urethane junction; it does not define the polyol, isocyanate, segment length, or network stoichiometry." }]
  },
  "wop-000123": {
    reviewStatus: "reviewed",
    sourceIds: ["isocyanate-trimerization-us7091341"],
    representationType: "network_fragment",
    scopeNote: "PIR materials contain isocyanurate rings formed by isocyanate trimerization within networks whose substituent residues, urethane content, isocyanate index, and formulation vary. The three-connected ring is a representative junction, not a complete foam repeat.",
    items: [{ key: "polyisocyanurate-network-junction", label: "Isocyanurate junction", smiles: "O=C1N([*])C(=O)N([*])C(=O)N1[*]", fidelity: "schematic", altText: "Isocyanurate six-membered ring with three carbonyl groups and three open nitrogen substituent connections", caption: "Schematic isocyanurate network junction; substituent identity, polyurethane linkages, and network spacing are not specified." }]
  },
  "wop-000124": {
    reviewStatus: "reviewed",
    sourceIds: ["polyurea-zhang-blast-impact-mechanics-review-2022","polyurea-aliphatic-spray-network-us5480955"],
    representationType: "macromolecular_motif",
    scopeNote: "Polyureas share urea linkages, but the groups between them, hard/soft segment architecture, functionality, and network state depend on the isocyanate and amine components. The drawing isolates the defining urea linkage without asserting a universal repeat unit.",
    items: [{ key: "polyurea-linkage-motif", label: "Urea linkage motif", smiles: "[*]NC(=O)N[*]", fidelity: "representative", altText: "Polyurea backbone motif containing a carbonyl flanked by two nitrogen atoms and open substituent connections", caption: "Representative urea linkage; the connected isocyanate- and amine-derived residues define each particular polyurea." }]
  },
  "wop-000125": {
    reviewStatus: "reviewed",
    sourceIds: ["kalu-alkyd-resin-review-2024"],
    representationType: "macromolecular_motif",
    scopeNote: "Alkyds are branched polyesters whose polyol, polyacid, fatty-acid identity, oil length, unsaturation, and cure state vary. The motif shows one glycerol/phthalate-like polyester site bearing an unsaturated fatty ester, not a unique repeat or formulation.",
    items: [{ key: "alkyd-glycerol-phthalate-fatty-motif", label: "Representative oleate-bearing alkyd motif", smiles: "[*]OC(=O)c1ccccc1C(=O)OCC(COC(=O)CCCCCCC/C=C\\CCCCCCCC)O[*]", polymerSgroup: false, unknownTetrahedralStereo: false, fidelity: "representative", altText: "Branched alkyd polyester motif containing phthalate, glycerol-like, and cis-oleate-derived ester portions", caption: "Representative unbracketed glycerol/phthalate/cis-oleate-derived alkyd motif; oil source, oil length, branching, other fatty residues, and oxidative cure products vary." }]
  },
  "wop-000126": {
    reviewStatus: "reviewed",
    sourceIds: ["silicone-resin-momentive-tsr117-film-mechanics"],
    representationType: "family_representative_set",
    scopeNote: "Silicone resins are organopolysiloxane networks assembled from multifunctional siloxane units with variable organic substituents and M/D/T/Q composition. Methyl- and phenyl-substituted T-junctions illustrate two real motifs without defining network ratios or cure chemistry.",
    items: [
      { key: "methyl-siloxane-t-junction", label: "Methylsiloxane T junction", smiles: "[*]O[Si](C)(O[*])O[*]", fidelity: "representative", altText: "Three-connected methyl-substituted silicon atom joined through siloxane oxygen linkages", caption: "Representative methylsilsesquioxane T unit; network composition and condensation state vary." },
      { key: "phenyl-siloxane-t-junction", label: "Phenylsiloxane T junction", smiles: "[*]O[Si](c1ccccc1)(O[*])O[*]", fidelity: "representative", altText: "Three-connected phenyl-substituted silicon atom joined through siloxane oxygen linkages", caption: "Representative phenylsilsesquioxane T unit; not every silicone resin contains phenyl substitution." }
    ]
  },
  "wop-000127": {
    reviewStatus: "reviewed",
    sourceIds: ["bmi-mdpi-branched-mechanics-2023"],
    representationType: "family_representative_set",
    scopeNote: "BMI resins use multifunctional maleimide precursors whose aromatic bridge, comonomers, advancement, and cure reaction vary. A bismaleimidodiphenylmethane-type molecule is shown as one representative precursor, not as the unique cured network repeat.",
    items: [{ key: "bismaleimidodiphenylmethane-precursor", label: "Representative bismaleimide precursor", smiles: "C(c1ccc(N2C(=O)C=CC2=O)cc1)c1ccc(N2C(=O)C=CC2=O)cc1", fidelity: "representative", altText: "Diphenylmethane molecule bearing one maleimide ring on each aromatic ring", caption: "Representative aromatic bismaleimide precursor; comonomers and cure determine the final network connectivity." }]
  },
  "wop-000128": {
    reviewStatus: "reviewed",
    sourceIds: ["cyanate-ester-boyd-uhf-structures-patent-1990"],
    representationType: "network_fragment",
    scopeNote: "Cyanate ester cure creates polycyanurate networks with triazine rings linked through monomer-specific aromatic residues. The three-connected aryloxy-triazine core is shown as a representative junction without assigning precursor identity, conversion, or network spacing.",
    items: [{ key: "polycyanurate-triazine-junction", label: "Polycyanurate junction", smiles: "n1c(O[*])nc(O[*])nc1O[*]", fidelity: "schematic", altText: "Aromatic 1,3,5-triazine ring bearing three aryloxy-type open network connections", caption: "Schematic polycyanurate triazine junction; the attached aromatic monomer residues and network topology are formulation-specific." }]
  },
  "wop-000129": {
    reviewStatus: "reviewed",
    sourceIds: ["polybenzoxazine-cationic-us6225440"],
    representationType: "network_fragment",
    scopeNote: "Benzoxazine ring opening yields phenolic Mannich-bridge networks whose aromatic, amine-derived, and multifunctional monomer residues vary. The motif illustrates phenolic rings connected through aminomethylene chemistry without defining a universal monomer or crosslink topology.",
    items: [{ key: "polybenzoxazine-mannich-network-motif", label: "N-phenyl Mannich-bridge motif", smiles: "[*]CN(c1ccccc1)Cc1ccc(O)c(CN(c2ccccc2)C[*])c1", fidelity: "schematic", altText: "Hydroxyl-bearing aromatic ring with N-phenyl aminomethylene Mannich connections and open network continuations", caption: "Schematic N-phenyl ring-opened benzoxazine motif aligned with the cited aniline-derived BA-a chemistry; aromatic core, functionality, and network branching vary." }]
  },
  "wop-000130": {
    reviewStatus: "reviewed",
    sourceIds: ["phthalonitrile-bulgakov-bio-based-review-2024"],
    representationType: "no_unique_repeat",
    scopeNote: "Phthalonitrile cure can generate a heterogeneous aromatic network containing several nitrile-derived ring and linkage types whose proportions depend on monomer, catalyst, temperature, and conversion. The current entry does not establish one bounded connectivity as representative enough to draw without implying an unsupported unique cure product.",
    items: []
  },
  "wop-000131": {
    reviewStatus: "reviewed",
    sourceIds: ["tondi-polyfurfuryl-alcohol-structure-study-2019"],
    representationType: "network_fragment",
    scopeNote: "Acid-cured poly(furfuryl alcohol) is a structurally heterogeneous furanic network with methylene, conjugated, and branched connections whose abundance depends on water, catalyst, and cure. The furan junction is representative and not a unique repeat unit.",
    items: [{ key: "polyfurfuryl-alcohol-network-motif", label: "Furanic network motif", smiles: "[*]Cc1cc(C[*])oc1C[*]", fidelity: "schematic", altText: "Substituted furan ring with three methylene-linked open network continuations", caption: "Schematic methylene-connected furan junction; real poly(furfuryl alcohol) contains multiple linkage and branching motifs." }]
  }
};
