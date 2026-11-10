// Exceptional records whose authored connection tables or polymer S-groups
// need more control than the shared one-repeat migration scaffold.

const blockArchitecture = (key, label, smiles, blockBackboneCounts, altText, caption) => ({
  key,
  label,
  smiles,
  polymerSgroup: {
    connect: 'HT',
    blockBackboneCounts,
    blockLabels: ['x', 'y', 'z'],
    linearizeBackbone: true
  },
  fidelity: 'schematic',
  altText,
  caption
});

const unbracketedChain = (key, label, smiles, fidelity, altText, caption, options = {}) => ({
  key,
  label,
  smiles,
  polymerSgroup: false,
  fidelity,
  altText,
  caption,
  ...options
});

export default {
  'wop-000017': {
    reviewStatus: 'reviewed',
    sourceIds: ['coc-polyplastics-20230192930'],
    representationType: 'macromolecular_motif',
    scopeNote: 'The unbracketed local segment contains one ethylene-derived interval beside one ring-retaining norbornene-derived interval to identify a common COC constituent pair. The displayed adjacency is illustrative; comonomer ratio, sequence, stereochemistry, chain ends, and alternative cyclic olefins are not fixed.',
    items: [unbracketedChain(
      'coc-ethylene-norbornene-local-segment',
      'Ethylene/norbornene local segment',
      '[*]CCC1C([*])C2CCC1C2',
      'schematic',
      'Open cyclic olefin copolymer chain segment containing an ethylene-derived interval and a ring-retaining norbornene-derived interval',
      'Schematic unbracketed ethylene/norbornene COC segment; the adjacency is illustrative and does not assert sequence, ratio, or stereochemical distribution.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000024': {
    reviewStatus: 'reviewed',
    sourceIds: ['cpvc-kaneka-6242539'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed finite segment illustrates retained methylene, monochlorinated, and more highly chlorinated environments along the alternating site parity inherited from a PVC backbone. Their placement is schematic: the cited microstructure evidence establishes CH2, CHCl, and CCl2 environments but does not resolve a universal local sequence, chlorine content, tacticity, branching, chain ends, or thermal defects.',
    items: [unbracketedChain(
      'cpvc-variable-chlorination-local-segment',
      'Variable chlorination motif',
      '[*]CC(Cl)C(Cl)C(Cl)(Cl)C(Cl)[*]',
      'schematic',
      'Open post-chlorinated PVC chain segment containing retained methylene, monochlorinated, and dichlorinated backbone carbons in parity-consistent positions',
      'Schematic unbracketed CPVC motif showing several source-supported chlorination environments; the displayed adjacency is illustrative and does not specify their abundance or sequence.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000033': {
    reviewStatus: 'reviewed',
    sourceIds: ['traceability-abs-review-2024'],
    representationType: 'component_set',
    scopeNote: 'ABS is represented by separate unbracketed local segments for its styrene/acrylonitrile-rich matrix and butadiene-rich rubber phase. The set identifies phase chemistry without asserting composition, SAN sequence, graft topology, rubber microstructure fractions, or particle morphology.',
    items: [
      unbracketedChain(
        'san-styrene-acrylonitrile-local-segment',
        'Styrene/acrylonitrile-rich matrix segment',
        '[*]CC(c1ccccc1)CC(C#N)[*]',
        'schematic',
        'Open SAN chain segment containing adjacent styrene-derived and acrylonitrile-derived intervals',
        'Schematic unbracketed SAN-matrix segment; the displayed styrene/acrylonitrile adjacency does not specify matrix sequence or composition.',
        { unknownTetrahedralStereo: false }
      ),
      unbracketedChain(
        'abs-butadiene-rich-local-segment',
        'Butadiene-rich rubber segment',
        '[*]CC=CCCC=CC[*]',
        'representative',
        'Open butadiene-rich rubber chain segment containing two unsaturated 1,4-derived intervals with unspecified alkene geometry',
        'Representative unbracketed 1,4-butadiene-rich segment; the displayed local dyad, cis/trans geometry, 1,2-unit content, and graft sites are not fixed.',
        { unknownTetrahedralStereo: false }
      )
    ]
  },
  'wop-000034': {
    reviewStatus: 'reviewed',
    sourceIds: ['liu-asa-core-shell-preprint-2023'],
    representationType: 'component_set',
    scopeNote: 'ASA is represented by separate unbracketed local segments for a styrene/acrylonitrile-rich phase and a representative n-butyl-acrylate rubber phase. The set does not encode composition, SAN sequence, graft points, crosslinking, core-shell dimensions, or a unique acrylate identity for every ASA grade.',
    items: [
      unbracketedChain(
        'san-styrene-acrylonitrile-local-segment',
        'Styrene/acrylonitrile-rich segment',
        '[*]CC(c1ccccc1)CC(C#N)[*]',
        'schematic',
        'Open SAN chain segment containing adjacent styrene-derived and acrylonitrile-derived intervals',
        'Schematic unbracketed SAN-rich segment; the displayed styrene/acrylonitrile adjacency does not specify sequence, composition, or graft topology.',
        { unknownTetrahedralStereo: false }
      ),
      unbracketedChain(
        'asa-n-butyl-acrylate-local-segment',
        'Representative acrylic-rubber segment',
        '[*]CC(C(=O)OCCCC)CC(C(=O)OCCCC)[*]',
        'representative',
        'Open acrylic-rubber chain segment containing two n-butyl-acrylate-derived intervals',
        'Representative unbracketed n-butyl-acrylate-rich rubber segment; the local dyad does not fix acrylate composition, sequence, crosslinking, or graft sites.',
        { unknownTetrahedralStereo: false }
      )
    ]
  },
  'wop-000099': {
    reviewStatus: 'reviewed',
    sourceIds: ['dgeba-shundo-precursor-structure-2022'],
    representationType: 'no_unique_repeat',
    scopeNote: 'DGEBA epoxy is supplied as epoxide-bearing precursor and oligomer distributions, then converted into hardener- and stoichiometry-dependent networks. The cited evidence therefore does not support one universal constitutional repeat unit or cured-network fragment; the lowest-mass precursor is shown in the synthesis tab instead of as the polymer hero.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The source-defined n = 0 DGEBA molecule identifies the difunctional glycidyl-ether feed chemistry. It is a synthesis precursor, not a repeat unit or a representation of the cured thermoset.',
        items: [{
          key: 'dgeba-diepoxide-precursor',
          label: 'Lowest-mass DGEBA precursor',
          smiles: 'CC(C)(c1ccc(OCC2CO2)cc1)c1ccc(OCC2CO2)cc1',
          unknownTetrahedralStereo: false,
          fidelity: 'representative',
          altText: 'Bisphenol A diglycidyl ether molecule with two terminal glycidyl ether epoxide groups',
          caption: 'Representative n = 0 DGEBA synthesis precursor; higher oligomers and the hardener-dependent cured network are not shown.'
        }]
      }
    }
  },
  'wop-000100': {
    reviewStatus: 'reviewed',
    sourceIds: ['knox-dgebf-regioisomers-2019'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Commercial DGEBF contains a variable regioisomer and oligomer distribution, and curing produces a hardener- and formulation-dependent network. No one repeat unit or finite network fragment represents that full material scope; the three source-defined precursor regioisomers are shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The three finite molecules distinguish source-supported para–para, para–ortho, and ortho–ortho DGEBF precursor regioisomers. They do not specify their proportions, higher oligomers, or the cured network.',
        items: [
          {
            key: 'dgebf-para-para-diepoxide-precursor',
            label: 'para–para DGEBF precursor',
            smiles: 'C(c1ccc(OCC2CO2)cc1)c3ccc(OCC4CO4)cc3',
            unknownTetrahedralStereo: false,
            fidelity: 'exact',
            altText: 'Para–para bisphenol F diglycidyl ether precursor with two terminal epoxide groups',
            caption: 'para–para DGEBF synthesis precursor; no isomer fraction, oligomer distribution, or cured topology is implied.'
          },
          {
            key: 'dgebf-para-ortho-diepoxide-precursor',
            label: 'para–ortho DGEBF precursor',
            smiles: 'C(c1ccc(OCC2CO2)cc1)c3ccccc3OCC4CO4',
            unknownTetrahedralStereo: false,
            fidelity: 'exact',
            altText: 'Para–ortho bisphenol F diglycidyl ether precursor with two terminal epoxide groups',
            caption: 'para–ortho DGEBF synthesis precursor; no isomer fraction, oligomer distribution, or cured topology is implied.'
          },
          {
            key: 'dgebf-ortho-ortho-diepoxide-precursor',
            label: 'ortho–ortho DGEBF precursor',
            smiles: 'C(c1ccccc1OCC2CO2)c3ccccc3OCC4CO4',
            unknownTetrahedralStereo: false,
            fidelity: 'exact',
            altText: 'Ortho–ortho bisphenol F diglycidyl ether precursor with two terminal epoxide groups',
            caption: 'ortho–ortho DGEBF synthesis precursor; no isomer fraction, oligomer distribution, or cured topology is implied.'
          }
        ]
      }
    }
  },
  'wop-000103': {
    reviewStatus: 'reviewed',
    sourceIds: ['cycloaliphatic-epoxy-patry-precursor-structure-2025'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Cycloaliphatic epoxy resins span different epoxide-bearing molecules and become networks only through formulation-specific anhydride, cationic, or other cure chemistry. The evidence does not establish one family-wide repeat unit or network fragment; a representative diepoxide is placed in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'This finite cycloaliphatic diepoxide identifies one representative epoxide-bearing precursor used before cure. It does not stand for every cycloaliphatic epoxy precursor or for the cured network.',
        items: [{
          key: 'cycloaliphatic-diepoxide-precursor',
          label: 'Representative cycloaliphatic diepoxide precursor',
          smiles: 'O=C(OCC1CCC2OC2C1)C1CCC2OC2C1',
          unknownTetrahedralStereo: false,
          fidelity: 'representative',
          altText: 'Cycloaliphatic diepoxide precursor with two epoxidized cyclohexane rings linked through an ester group',
          caption: 'Representative synthesis precursor; other ring systems and functionalities and the formulation-dependent cured network are not shown.'
        }]
      }
    }
  },
  'wop-000109': {
    reviewStatus: 'reviewed',
    sourceIds: ['vinyl-ester-epoxy-methacrylation-us20080039590'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Bisphenol-A epoxy vinyl ester resins are oligomer distributions commonly formulated with reactive diluent and converted by free-radical cure into composition-dependent networks. No one repeat unit or cured topology represents the family; the idealized lowest-mass product is shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The idealized n = 0 methacrylated DGEBA product identifies the terminal vinyl-ester precursor chemistry. It is not a repeat unit and does not encode higher products, reactive diluent, or free-radical cure.',
        items: [{
          key: 'bisphenol-a-epoxy-vinyl-ester-precursor',
          label: 'Idealized n = 0 vinyl ester precursor',
          smiles: 'CC(=C)C(=O)OCC(O)COc1ccc(C(C)(C)c2ccc(OCC(O)COC(=O)C(=C)C)cc2)cc1',
          unknownTetrahedralStereo: false,
          fidelity: 'representative',
          altText: 'Bisphenol A epoxy vinyl ester precursor with two terminal methacrylate groups and two secondary alcohols',
          caption: 'Idealized n = 0 synthesis precursor; higher products, reactive diluent, and the free-radical-cured network are not shown.'
        }]
      }
    }
  },
  'wop-000114': {
    reviewStatus: 'draft',
    sourceIds: ['cresol-formaldehyde-weber-coating-patent-1958'],
    representationType: 'macromolecular_motif',
    scopeNote: 'The unbracketed phenolic fragment is one representative methyl-substituted, methylene-linked cresol environment. The cited sources support methylene-linked phenolic oligomers and variable ortho/para linkage patterns, so the drawing deliberately does not claim a unique cresol isomer, bridge placement, methylolation state, oligomer length, or cured topology.',
    items: [unbracketedChain(
      'cresol-formaldehyde-network-motif',
      'Illustrative cresol–methylene motif',
      '[*]Cc1cc(C)c(O)c(C[*])c1',
      'schematic',
      'Open methyl- and hydroxyl-substituted phenyl fragment with two methylene continuations',
      'Representative unbracketed cresol–formaldehyde motif; the displayed bridge positions are illustrative within the source-supported variable ortho/para linkage family.'
    )]
  },
  'wop-000121': {
    reviewStatus: 'reviewed',
    sourceIds: ['labana-benzoguanamine-formaldehyde-crosslinkers-us4002699'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Benzoguanamine–formaldehyde resins vary in methylolation, etherification, condensation bridges, co-resins, and cure conversion. The cited source explicitly distinguishes the finite dimethylolbenzoguanamine crosslinker from polymeric resin, so no unique repeat unit is asserted in the hero.',
    items: [],
    contextualStructures: {
      processing: {
        scopeNote: 'The cited finite dimethylolbenzoguanamine molecule is presented as an amino-functional crosslinking agent. It is shown here as formulation and cure context, not as the repeat unit of benzoguanamine–formaldehyde resin.',
        items: [{
          key: 'dimethylolbenzoguanamine-precursor',
          label: 'Dimethylolbenzoguanamine crosslinker',
          smiles: 'OCNc1nc(NCO)nc(-c2ccccc2)n1',
          fidelity: 'representative',
          altText: 'Dimethylolbenzoguanamine crosslinker with a phenyl-substituted triazine core and two hydroxymethylamino groups',
          caption: 'Representative finite crosslinking agent from the cited source; it is not the polymeric resin or a cured-network repeat.'
        }]
      }
    }
  },
  'wop-000127': {
    reviewStatus: 'reviewed',
    sourceIds: ['cai-bismaleimidodiphenylmethane-2023'],
    representationType: 'no_unique_repeat',
    scopeNote: 'BMI resins can use different multifunctional maleimides, comonomers, advancement reactions, and cure routes, producing formulation-dependent networks without one universal repeat unit. The source-defined BDM starting material is shown in the synthesis tab instead of as the material hero.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The finite BDM molecule is one source-defined aromatic bismaleimide starting material before modification and cure. It identifies precursor functionality without defining a universal BMI resin or network.',
        items: [{
          key: 'bismaleimidodiphenylmethane-precursor',
          label: 'BDM bismaleimide precursor',
          smiles: 'C(c1ccc(N2C(=O)C=CC2=O)cc1)c1ccc(N2C(=O)C=CC2=O)cc1',
          fidelity: 'representative',
          altText: 'Diphenylmethane bismaleimide precursor bearing one maleimide ring on each para position',
          caption: 'Representative 4,4′-bismaleimidodiphenylmethane synthesis precursor; comonomers, advancement, and cure determine the final network.'
        }]
      }
    }
  },
  'wop-000141': {
    reviewStatus: 'reviewed',
    sourceIds: ['sugama-xsbr-terpolymer-structure-2023'],
    representationType: 'macromolecular_motif',
    scopeNote: 'The unbracketed segment connects source-supported styrene-, 1,4-butadiene-, and acrylic-acid-derived intervals as one compact XSBR constitution schematic. Their displayed order is illustrative; composition, sequence, diene microstructure distribution, neutralization, latex morphology, and cure network are not fixed.',
    items: [unbracketedChain(
      'xsbr-styrene-butadiene-acrylic-acid-local-segment',
      'Styrene/butadiene/acrylic-acid local segment',
      '[*]CC(c1ccccc1)CC=CCCC(C(=O)O)[*]',
      'schematic',
      'Open XSBR chain segment containing styrene-derived, unsaturated 1,4-butadiene-derived, and acrylic-acid-derived intervals',
      'Schematic unbracketed XSBR segment; the displayed constituent order is not a sequence or composition claim, and alkene geometry is unspecified.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000144': {
    reviewStatus: 'reviewed',
    sourceIds: ['muller-xnbr-emulsifier-free-patent-1999'],
    representationType: 'macromolecular_motif',
    scopeNote: 'The unbracketed segment connects source-supported acrylonitrile-, 1,4-butadiene-, and methacrylic-acid-derived intervals as one compact XNBR constitution schematic. Their displayed order is illustrative; composition, sequence, diene microstructure distribution, neutralization, and crosslinking are not fixed.',
    items: [unbracketedChain(
      'xnbr-acrylonitrile-butadiene-methacrylic-acid-local-segment',
      'Acrylonitrile/butadiene/methacrylic-acid local segment',
      '[*]CC(C#N)CC=CCCC(C)(C(=O)O)[*]',
      'schematic',
      'Open XNBR chain segment containing acrylonitrile-derived, unsaturated 1,4-butadiene-derived, and methacrylic-acid-derived intervals',
      'Schematic unbracketed XNBR segment; the displayed constituent order is not a sequence or composition claim, and alkene geometry is unspecified.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000145': {
    reviewStatus: 'reviewed',
    sourceIds: ['egami-butyl-manufacture-1978'],
    representationType: 'macromolecular_motif',
    scopeNote: 'The unbracketed local chain shows a representative unsaturated isoprene-derived site within isobutylene-rich IIR surroundings. It does not assign the isoprene content, comonomer sequence, minor microstructures, alkene geometry, chain ends, or a vulcanized network.',
    items: [unbracketedChain(
      'butyl-rubber-isoprene-site-local-segment',
      'Isoprene site in an isobutylene-rich chain',
      '[*]C(C)(C)CC(C)=CCCC(C)(C)[*]',
      'representative',
      'Open butyl-rubber chain segment with a methyl-substituted alkene site between dimethyl-substituted isobutylene-rich intervals',
      'Representative unbracketed IIR local segment; the isoprene-derived unsaturation is shown in an isobutylene-rich chain without specifying alkene geometry, sequence, or abundance.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000146': {
    reviewStatus: 'reviewed',
    sourceIds: ['sukhareva-halobutyl-microstructures-2023'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The two unbracketed local chains show the source-supported EXO allylic-bromide and ENDO bromomethyl microstructures within isobutylene-rich surroundings. They do not encode their relative abundance, other minor isomers, comonomer sequence, total bromine content, allylic stereochemistry, alkene geometry where applicable, or cure products.',
    items: [
      unbracketedChain(
        'bromobutyl-exo-local-segment',
        'EXO allylic-bromide site',
        '[*]C(C)(C)CC(=C)C(Br)CCC(C)(C)[*]',
        'representative',
        'Open bromobutyl chain segment with an exo-methylene group and a secondary allylic bromide site in isobutylene-rich surroundings',
        'Representative unbracketed EXO bromobutyl microstructure from the cited source; allylic configuration is unspecified, and no abundance or sequence is implied.',
        { unknownTetrahedralStereo: false }
      ),
      unbracketedChain(
        'bromobutyl-endo-local-segment',
        'ENDO bromomethyl site',
        '[*]C(C)(C)CC(CBr)=CCCC(C)(C)[*]',
        'representative',
        'Open bromobutyl chain segment with an internal alkene bearing a bromomethyl substituent in isobutylene-rich surroundings',
        'Representative unbracketed ENDO bromomethyl microstructure from the cited source; alkene geometry is unspecified, and no abundance or sequence is implied.',
        { unknownTetrahedralStereo: false }
      )
    ]
  },
  'wop-000147': {
    reviewStatus: 'reviewed',
    sourceIds: ['sukhareva-halobutyl-microstructures-2023'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The two unbracketed local chains show the source-supported EXO allylic-chloride and ENDO chloromethyl microstructures within isobutylene-rich surroundings. They do not encode their relative abundance, other minor isomers, comonomer sequence, total chlorine content, allylic stereochemistry, alkene geometry where applicable, or cure products.',
    items: [
      unbracketedChain(
        'chlorobutyl-exo-local-segment',
        'EXO allylic-chloride site',
        '[*]C(C)(C)CC(=C)C(Cl)CCC(C)(C)[*]',
        'representative',
        'Open chlorobutyl chain segment with an exo-methylene group and a secondary allylic chloride site in isobutylene-rich surroundings',
        'Representative unbracketed EXO chlorobutyl microstructure from the cited source; allylic configuration is unspecified, and no abundance or sequence is implied.',
        { unknownTetrahedralStereo: false }
      ),
      unbracketedChain(
        'chlorobutyl-endo-local-segment',
        'ENDO chloromethyl site',
        '[*]C(C)(C)CC(CCl)=CCCC(C)(C)[*]',
        'representative',
        'Open chlorobutyl chain segment with an internal alkene bearing a chloromethyl substituent in isobutylene-rich surroundings',
        'Representative unbracketed ENDO chloromethyl microstructure from the cited source; alkene geometry is unspecified, and no abundance or sequence is implied.',
        { unknownTetrahedralStereo: false }
      )
    ]
  },
  'wop-000151': {
    reviewStatus: 'reviewed',
    sourceIds: ['sugiyama-acrylic-rubber-2016'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'An unbracketed Markush alkyl-acrylate segment captures the common acrylic-rubber backbone and ester linkage while leaving two successive ester substituent sites independently variable. It does not imply that one chain contains every listed R¹/R² option, and it omits the low-level cure-site comonomer and vulcanized network.',
    items: [{
      key: 'acrylic-rubber-alkyl-acrylate-markush-segment',
      label: 'Alkyl-acrylate Markush segment',
      smiles: '[*]CC(C(=O)O[*:1])CC(C(=O)O[*:2])[*]',
      polymerSgroup: false,
      markushLabels: { 1: 'R1', 2: 'R2' },
      unknownTetrahedralStereo: false,
      fidelity: 'representative',
      altText: 'Open acrylic-rubber chain segment with two alkyl-acrylate intervals and independently numbered R groups on the ester oxygens',
      caption: 'Representative unbracketed family segment; R¹ and R² distinguish successive variable ester substituent sites while cure-site comonomers and the vulcanized network are not shown.',
      notation: 'R¹ and R² independently = ethyl, n-butyl, or 2-methoxyethyl on the ester oxygen; they may be the same or different, and no sequence or fraction is assigned.'
    }]
  },
  'wop-000155': {
    reviewStatus: 'reviewed',
    sourceIds: ['cpe-us20210230322a1-chlorinated-polyethylene-patent'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed local chain contains both unsubstituted methylene sites and one representative chlorinated backbone site. It identifies post-chlorinated polyethylene chemistry without fixing chlorine content, substitution distribution, starting-polyethylene branching, blockiness, chain ends, or cure state.',
    items: [unbracketedChain(
      'cpe-mixed-chlorination-local-segment',
      'Mixed chlorination local segment',
      '[*]CCC(Cl)CCCC[*]',
      'schematic',
      'Open polyethylene-derived chain segment containing unchlorinated methylene sites and one chlorine-substituted backbone carbon',
      'Schematic unbracketed CPE segment with one illustrative chlorinated site; chlorine fraction, placement, and local sequence vary.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000156': {
    reviewStatus: 'reviewed',
    sourceIds: ['cspe-dow-3542746'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed local chain shows chlorine and chlorosulfonyl substitution at separate representative sites on a polyethylene-derived backbone. Their relative placement is illustrative; chlorine and sulfur contents, substitution distribution, branching, chain ends, and cure network are not fixed.',
    items: [unbracketedChain(
      'cspe-chlorine-chlorosulfonyl-local-segment',
      'Chlorine/chlorosulfonyl local segment',
      '[*]CCC(Cl)CC(S(=O)(=O)Cl)CC[*]',
      'schematic',
      'Open polyethylene-derived chain segment bearing one chlorine substituent and one sulfonyl chloride substituent at separate backbone sites',
      'Schematic unbracketed CSPE segment; the displayed chlorine and chlorosulfonyl placements do not specify substitution levels, sequence, or cure state.',
      { unknownTetrahedralStereo: false }
    )]
  },
  'wop-000166': {
    reviewStatus: 'reviewed',
    sourceIds: ['sbs-living-diblock-coupling-us8349950'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing encodes the supported polystyrene–polybutadiene–polystyrene A–B–A order with independently delimited PS_x, PB_y, and PS_z blocks. One short illustrative unit is used for each block; block lengths, diene microstructure fractions, molecular mass, coupling details, and morphology are not represented.',
    items: [{
      key: 'sbs-connected-aba-block-architecture',
      label: 'Connected PS–PB–PS architecture',
      molfilePath: './curated-structures/sbs-connected-aba-block-architecture.mol',
      fidelity: 'schematic',
      altText: 'Connected polystyrene x block, polybutadiene y block, and polystyrene z block with phenyl-bearing outer units and an unsaturated central unit',
      caption: 'Schematic once-through PS_x–PB_y–PS_z architecture; each subscript is an independent block length, and alkene geometry is unspecified.'
    }]
  },
  'wop-000167': {
    reviewStatus: 'reviewed',
    sourceIds: ['sis-sequential-anionic-cn113461882'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing encodes the supported polystyrene–polyisoprene–polystyrene A–B–A order with independently delimited PS_x, PI_y, and PS_z blocks. One short illustrative unit is used for each block; block lengths, isoprene microstructure distribution, molecular mass, coupling details, and morphology are not represented.',
    items: [blockArchitecture(
      'sis-connected-aba-block-architecture',
      'Connected PS–PI–PS architecture',
      '[*]CC(c1ccccc1)CC(C)=CCCC(c1ccccc1)[*]',
      [2, 4, 2],
      'Connected polystyrene x block, polyisoprene y block, and polystyrene z block with a methyl-substituted unsaturated central unit',
      'Schematic once-through PS_x–PI_y–PS_z architecture; each subscript is an independent block length, and alkene geometry is unspecified.'
    )]
  },
  'wop-000168': {
    reviewStatus: 'reviewed',
    sourceIds: ['sebs-sbs-preparation-hydrogenation-us7186782'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing encodes polystyrene outer blocks around a saturated, hydrogenated-polybutadiene-derived center as independently delimited PS_x, EB_y, and PS_z blocks. It is a short architecture schematic, not a claim about block lengths, ethylene/butylene distribution, residual unsaturation, molecular mass, coupling, or morphology.',
    items: [blockArchitecture(
      'sebs-connected-aba-block-architecture',
      'Connected PS–EB–PS architecture',
      '[*]CC(c1ccccc1)CCC(CC)CCC(c1ccccc1)[*]',
      [2, 4, 2],
      'Connected polystyrene x block, saturated ethylene-butylene y block, and polystyrene z block with phenyl-bearing outer units',
      'Schematic once-through PS_x–EB_y–PS_z architecture; local sequence and the independent block lengths are not quantitative.'
    )]
  },
  'wop-000169': {
    reviewStatus: 'reviewed',
    sourceIds: ['seps-sis-hydrogenation-ep1352940'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing encodes polystyrene outer blocks around a saturated, hydrogenated-polyisoprene-derived ethylene/propylene-like center as independently delimited PS_x, EP_y, and PS_z blocks. It is a short architecture schematic, not a claim about block lengths, local sequence, branch distribution, molecular mass, coupling, or morphology.',
    items: [blockArchitecture(
      'seps-connected-aba-block-architecture',
      'Connected PS–EP–PS architecture',
      '[*]CC(c1ccccc1)CC(C)CCC(c1ccccc1)[*]',
      [2, 3, 2],
      'Connected polystyrene x block, saturated ethylene-propylene y block, and polystyrene z block with a methyl-branched central unit',
      'Schematic once-through PS_x–EP_y–PS_z architecture; local sequence, stereochemistry, and independent block lengths are not quantitative.'
    )]
  },
  'wop-000170': {
    reviewStatus: 'reviewed',
    sourceIds: ['seeps-mixed-diene-precursor-ep1352940'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing encodes polystyrene outer blocks around a saturated center containing unbranched and methyl-branched motifs as independently delimited PS_x, mixed-middle_y, and PS_z blocks. It is a short SEEPS architecture schematic and does not fix internal sub-block lengths or order, local sequence, branch distribution, molecular mass, coupling, or morphology.',
    items: [blockArchitecture(
      'seeps-connected-multiblock-architecture',
      'Connected PS–(EE/EP)–PS architecture',
      '[*]CC(c1ccccc1)CCCC(C)CCC(c1ccccc1)[*]',
      [2, 5, 2],
      'Connected polystyrene x block, mixed saturated y block, and polystyrene z block with unbranched and methyl-branched middle motifs',
      'Schematic once-through PS_x–mixed-middle_y–PS_z architecture; the middle motifs identify ethylene-rich and ethylene/propylene-like chemistry without asserting internal sub-block order or lengths.'
    )]
  },
  'wop-000238': {
    reviewStatus: 'reviewed',
    sourceIds: ['poloxamer-sequential-block-synthesis-2012'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing encodes the supported PEO–PPO–PEO A–B–A order with independently delimited PEO_x, PPO_y, and PEO_z blocks. It uses one shortest illustrative unit per block and does not define block lengths, PEO/PPO ratio, PPO stereochemistry, chain ends, commercial grade, micelles, or gels.',
    items: [blockArchitecture(
      'peo-ppo-peo-connected-aba-architecture',
      'Connected PEO–PPO–PEO architecture',
      '[*]CCOCC(C)OCCO[*]',
      [3, 3, 3],
      'Connected polyethylene oxide x block, polypropylene oxide y block, and polyethylene oxide z block with a methyl-bearing central ether unit',
      'Schematic once-through PEO_x–PPO_y–PEO_z architecture; the independent subscripts denote block lengths, and PPO stereochemistry is unspecified.'
    )]
  },
  'wop-000189': {
    reviewStatus: 'reviewed',
    sourceIds: ['cellulose-acetate-secondary-alcoholysis-patent'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to show that each site may remain unmodified or be acetylated. It represents substitution choices without fixing degree of substitution, site distribution, sequence, or chain length.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Variable-acetylation Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups at the hydroxyl substitution sites',
      'Representative cellulose-acetate Markush motif; each site is independently bounded by the notation, so no fixed substitution pattern is implied.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H or acetyl [C(=O)CH₃].'
      }
    )]
  },
  'wop-000192': {
    reviewStatus: 'reviewed',
    sourceIds: ['cab-ambrosio-silica-stationary-phase-2025'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl, acetate, or butyrate at each site. It does not fix degree of substitution, site distribution, acetyl-to-butyryl ratio, sequence, or chain length.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Acetate/butyrate Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups representing residual hydroxyl, acetate, or butyrate substitution',
      'Representative CAB Markush motif; each site is independently bounded by the notation, so ester positions and amounts remain variable.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H, acetyl [C(=O)CH₃], or butyryl [C(=O)CH₂CH₂CH₃].'
      }
    )]
  },
  'wop-000193': {
    reviewStatus: 'reviewed',
    sourceIds: ['cap-daicel-ep0822201-patent-2003'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl, acetate, or propionate at each site. It does not fix degree of substitution, site distribution, acetyl-to-propionyl ratio, sequence, or chain length.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Acetate/propionate Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups representing residual hydroxyl, acetate, or propionate substitution',
      'Representative CAP Markush motif; each site is independently bounded by the notation, so ester positions and amounts remain variable.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H, acetyl [C(=O)CH₃], or propionyl [C(=O)CH₂CH₃].'
      }
    )]
  },
  'wop-000194': {
    reviewStatus: 'reviewed',
    sourceIds: ['cellulose-nitrate-budaeva-synthetic-cellulose-2025'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to show that each site may remain hydroxyl or form a nitrate ester. Nitrogen content, degree and site distribution of nitration, stabilizers, and plasticizers vary, so no uniform repeat is implied.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Variable-nitration Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups representing residual hydroxyl or nitrate-ester substitution',
      'Representative cellulose-nitrate Markush motif; each site is independently bounded by the notation, so nitration degree and site distribution remain variable.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H or nitrate ester, giving O–H or O–NO₂ at that site.'
      }
    )]
  },
  'wop-000200': {
    reviewStatus: 'reviewed',
    sourceIds: ['rahman-recent-cmc-developments-2021'],
    representationType: 'family_representative_set',
    scopeNote: 'The two unbracketed β-1,4-glucan fragments distinguish an illustrative carboxymethyl ether in its acid form from the common sodium carboxylate form. Degree and site distribution of substitution, neutralization fraction, counterion, sequence, and chain length remain grade dependent.',
    items: [
      unbracketedChain(
        'carboxymethyl-cellulose-motif',
        'Carboxymethylcellulose acid-form motif',
        '[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OCC(=O)O)[C@H]1O',
        'representative',
        'Open beta-1,4-glucan residue bearing one carboxymethyl ether in its carboxylic acid form',
        'Representative unbracketed acid-form carboxymethylcellulose motif; substitution site and degree vary.'
      ),
      unbracketedChain(
        'sodium-carboxymethyl-cellulose-motif',
        'Sodium carboxymethylcellulose motif',
        '[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OCC(=O)[O-])[C@H]1O.[Na+]',
        'representative',
        'Open beta-1,4-glucan residue bearing one carboxymethylate anion with a separate sodium counterion',
        'Representative unbracketed sodium-CMC motif; counterion, neutralization, substitution site, and degree vary.'
      )
    ]
  },
  'wop-000207': {
    reviewStatus: 'reviewed',
    sourceIds: ['lee-alginate-properties-2012'],
    representationType: 'copolymer_unit_set',
    scopeNote: 'The set shows the two epimeric uronate units of alginate using a fully deprotonated sodium-form drawing convention. It does not encode M/G ratio, block sequence, molecular mass, biological source, alternative protonation or counterions, or divalent-ion network junctions.',
    items: [
      {
        key: 'sodium-mannuronate-unit',
        label: 'Mannuronate unit',
        smiles: '[*]O[C@@H]1O[C@H](C(=O)[O-])[C@@H]([*])[C@H](O)[C@@H]1O.[Na+]',
        fidelity: 'representative',
        altText: 'Sodium mannuronate chain unit with a deprotonated carboxylate and explicit stereochemistry',
        caption: 'Mannuronate unit shown by convention as a fully deprotonated sodium salt; sequence, counterion, and ionization environment vary.'
      },
      {
        key: 'sodium-guluronate-unit',
        label: 'Guluronate unit',
        smiles: '[*]O[C@@H]1O[C@@H](C(=O)[O-])[C@@H]([*])[C@H](O)[C@@H]1O.[Na+]',
        fidelity: 'representative',
        altText: 'Sodium guluronate chain unit with a deprotonated carboxylate and epimeric stereochemistry',
        caption: 'Guluronate unit shown by convention as a fully deprotonated sodium salt; M/G sequence and ion-mediated junctions are not represented.'
      }
    ]
  },
  'wop-000208': {
    reviewStatus: 'draft',
    sourceIds: ['jiang-agarose-hydrogel-review-2023'],
    representationType: 'stereochemical_repeat_segment',
    scopeNote: 'The depiction shows the ideal alternating agarobiose constitution and stereochemistry of agarose, including D-galactose and 3,6-anhydro-alpha-L-galactopyranose residues. It does not encode chain ends, molar mass, natural substitution, derivatization, helix packing, or gel junctions.',
    items: [{
      key: 'agarose-sru',
      label: 'Agarobiose repeat segment',
      molfilePath: './curated-structures/agarose-sru.mol',
      fidelity: 'exact',
      altText: 'Stereochemical agarose chain segment with alternating D-galactose and 3,6-anhydro-L-galactopyranose residues inside repeat brackets',
      caption: 'Ideal agarose repeat segment with the alternating glycosidic linkages and residue stereochemistry shown explicitly; natural substitutions and higher-order gel structure are omitted.'
    }]
  },
  'wop-000209': {
    reviewStatus: 'draft',
    sourceIds: ['carrageenan-hilliou-gel-elasticity-2021'],
    representationType: 'family_representative_set',
    scopeNote: 'The set distinguishes ideal κ-, ι-, and λ-carrageenan disaccharide repeats with their source-defined glycosidic stereochemistry, sulfate positions, and anionic charge states. Counterions, hybrid and precursor carrageenans, natural substitution, sequence irregularity, molecular mass, and gel junctions are not represented.',
    items: [
      {
        key: 'kappa-carrageenan-sru',
        label: 'κ-Carrageenan repeat',
        molfilePath: './curated-structures/kappa-carrageenan-sru.mol',
        fidelity: 'exact',
        altText: 'Kappa-carrageenan disaccharide repeat with explicit stereochemistry and one sulfate anion',
        caption: 'Exact ideal κ-carrageenan repeat in its monoanionic form; counterions and natural sequence variation are omitted.'
      },
      {
        key: 'iota-carrageenan-sru',
        label: 'ι-Carrageenan repeat',
        molfilePath: './curated-structures/iota-carrageenan-sru.mol',
        fidelity: 'exact',
        altText: 'Iota-carrageenan disaccharide repeat with explicit stereochemistry and two sulfate anions',
        caption: 'Exact ideal ι-carrageenan repeat in its dianionic form; counterions and natural sequence variation are omitted.'
      },
      {
        key: 'lambda-carrageenan-sru',
        label: 'λ-Carrageenan repeat',
        molfilePath: './curated-structures/lambda-carrageenan-sru.mol',
        fidelity: 'exact',
        altText: 'Lambda-carrageenan disaccharide repeat with explicit stereochemistry and three sulfate anions',
        caption: 'Exact ideal λ-carrageenan repeat in its trianionic form; counterions and natural sequence variation are omitted.'
      }
    ]
  },
  'wop-000211': {
    reviewStatus: 'draft',
    sourceIds: ['collagen-bose-multiscale-review-2022'],
    representationType: 'macromolecular_motif',
    scopeNote: 'All collagens share a Gly–Xaa–Yaa sequence pattern, but Xaa and Yaa, interruptions, post-translational modifications, chain stoichiometry, and non-collagenous domains vary by collagen type. The finite Gly–L-Pro–trans-4-hydroxy-L-Pro segment is therefore a common representative triplet, not a universal constitutional repeat or a triple-helix model.',
    items: [unbracketedChain(
      'collagen-gly-pro-hyp-motif',
      'Representative Gly–Pro–Hyp motif',
      '[*]NCC(=O)N1CCC[C@H]1C(=O)N2C[C@@H](C[C@H]2C(=O)[*])O',
      'representative',
      'Open collagen peptide segment containing glycine, L-proline, and trans-4-hydroxy-L-proline residues with explicit stereochemistry',
      'Representative unbracketed Gly–Pro–Hyp peptide motif; Xaa/Yaa identities and sequence context vary, and triple-helical assembly is not depicted.'
    )]
  },
  'wop-000040': {
    reviewStatus: 'reviewed',
    sourceIds: ['iupac-acrylic-polymer-gold-book-2025', 'kawano-alkyl-acrylate-networks-2023'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed Markush motif keeps the acrylic backbone and ester linkage invariant while leaving the ester alkyl group source-bounded as R. It represents the family without implying that methyl, ethyl, n-butyl, or other allowed alkyl groups occur together in one chain; tacticity, composition, crosslinking, and chain ends remain unspecified.',
    items: [unbracketedChain(
      'alkyl-acrylate-markush-unit',
      'Poly(alkyl acrylate) Markush motif',
      '[*]CC(C(=O)O[*:1])[*]',
      'representative',
      'Open polyacrylate chain unit bearing an ester-linked generic R alkyl group',
      'Representative poly(alkyl acrylate) family motif; R denotes one allowed ester alkyl substituent for a material, not a mixture or sequence claim.',
      {
        markushLabels: { 1: 'R' },
        notation: 'R = an alkyl group on the ester oxygen; source-supported named family examples include methyl, ethyl, and n-butyl.'
      }
    )]
  },
  'wop-000098': {
    reviewStatus: 'reviewed',
    sourceIds: ['epoxy-shundo-network-properties-perspective-2022'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Epoxy resins span epoxide-bearing molecules and oligomers that become hardener-, stoichiometry-, and conversion-dependent networks. No one constitutional repeat or bounded cured-network fragment represents that family scope; two source-supported finite precursor classes are therefore shown in the synthesis tab rather than as the material hero.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The two finite source-defined molecules illustrate distinct glycidyl-ether and cycloaliphatic diepoxide feed chemistries before cure. They are synthesis precursors, not repeat units, and neither drawing defines an eventual network.',
        sourceIds: [
          'dgeba-shundo-precursor-structure-2022',
          'cycloaliphatic-epoxy-patry-precursor-structure-2025'
        ],
        items: [
          {
            key: 'dgeba-diepoxide-precursor',
            label: 'Representative glycidyl-ether epoxy precursor',
            smiles: 'CC(C)(c1ccc(OCC2CO2)cc1)c1ccc(OCC2CO2)cc1',
            unknownTetrahedralStereo: false,
            fidelity: 'representative',
            altText: 'Bisphenol A diglycidyl ether molecule with two terminal oxirane rings',
            caption: 'Representative DGEBA synthesis precursor; oligomer distribution, hardener identity, and cure determine the eventual network.'
          },
          {
            key: 'cycloaliphatic-diepoxide-precursor',
            label: 'Representative cycloaliphatic diepoxide precursor',
            smiles: 'O=C(OCC1CCC2OC2C1)C1CCC2OC2C1',
            unknownTetrahedralStereo: false,
            fidelity: 'representative',
            altText: 'Cycloaliphatic diepoxide ester molecule with two fused oxirane rings',
            caption: 'Representative cycloaliphatic synthesis precursor; other ring systems and functionalities and the cured network are not shown.'
          }
        ]
      }
    }
  },
  'wop-000101': {
    reviewStatus: 'reviewed',
    sourceIds: ['epn-stanzione-epon-164-dma-2021'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Epoxy novolac resins are distributions of multifunctional glycidylated novolac oligomers that form hardener- and formulation-dependent networks. The evidence does not establish one universal cured repeat or bounded network fragment; a representative oligomeric motif is shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The open cresol-novolac fragment identifies a representative glycidylated oligomer environment before cure. It is a prepolymer motif, not a repeat unit of the cured epoxy network; regioisomers, functionality, oligomer length, and cure topology vary.',
        items: [unbracketedChain(
          'epoxy-novolac-glycidyl-motif',
          'Representative epoxy-novolac prepolymer motif',
          '[*]Cc1cc(C)c(OCC2CO2)c(C[*])c1',
          'representative',
          'Open methylene-linked methylphenolic prepolymer ring bearing one glycidyl ether oxirane group',
          'Representative epoxy cresol novolac prepolymer motif; positional isomers, functionality distribution, oligomer length, and the cured network are not prescribed.'
        )]
      }
    }
  },
  'wop-000102': {
    reviewStatus: 'reviewed',
    sourceIds: ['glycidylamine-shell-2951822'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Glycidyl amine epoxy resins vary in amine core, glycidyl functionality, formulation, and hardener-derived cured topology. A finite tetraglycidyl molecule cannot serve as a polymer repeat or universal network fragment, so it is shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The finite tetraglycidyl methylenedianiline-type molecule identifies one established multifunctional glycidyl-amine precursor. It is not a repeat unit or a depiction of the cured network.',
        items: [{
          key: 'tetraglycidyl-methylenedianiline-precursor',
          label: 'Representative tetraglycidyl amine precursor',
          smiles: 'C(c1ccc(N(CC2CO2)CC2CO2)cc1)c1ccc(N(CC2CO2)CC2CO2)cc1',
          fidelity: 'representative',
          altText: 'Methylenedianiline core bearing four glycidyl oxirane groups on two tertiary amines',
          caption: 'Representative finite tetraglycidyl methylenedianiline-type synthesis precursor; precursor identity, hardener, and cured topology are formulation-specific.'
        }]
      }
    }
  },
  'wop-000104': {
    reviewStatus: 'reviewed',
    sourceIds: ['upr-spasojevic-prepolymer-network-synthesis-2021'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Unsaturated polyester resins are compositionally variable reactive prepolymer mixtures that are combined with a reactive diluent and converted into formulation-dependent networks. The cited bio-based formulation does not establish one universal cured repeat or bounded network fragment; its representative prepolymer segments are shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The two open polyester segments identify source-supported itaconate and succinate environments in a representative 1,2-propanediol-based prepolymer. Their displayed chemistry does not prescribe unit sequence or ratio, reactive diluent, cure conversion, or network topology.',
        items: [
          unbracketedChain(
            'propylene-itaconate-polyester-motif',
            'Representative itaconate prepolymer segment',
            '[*]OC(C)COC(=O)CC(=C)C(=O)[*]',
            'representative',
            'Open 1,2-propanediol itaconate polyester segment with a pendant methylene double bond',
            'Representative synthesis-stage 1,2-propanediol/itaconate prepolymer segment; sequence, fraction, diluent, and cured topology are not implied.'
          ),
          unbracketedChain(
            'propylene-succinate-polyester-motif',
            'Representative succinate prepolymer segment',
            '[*]OC(C)COC(=O)CCC(=O)[*]',
            'representative',
            'Open 1,2-propanediol succinate polyester segment with a saturated aliphatic diester residue',
            'Representative synthesis-stage 1,2-propanediol/succinate prepolymer segment; sequence, fraction, diluent, and cured topology are not implied.'
          )
        ]
      }
    }
  },
  'wop-000105': {
    reviewStatus: 'reviewed',
    sourceIds: ['ortho-upr-ethylene-phthalate-maleate-us4902773'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Orthophthalic unsaturated polyester resins are variable reactive prepolymers that are commonly combined with a reactive diluent and converted into formulation-dependent networks. The evidence does not establish one universal cured repeat or bounded network fragment; representative orthophthalate and unsaturated prepolymer segments are shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The two open polyester segments identify representative ortho-phthalate and unsaturated environments in an ethylene-glycol-based prepolymer. They do not prescribe glycol identity, unit sequence or ratio, reactive diluent, or cure topology.',
        items: [
          unbracketedChain(
            'ethylene-ortho-phthalate-polyester-motif',
            'Representative orthophthalate prepolymer segment',
            '[*]OCCOC(=O)c1ccccc1C(=O)[*]',
            'representative',
            'Open ethylene glycol orthophthalate polyester segment',
            'Representative orthophthalate-containing synthesis-stage prepolymer segment; glycol identity, composition, and cured topology are formulation-dependent.'
          ),
          unbracketedChain(
            'ethylene-maleate-polyester-motif',
            'Representative unsaturated dicarboxylate prepolymer segment',
            '[*]OCCOC(=O)C=CC(=O)[*]',
            'representative',
            'Open ethylene-glycol unsaturated dicarboxylate polyester segment containing a double bond with unspecified alkene geometry',
            'Representative unsaturated dicarboxylate synthesis-stage prepolymer segment; crossed double-bond notation leaves cis/trans geometry unspecified, and cure topology is not shown.'
          )
        ]
      }
    }
  },
  'wop-000106': {
    reviewStatus: 'reviewed',
    sourceIds: ['california-research-isophthalic-up-resin-1959'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Isophthalic unsaturated polyester resins are compositionally variable reactive prepolymers that are commonly combined with a reactive diluent and converted into formulation-dependent networks. The evidence does not define one cured repeat or bounded universal network fragment; representative prepolymer segments are shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The two open polyester segments identify source-supported isophthalate and unsaturated environments in a representative ethylene-glycol-based prepolymer. They do not prescribe glycol identity, unit sequence or ratio, reactive diluent, or cure topology.',
        items: [
          unbracketedChain(
            'ethylene-isophthalate-polyester-motif',
            'Representative isophthalate prepolymer segment',
            '[*]OCCOC(=O)c1cccc(C(=O)[*])c1',
            'representative',
            'Open ethylene glycol isophthalate polyester segment with meta aromatic carbonyl positions',
            'Representative isophthalate-containing synthesis-stage prepolymer segment; glycol identity, composition, and cured topology are formulation-dependent.'
          ),
          unbracketedChain(
            'ethylene-maleate-polyester-motif',
            'Representative unsaturated dicarboxylate prepolymer segment',
            '[*]OCCOC(=O)C=CC(=O)[*]',
            'representative',
            'Open ethylene-glycol unsaturated dicarboxylate polyester segment containing a double bond with unspecified alkene geometry',
            'Representative unsaturated dicarboxylate synthesis-stage prepolymer segment; crossed double-bond notation leaves cis/trans geometry unspecified, and cure topology is not shown.'
          )
        ]
      }
    }
  },
  'wop-000108': {
    reviewStatus: 'reviewed',
    sourceIds: ['vinyl-ester-epoxy-methacrylation-us20080039590'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Vinyl ester resins are distributions of epoxy-derived methacrylated products that are formulated with reactive diluent and converted into composition-dependent networks. No one constitutional repeat or bounded cured topology represents the family; an idealized finite bisphenol-A derivative is shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The idealized finite bisphenol-A epoxy vinyl ester identifies one source-supported methacrylated precursor before formulation and cure. It is not a repeat unit and does not encode higher products, reactive diluent, or network topology.',
        items: [{
          key: 'bisphenol-a-epoxy-vinyl-ester-precursor',
          label: 'Idealized bisphenol-A vinyl ester precursor',
          smiles: 'CC(=C)C(=O)OCC(O)COc1ccc(C(C)(C)c2ccc(OCC(O)COC(=O)C(=C)C)cc2)cc1',
          unknownTetrahedralStereo: false,
          fidelity: 'representative',
          altText: 'Bisphenol A epoxy vinyl ester precursor with two terminal methacrylate groups and secondary alcohols',
          caption: 'Idealized finite synthesis precursor; oligomer distribution, reactive diluent, and the free-radical-cured network are not represented.'
        }]
      }
    }
  },
  'wop-000110': {
    reviewStatus: 'reviewed',
    sourceIds: [
      'apicella-dulzer-novolac-vinyl-ester-patent',
      'jaswal-gaur-o-cresol-epoxy-novolac-vinyl-ester-2015'
    ],
    representationType: 'no_unique_repeat',
    scopeNote: 'Epoxy-novolac vinyl esters are distributions of multifunctional phenol- or cresol-novolac products whose linkage pattern, epoxide conversion, unsaturated-acid identity, reactive diluent, and radical-cure topology vary. The cited evidence does not establish one canonical prepolymer, repeat unit, or bounded network fragment.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'Jaswal and Gaur illustrate one o-cresol novolac local pathway before radical cure. Their characterization reports ortho–ortho, ortho–para, and para–para methylene linkages, so this unbracketed motif identifies source-supported local chemistry without defining an oligomer sequence, functionality distribution, reactive diluent, or network topology.',
        sourceIds: ['jaswal-gaur-o-cresol-epoxy-novolac-vinyl-ester-2015'],
        items: [unbracketedChain(
          'o-cresol-epoxy-novolac-vinyl-ester-source-motif',
          'o-Cresol vinyl-ester local motif',
          '[*]c1c(OCC(O)COC(=O)C(=C)C)c(C)cc(C[*])c1',
          'schematic',
          'o-Cresol novolac local motif with an ortho methyl group, an epoxide-opened hydroxypropyl methacrylate side chain, and open ortho and para continuation points',
          'Source-schematic local o-cresol epoxy-novolac vinyl-ester motif. Methacrylic-acid addition gives a secondary alcohol and terminal methacrylate ester; the open endpoints mark one illustrated ortho–para local connection, not the resin’s full linkage distribution or cured network.'
        )]
      }
    }
  },
  'wop-000152': {
    reviewStatus: 'reviewed',
    sourceIds: ['aem-dupont-us3925326a'],
    representationType: 'copolymer_unit_set',
    scopeNote: 'The set distinguishes the ethylene-derived constituent from a bounded generic alkyl-acrylate-derived constituent. R denotes the source-supported C1–C8 ester alkyl range; the drawings do not assign comonomer sequence or fraction, one particular R to every grade, low-level cure-site comonomers, or the vulcanized network.',
    items: [
      {
        key: 'polyethylene-sru',
        label: 'Ethylene-derived unit',
        smiles: '[*]CC[*]',
        fidelity: 'representative',
        altText: 'Saturated ethylene-derived two-carbon chain unit',
        caption: 'Representative ethylene-derived constituent; no sequence or fraction is implied.'
      },
      unbracketedChain(
        'alkyl-acrylate-markush-unit',
        'Alkyl-acrylate-derived Markush motif',
        '[*]CC(C(=O)O[*:1])[*]',
        'representative',
        'Open acrylate-derived chain unit bearing an ester-linked generic R alkyl group',
        'Representative AEM alkyl-acrylate motif; R bounds the ester substituent without assigning a particular grade composition or cure-site sequence.',
        {
          markushLabels: { 1: 'R' },
          notation: 'R = C1–C8 alkyl on the ester oxygen; the drawing does not assign one alkyl group to every material or grade.'
        }
      )
    ]
  },
  'wop-000160': {
    reviewStatus: 'reviewed',
    sourceIds: ['mladenovic-polysiloxane-pdms-structure-2024'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The Markush repeat keeps the siloxane backbone invariant as –O–Si(R¹)(R²)– while distinguishing its two independently variable silicon-bound substituent sites. It does not assert that every allowed pair occurs, or specify substituent distribution, reactive cure-site content, fillers, crosslinker, chain ends, or cured-network topology.',
    items: [{
      key: 'organosiloxane-r2sio-markush-sru',
      label: 'Organosiloxane Markush repeat',
      molfilePath: './curated-structures/organosiloxane-r2sio-markush-sru.mol',
      notation: 'R¹ and R² identify independently variable Si-bound sites and may be the same or different. The cited review lists methyl, ethyl, propyl, phenyl, fluoroalkyl, aminoalkyl, hydroxy, mercapto, hydrogen, and vinyl as usual substituents; it does not establish every possible pair.',
      fidelity: 'representative',
      altText: 'Siloxane repeat unit with independently numbered R-one and R-two substituent sites on silicon',
      caption: 'Representative –O–Si(R¹)(R²)– silicone-rubber family repeat; the numbered sites may carry identical or different allowed substituents and do not define a cure formulation or network.'
    }]
  },
  'wop-000171': {
    reviewStatus: 'reviewed',
    sourceIds: ['tpo-compound-grade-melt-blending-chapter-2024'],
    representationType: 'component_set',
    scopeNote: 'The set shows separate polypropylene and representative ethylene/propylene-elastomer constituents of a TPO. The connected elastomer segment is illustrative only: it does not assert sequence, composition, phase fraction, fillers, morphology, or a covalent bond between the two phases.',
    items: [
      {
        key: 'polypropylene-unspecified-sru',
        label: 'Polypropylene phase',
        smiles: '[*]CC(C)[*]',
        fidelity: 'representative',
        altText: 'Polypropylene repeat unit with a methyl side group and unspecified stereochemistry',
        caption: 'Representative polypropylene-phase chemistry; tacticity and phase fraction are not specified.'
      },
      unbracketedChain(
        'tpo-ethylene-propylene-elastomer-local-segment',
        'Ethylene/propylene elastomer segment',
        '[*]CCC(C)CC[*]',
        'schematic',
        'Open saturated olefin-elastomer segment with ethylene-derived and methyl-substituted propylene-derived intervals',
        'Schematic connected EPR-like local segment; the displayed adjacency is illustrative and no covalent link to the polypropylene phase is implied.'
      )
    ]
  },
  'wop-000172': {
    reviewStatus: 'reviewed',
    sourceIds: ['tpv-dynamic-vulcanization-chemistry-lehel-2020'],
    representationType: 'component_set',
    scopeNote: 'The set shows separate polypropylene and a connected representative EPDM local segment for a dynamically vulcanized rubber phase. The retained ethylidene double bond is an ENB-derived cure-site feature; rubber identity across TPVs, sequence, phase ratio, cure chemistry, crosslink topology, oil, filler, and morphology remain unspecified.',
    items: [
      {
        key: 'polypropylene-unspecified-sru',
        label: 'Thermoplastic polypropylene phase',
        smiles: '[*]CC(C)[*]',
        fidelity: 'representative',
        altText: 'Polypropylene repeat unit with a methyl side group and unspecified stereochemistry',
        caption: 'Representative continuous thermoplastic-phase chemistry; tacticity and phase fraction are not fixed.'
      },
      unbracketedChain(
        'tpv-epdm-enb-connected-local-motif',
        'EPDM local motif with ENB cure site',
        '[*]CC(C)C1C2CC(=CC)C(C2)C1CC[*]',
        'schematic',
        'Open EPDM local segment containing propylene-derived, ENB-derived, and ethylene-derived intervals with retained ethylidene unsaturation',
        'Schematic connected EPDM local motif: ENB incorporation consumes its endocyclic double bond while retaining ethylidene unsaturation; displayed adjacency and the dynamically cured network are not specified.'
      )
    ]
  },
  'wop-000173': {
    reviewStatus: 'reviewed',
    sourceIds: ['tpu-segment-chemistry-synthesis-asensio-2019'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing shows one representative PTMEG–MDI–PTMEG soft–hard–soft TPU architecture with separately delimited blocks. It does not define the family-wide diisocyanate, macrodiol, chain extender, block lengths, sequence, hard/soft ratio, or morphology.',
    items: [blockArchitecture(
      'tpu-ptmeg-mdi-ptmeg-connected-architecture',
      'Connected PTMEG–MDI–PTMEG architecture',
      '[*]OCCCCOC(=O)Nc1ccc(Cc2ccc(NC(=O)OCCCCO[*])cc2)cc1',
      [6, 13, 6],
      'Connected PTMEG x soft segment, MDI y urethane-rich segment, and PTMEG z soft segment',
      'Schematic once-through PTMEG_x–MDI_y–PTMEG_z TPU architecture; the subscripts are independent block lengths, and other diisocyanates, chain extenders, and soft segments are not shown.'
    )]
  },
  'wop-000174': {
    reviewStatus: 'reviewed',
    sourceIds: ['tpc-dmt-bdo-ptmg-jp2000290483'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing shows one PBT-derived polyester hard interval joined to a PTMEG-derived polyether soft interval. It is a schematic TPC architecture, not a claim about block lengths, hard/soft ratio, alternative polyester or polyether chemistry, blend content, or morphology.',
    items: [{
      key: 'tpc-pbt-ptmeg-connected-architecture',
      label: 'Connected PBT–PTMEG architecture',
      smiles: '[*]OCCCCOC(=O)c1ccc(C(=O)OCCCCOCCCCO[*])cc1',
      polymerSgroup: {
        connect: 'HT',
        blockBackboneCounts: [12, 11],
        blockLabels: ['x', 'y'],
        linearizeBackbone: true
      },
      fidelity: 'schematic',
      altText: 'Connected PBT x polyester segment with a terephthalate ester and PTMEG y polyether segment',
      caption: 'Schematic once-through PBT_x–PTMEG_y copolyester architecture; independent block lengths and broader TPC chemistry are not specified.'
    }]
  },
  'wop-000186': {
    reviewStatus: 'reviewed',
    sourceIds: ['elastane-dupont-5362432'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing shows one segmented polyurethane–urea elastane architecture with MDI/urea-bearing hard ends around a PTMEG-derived soft interval. Other diisocyanates, diamines, soft segments, block lengths, sequence, ratio, and fiber morphology are not fixed.',
    items: [blockArchitecture(
      'elastane-mdi-urea-ptmeg-connected-architecture',
      'Connected hard–soft–hard elastane segment',
      '[*]NC(=O)Nc1ccc(Cc2ccc(NC(=O)OCCCCOC(=O)Nc3ccc(Cc4ccc(NC(=O)N[*])cc4)cc3)cc2)cc1',
      [14, 6, 14],
      'Connected MDI urea-bearing hard x segment, PTMEG y soft interval, and MDI urea-bearing hard z segment',
      'Schematic once-through hard_x–PTMEG_y–hard_z polyurethane–urea elastane segment; subscripts are independent segment lengths and outer continuations lead to unspecified chain-extension chemistry.'
    )]
  },
  'wop-000195': {
    reviewStatus: 'reviewed',
    sourceIds: ['ioelovich-alkali-cellulose-etherification-study'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl or methyl ether at each site. Degree and site distribution of substitution, sequence, and chain length remain grade dependent.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Variable-methylation Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups at hydroxyl substitution sites',
      'Representative methylcellulose Markush motif; each site is independently bounded by the notation, so no uniform substitution pattern is implied.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H or methyl [CH₃].'
      }
    )]
  },
  'wop-000196': {
    reviewStatus: 'reviewed',
    sourceIds: ['ethyl-cellulose-hercules-gb778732a'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl or ethyl ether at each site. Degree and site distribution of substitution, sequence, and chain length remain grade dependent.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Variable-ethylation Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups at hydroxyl substitution sites',
      'Representative ethylcellulose Markush motif; each site is independently bounded by the notation, so no uniform substitution pattern is implied.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H or ethyl [CH₂CH₃].'
      }
    )]
  },
  'wop-000197': {
    reviewStatus: 'reviewed',
    sourceIds: ['hec-dow-4084060'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl or hydroxyethyl-derived substitution. Hydroxyethyl addition can extend from a substituted side chain, so molar substitution, side-chain length, site distribution, sequence, and chain length remain variable.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Hydroxyethyl-substitution Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups at hydroxyl substitution sites',
      'Representative hydroxyethylcellulose Markush motif; the notation bounds each site without fixing substitution amount or side-chain length.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H or –CH₂CH₂[–O–CH₂CH₂]ₘ–OH (m ≥ 0).'
      }
    )]
  },
  'wop-000198': {
    reviewStatus: 'reviewed',
    sourceIds: ['hpc-shinetsu-4292426'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl or hydroxypropyl-derived substitution. Propylene-oxide addition can extend from a substituted side chain, so molar substitution, side-chain length, site distribution, sequence, and chain length remain variable.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Hydroxypropyl-substitution Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups at hydroxyl substitution sites',
      'Representative hydroxypropylcellulose Markush motif; the notation bounds each site without fixing substitution amount, side-chain length, or local configuration.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H or a hydroxypropyl-derived cellulose-ether substituent. Additional oxypropyl units may occur, and local side-chain regiochemistry and configuration are unassigned.'
      }
    )]
  },
  'wop-000199': {
    reviewStatus: 'reviewed',
    sourceIds: ['hpmc-dow-3839319'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The unbracketed β-1,4-glucan fragment labels the C2, C3, and C6 oxygen substituents as R², R³, and R⁶ to represent residual hydroxyl, methyl ether, or hydroxypropyl-derived substitution. Methyl and hydroxypropyl substitution levels and sites vary independently, and hydroxypropyl side-chain extension can occur; no uniform repeat or sequence is implied.',
    items: [unbracketedChain(
      'cellulose-trisubstitution-markush-motif',
      'Mixed-substitution Markush motif',
      '[*]O[C@@H]1O[C@H](CO[*:1])[C@@H]([*])[C@H](O[*:2])[C@H]1O[*:3]',
      'representative',
      'Open beta-1,4-glucan residue with position-labelled R-two, R-three, and R-six groups representing hydroxyl, methyl, or hydroxypropyl-derived substitution',
      'Representative HPMC Markush motif; each site is independently bounded by the notation, so methyl/hydroxypropyl amounts and positions remain variable.',
      {
        markushLabels: { 1: 'R6', 2: 'R2', 3: 'R3' },
        notation: 'R², R³, and R⁶ are the cellulose C2, C3, and C6 oxygen substituents, respectively; each independently = H, methyl [CH₃], or a hydroxypropyl-derived cellulose-ether substituent. Additional oxypropyl units may occur, and local side-chain regiochemistry and configuration are unassigned.'
      }
    )]
  },
  'wop-000213': {
    reviewStatus: 'reviewed',
    sourceIds: ['jiang-pha-r-3-hydroxyalkanoate-structures-2016'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The stereochemical Markush unit retains the source-supported (R)-configured 3-hydroxyalkanoate polyester scaffold while using R for the variable side chain. It fixes the source’s x = 1 case and does not assign one side chain, comonomer sequence or fraction, molecular mass, chain ends, or x = 2–3 hydroxyalkanoate architectures.',
    items: [{
      key: 'poly-r-3-hydroxyalkanoate-markush-unit',
      label: '(R)-3-hydroxyalkanoate Markush unit',
      molfilePath: './curated-structures/poly-r-3-hydroxyalkanoate-markush-unit.mol',
      notation: 'R = the variable side-chain substituent in this x = 1, 3-hydroxyalkanoate motif. The cited source bounds R at up to 18 carbon atoms and explicitly gives methyl [CH₃] for P3HB and ethyl [C₂H₅] for P3HV; x = 2–3 units are not shown.',
      fidelity: 'representative',
      altText: 'Chiral 3-hydroxyalkanoate polyester unit bearing a generic R side chain',
      caption: 'Representative (R)-configured 3-hydroxyalkanoate Markush unit; parenthesized (R) in the name denotes stereochemistry, while the drawn R label denotes the bounded side-chain variable and does not imply a sequence or composition.'
    }]
  },
  'wop-000236': {
    reviewStatus: 'reviewed',
    sourceIds: ['luxenhofer-polyoxazoline-therapeutics-review'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The Markush unit keeps the poly(2-oxazoline) polyethyleneimine-like backbone and tertiary-amide linkage invariant while leaving the monomer-derived 2-substituent as R. It does not specify side-chain distribution, end groups, blocks, ionization, or functional modification.',
    items: [{
      key: 'poly-2-oxazoline-markush-unit',
      label: 'Poly(2-oxazoline) Markush unit',
      molfilePath: './curated-structures/poly-2-oxazoline-markush-unit.mol',
      notation: 'R = the monomer-derived 2-substituent. The cited introduction names methyl, ethyl, and phenyl examples and notes broader side-chain chemistry; the drawing does not enumerate functional substituents or claim that all variants are equivalent.',
      fidelity: 'representative',
      altText: 'Poly(2-oxazoline) tertiary-amide chain unit bearing a generic carbonyl-linked R substituent',
      caption: 'Representative poly(2-oxazoline) family Markush unit; R distinguishes side-chain variants without implying a mixture or block sequence.'
    }]
  },
  'wop-000256': {
    reviewStatus: 'reviewed',
    sourceIds: ['mladenovic-polysiloxane-pdms-structure-2024'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The Markush repeat expresses the general polysiloxane backbone as –O–Si(R¹)(R²)– while distinguishing its two source-bounded, independently variable silicon-bound sites. It does not assert that every allowed pair occurs, or select one silicone subclass, substituent distribution, chain architecture, end group, branching, or network topology.',
    items: [{
      key: 'organosiloxane-r2sio-markush-sru',
      label: 'General organosiloxane Markush repeat',
      molfilePath: './curated-structures/organosiloxane-r2sio-markush-sru.mol',
      notation: 'R¹ and R² identify independently variable Si-bound sites and may be the same or different. The cited review lists methyl, ethyl, propyl, phenyl, fluoroalkyl, aminoalkyl, hydroxy, mercapto, hydrogen, and vinyl as usual substituents; it does not establish every possible pair.',
      fidelity: 'representative',
      altText: 'General polysiloxane repeat with independently numbered R-one and R-two substituent sites on silicon',
      caption: 'Representative –O–Si(R¹)(R²)– polysiloxane family repeat; the numbered sites may carry identical or different allowed substituents and do not imply one subclass, composition, or network.'
    }]
  },
  'wop-000097': {
    reviewStatus: 'reviewed',
    sourceIds: ['gorham-para-xylylene-vapour-polymerization-1967'],
    representationType: 'family_representative_set',
    scopeNote: 'The unsubstituted poly(p-xylylene) unit is one exact member used to represent the broader parylene family. Chlorinated and other substituted parylenes have distinct repeat constitutions; the drawing also omits chain ends, molecular mass, deposition defects, and film morphology.',
    items: [{
      key: 'poly-para-xylylene-sru',
      label: 'Unsubstituted p-xylylene unit',
      smiles: '[*]Cc1ccc(C[*])cc1',
      fidelity: 'representative',
      altText: 'Poly(p-xylylene) repeat containing a para-phenylene ring between two methylene groups',
      caption: 'Exact constitutional unit of unsubstituted PPX, shown as one representative parylene-family member; substituted parylenes require distinct structures.'
    }]
  },
  'wop-000111': {
    reviewStatus: 'reviewed',
    sourceIds: ['pf-nist-resole-novolac-network-reference-2003'],
    representationType: 'family_representative_set',
    scopeNote: 'Phenol–formaldehyde resins include novolac and resole precursors and formulation-dependent cured networks. The unbracketed motifs identify methylene-linked and hydroxymethyl-bearing phenolic environments without turning either variable fragment into a repeat unit or fixing substitution positions, bridge distribution, formaldehyde ratio, or cure topology.',
    items: [
      unbracketedChain(
        'novolac-phenolic-network-motif',
        'Novolac-type phenolic motif',
        '[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1',
        'schematic',
        'Open motif with two hydroxyl-bearing phenyl rings joined by a methylene bridge and phenolic-chain continuations',
        'Schematic unbracketed methylene-bridged novolac motif; ortho/para substitution, oligomer sequence, and later cure junctions vary.'
      ),
      unbracketedChain(
        'resole-phenolic-network-motif',
        'Resole-type phenolic motif',
        '[*]Cc1cc(CO)c(O)c(C[*])c1',
        'schematic',
        'Open hydroxymethyl-bearing phenol motif with two methylene continuations',
        'Schematic unbracketed resole motif showing methylol functionality and possible methylene continuations without fixing cure topology.'
      )
    ]
  },
  'wop-000112': {
    reviewStatus: 'reviewed',
    sourceIds: ['novolac-nist-methylene-linkages-2003'],
    representationType: 'macromolecular_motif',
    scopeNote: 'Novolac resins contain methylene-linked phenolic oligomers and commonly require a curing agent to form a network. The unbracketed open motif represents precursor-chain chemistry without falsely declaring a uniform repeat, curing-agent-derived junction, fixed ortho/para substitution, oligomer sequence, or crosslink density.',
    items: [unbracketedChain(
      'novolac-phenolic-network-motif',
      'Methylene-linked novolac motif',
      '[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1',
      'schematic',
      'Open methylene-linked hydroxyl-bearing phenolic motif with two precursor-chain continuations',
      'Schematic unbracketed novolac precursor motif; curing-agent-derived junctions, positional isomers, and oligomer sequence are omitted.'
    )]
  },
  'wop-000113': {
    reviewStatus: 'reviewed',
    sourceIds: ['resole-phenolic-resin-status-review-2019'],
    representationType: 'network_fragment',
    scopeNote: 'Resoles contain hydroxymethylated phenols that self-condense through several methylene and ether linkage types. The unbracketed fragment shows one hydroxymethyl-bearing phenolic environment with open continuations, not a finite precursor molecule, a uniform repeat, or a unique cured-network junction.',
    items: [unbracketedChain(
      'resole-phenolic-network-motif',
      'Hydroxymethyl phenolic motif',
      '[*]Cc1cc(CO)c(O)c(C[*])c1',
      'schematic',
      'Open hydroxymethyl-bearing phenol motif with two methylene network continuations',
      'Schematic unbracketed resole motif; methylol count, ortho/para substitution, ether bridges, and cure conversion vary.'
    )]
  },
  'wop-000115': {
    reviewStatus: 'reviewed',
    sourceIds: ['rf-gel-process-optimization-2018'],
    representationType: 'network_fragment',
    scopeNote: 'Resorcinol–formaldehyde resins form branched methylene- and ether-linked networks whose connectivity depends on monomer ratio, pH, cure, and gel conditions. The unbracketed fragment shows one representative resorcinol environment with open methylene continuations, not a uniform network repeat.',
    items: [unbracketedChain(
      'resorcinol-formaldehyde-network-motif',
      'Resorcinol junction motif',
      '[*]Cc1c(O)cc(O)c(C[*])c1',
      'schematic',
      'Open meta-dihydroxyphenyl resorcinol motif with two methylene network continuations',
      'Schematic unbracketed resorcinol–formaldehyde motif; substitution sites, bridge types, crosslinking, and porosity are not fixed.'
    )]
  },
  'wop-000116': {
    reviewStatus: 'reviewed',
    sourceIds: ['novolac-nist-methylene-linkages-2003', 'rf-prostredny-network-mechanism-2018', 'prf-resin-4373062'],
    representationType: 'family_representative_set',
    scopeNote: 'PRF is a co-condensed network containing phenol- and resorcinol-derived aromatic sites connected by a distribution of formaldehyde-derived bridges. The two unbracketed motifs identify both site chemistries without implying separate components, uniform repeats, sequence, ratio, bridge placement, or crosslink density.',
    items: [
      unbracketedChain(
        'novolac-phenolic-network-motif',
        'Phenol-derived motif',
        '[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1',
        'schematic',
        'Open methylene-linked phenolic motif representing phenol-derived PRF sites',
        'Schematic unbracketed phenol-derived condensation motif; it is not a separate component, fixed block, or uniform repeat.'
      ),
      unbracketedChain(
        'resorcinol-formaldehyde-network-motif',
        'Resorcinol-derived motif',
        '[*]Cc1c(O)cc(O)c(C[*])c1',
        'schematic',
        'Open meta-dihydroxyphenyl motif representing resorcinol-derived PRF sites',
        'Schematic unbracketed resorcinol-derived motif; co-condensation sequence, bridge types, and site ratio are unspecified.'
      )
    ]
  },
  'wop-000120': {
    reviewStatus: 'reviewed',
    sourceIds: ['puf-eco-friendly-resorcinol-plywood-processing'],
    representationType: 'family_representative_set',
    scopeNote: 'PUF is a co-condensed network containing phenolic and urea-derived sites connected by a distribution of formaldehyde-derived bridges. The phenolic motif is left unbracketed and the set does not assign uniform repeats, phenol/urea ratio, sequence, bridge placement, or cure conversion.',
    items: [
      unbracketedChain(
        'novolac-phenolic-network-motif',
        'Phenol-derived motif',
        '[*]Cc1ccc(O)c(Cc2ccc(O)c(C[*])c2)c1',
        'schematic',
        'Open methylene-linked phenolic motif representing phenol-derived PUF sites',
        'Schematic unbracketed phenol-derived condensation motif; it is not a fixed block, separate component, or uniform repeat.'
      ),
      {
        key: 'urea-formaldehyde-network-junction',
        label: 'Urea-derived junction',
        smiles: '[*]CN(C(=O)NC[*])C[*]',
        fidelity: 'schematic',
        altText: 'Urea carbonyl with nitrogen-bound methylene network continuations',
        caption: 'Schematic urea-derived site; bridge types and co-condensation sequence vary.'
      }
    ]
  },
  'wop-000129': {
    reviewStatus: 'reviewed',
    sourceIds: ['polybenzoxazine-cationic-us6225440'],
    representationType: 'network_fragment',
    scopeNote: 'Benzoxazine ring opening yields phenolic Mannich-bridge networks whose aromatic, amine-derived, and multifunctional monomer residues vary. The unbracketed open motif illustrates one aniline-derived aminomethylene environment without declaring a uniform repeat, universal monomer, or fixed crosslink topology.',
    items: [unbracketedChain(
      'polybenzoxazine-mannich-network-motif',
      'N-phenyl Mannich-bridge motif',
      '[*]CN(c1ccccc1)Cc1ccc(O)c(CN(c2ccccc2)C[*])c1',
      'schematic',
      'Open hydroxyl-bearing aromatic motif with N-phenyl aminomethylene Mannich connections',
      'Schematic unbracketed N-phenyl ring-opened benzoxazine motif aligned with the cited aniline-derived chemistry; aromatic core, functionality, and network branching vary.'
    )]
  },
  'wop-000175': {
    reviewStatus: 'reviewed',
    sourceIds: ['peba-carboxyl-pa-polyether-us5310557'],
    representationType: 'block_or_graft_architecture',
    scopeNote: 'The connected drawing shows one PA12-derived polyamide interval joined through an ester linkage to a PTMEG-derived polyether interval. It is a representative PEBA architecture; other polyamide and polyether blocks, block lengths, end groups, sequence, composition, and morphology are not fixed.',
    items: [{
      key: 'peba-pa12-ptmeg-connected-architecture',
      label: 'Connected PA12–PTMEG architecture',
      smiles: '[*]NCCCCCCCCCCCC(=O)OCCCCO[*]',
      polymerSgroup: {
        connect: 'HT',
        blockBackboneCounts: [13, 6],
        blockLabels: ['x', 'y'],
        linearizeBackbone: true
      },
      fidelity: 'schematic',
      altText: 'Connected nylon-12 x polyamide segment and PTMEG y polyether segment joined by an ester linkage',
      caption: 'Schematic once-through PA12_x–PTMEG_y PEBA architecture; the subscripts are independent block lengths and broader PEBA block chemistry is not shown.'
    }]
  },
  'wop-000210': {
    reviewStatus: 'reviewed',
    sourceIds: ['lignin-fabbri-biomodified-platform-review-2023'],
    representationType: 'macromolecular_motif',
    scopeNote: 'The open motif shows one guaiacyl β-O-4 aryl-ether linkage with an explicit continuation from the acceptor guaiacyl unit into omitted lignin context. It is not a constitutional repeat: H/G/S composition, neighboring ether and carbon–carbon linkages, branching, condensation, end groups, and technical-isolation changes vary.',
    items: [unbracketedChain(
      'lignin-guaiacyl-beta-o-4-open-macromolecular-motif',
      'Open guaiacyl β-O-4 motif',
      'COc1cc(C(O)C(Oc2c(OC)cc([*])cc2)CO)ccc1O',
      'representative',
      'Open guaiacyl beta-O-4 lignin motif with an aryl ether at the beta carbon, alpha hydroxyl, gamma hydroxymethyl group, and one aromatic continuation bond',
      'Representative open guaiacyl β-O-4 lignin motif; the terminal bond indicates omitted phenylpropanoid context, not a regular repeat or a specified adjacent linkage.'
    )]
  },
  'wop-000251': {
    reviewStatus: 'reviewed',
    sourceIds: ['openstax-bisphenol-a-polycarbonate'],
    representationType: 'family_representative_set',
    scopeNote: 'The bisphenol-A polycarbonate unit is one exact repeat constitution used to represent the broader polycarbonate family. Aliphatic polycarbonates, alternative bisphenols, copolymers, chain ends, molecular mass, and formulations require different or additional structures.',
    items: [{
      key: 'bisphenol-a-polycarbonate-sru',
      label: 'Bisphenol-A polycarbonate unit',
      smiles: '[*]Oc1ccc(C(C)(C)c2ccc(OC(=O)[*])cc2)cc1',
      fidelity: 'representative',
      altText: 'Aromatic polycarbonate repeat containing a bisphenol-A residue and carbonate linkage',
      caption: 'Exact BPA-PC constitutional unit shown as one representative polycarbonate-family member; other backbone chemistries are outside this drawing.'
    }]
  },
  'wop-000107': {
    reviewStatus: 'reviewed',
    sourceIds: ['dcpd-upr-perrot-2021'],
    representationType: 'no_unique_repeat',
    scopeNote: 'DCPD-modified UPR is a composition- and process-defined resin in which dicyclopentadiene can enter an unsaturated polyester through more than one addition, end-capping, or incorporation pathway before formulation-dependent radical cure. The source does not establish one bounded DCPD-derived repeat or cured-network fragment; the DCPD feedstock is shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'Dicyclopentadiene is the finite source-defined modifier charged before maleate-adduct formation and polyester polycondensation. Its constitution identifies the feed chemistry only; commercial isomer/purity details, the DCPD–maleate adduct connectivity, prepolymer sequence, and cured network are not asserted.',
        items: [{
          key: 'dicyclopentadiene-feedstock',
          label: 'Dicyclopentadiene feedstock',
          smiles: 'C1C=CC2C1C3CC2C=C3',
          fidelity: 'representative',
          altText: 'Dicyclopentadiene molecule containing norbornene-like and cyclopentene double bonds in a fused bridged-ring skeleton',
          caption: 'Representative DCPD synthesis feedstock constitution; endo/exo stereochemistry, feed purity, maleate-adduct connectivity, and the final resin network are not assigned.'
        }]
      }
    }
  },
  'wop-000130': {
    reviewStatus: 'reviewed',
    sourceIds: ['phthalonitrile-sheng-cure-products-2020'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Phthalonitrile cure produces heterogeneous aromatic networks containing catalyst- and condition-dependent triazine, isoindole, phthalocyanine, and other nitrile-derived structures. No one bounded connectivity represents the cured family; a finite source-defined aminophenoxyphthalonitrile cure promoter is shown in the processing tab.',
    items: [],
    contextualStructures: {
      processing: {
        sourceIds: ['phthalonitrile-sheng-cure-products-2020'],
        scopeNote: 'The cited 4-(4-aminophenoxy)phthalonitrile molecule participates in and promotes phthalonitrile cure. It is shown as finite processing chemistry, not as a repeat unit or a complete representation of the catalyst-dependent cured network.',
        items: [{
          key: 'four-aminophenoxy-phthalonitrile-cure-promoter',
          label: '4-(4-Aminophenoxy)phthalonitrile cure promoter',
          smiles: 'Nc1ccc(Oc2ccc(C#N)c(C#N)c2)cc1',
          fidelity: 'exact',
          altText: 'Aminophenoxyphthalonitrile molecule with a para amino group and two adjacent nitrile groups',
          caption: 'Exact 4-APN cure-promoter constitution from the cited study; its reactions generate several possible network structures rather than one repeat.'
        }]
      }
    }
  },
  'wop-000233': {
    reviewStatus: 'reviewed',
    sourceIds: ['high-purity-sodium-styrenesulfonate-polymer-patent-2016'],
    representationType: 'constitutional_repeat_unit',
    scopeNote: 'The drawing shows a styrene-derived repeat bearing para-sulfonate with an explicit sodium counterion. It omits tacticity, chain ends, molecular mass, counterion exchange, hydration, crosslinking, and complexes with other polymers.',
    items: [{
      key: 'sodium-polystyrenesulfonate-unit',
      label: 'Sodium 4-styrenesulfonate unit',
      molfilePath: './curated-structures/sodium-polystyrenesulfonate-unit.mol',
      fidelity: 'representative',
      altText: 'Polystyrene repeat bearing a para-sulfonate anion with a separate sodium counterion outside the repeat bracket',
      caption: 'Representative PNaSS constitutional unit with explicit sodium outside the SRU bracket; backbone stereochemistry and hydration are not shown.'
    }]
  },
  'wop-000235': {
    reviewStatus: 'reviewed',
    sourceIds: ['speek-sulfonation-workup-yee-2013'],
    representationType: 'variable_substitution_motif',
    scopeNote: 'The set shows an unsubstituted PEEK repeat and one ring-sulfonated PEEK motif. Degree and site distribution of sulfonation, acid/salt form, sequence, molecular mass, hydration, and membrane morphology vary; no unique SPEEK repeat is implied.',
    items: [{
      key: 'polyether-ether-ketone-sru',
      label: 'Unsubstituted PEEK unit',
      smiles: '[*]Oc1ccc(Oc2ccc(C(=O)c3ccc([*])cc3)cc2)cc1',
      fidelity: 'representative',
      altText: 'Aromatic polyether ether ketone repeat segment with ether and ketone linkages',
      caption: 'Unsubstituted PEEK backbone motif retained within partially sulfonated material.'
    }, {
      key: 'sulfonated-peek-motif',
      label: 'Sulfonated PEEK motif',
      molfilePath: './curated-structures/sulfonated-peek-motif.mol',
      fidelity: 'representative',
      altText: 'Polyether ether ketone backbone segment bearing one sulfonic acid group with clear separation from the repeat bracket',
      caption: 'One illustrative ring-sulfonated motif; degree and site distribution of sulfonation are not fixed.'
    }]
  },
  'wop-000133': {
    reviewStatus: 'reviewed',
    sourceIds: ['tspi-zhang-phenylethynyl-oligomer-synthesis-2022'],
    representationType: 'no_unique_repeat',
    scopeNote: 'Thermosetting polyimides span different dianhydrides, diamines, reactive end caps, oligomer lengths, blend components, imidization states, and cure networks. The cited phenylethynyl-ended system does not establish one family-wide repeat or bounded cured fragment; its finite PEPE end-capper is shown in the synthesis tab.',
    items: [],
    contextualStructures: {
      feedstocksAndSynthesis: {
        scopeNote: 'The source forms monoethyl 4-phenylethynylphthalate (PEPE) from the corresponding anhydride and ethanol, then uses it to end-cap poly(amic ester) oligomers. The finite reagent identifies phenylethynyl end-cap chemistry, not the variable oligomer backbone or cured polyimide network.',
        items: [{
          key: 'monoethyl-four-phenylethynylphthalate-endcapper',
          label: 'PEPE phenylethynyl end-capper',
          smiles: 'CCOC(=O)c1cc(C#Cc2ccccc2)ccc1C(=O)O',
          fidelity: 'exact',
          altText: 'Monoethyl 4-phenylethynylphthalate molecule bearing adjacent carboxylic acid and ethyl ester groups',
          caption: 'Exact PEPE synthesis reagent constitution shown in the cited reaction scheme; poly(amic ester) composition, imidization, and phenylethynyl cure products are not depicted.'
        }]
      }
    }
  }
};
