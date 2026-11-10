// Curated migration scaffolding for wop-000132 through wop-000262.
// SMILES are converted to reviewed, coordinate-bearing V3000 records by the
// migration tooling; they are never published as canonical structure data.

const item = (key, label, smiles, fidelity, altText, caption) => ({
  key,
  label,
  smiles,
  fidelity,
  altText,
  caption
});

const rawStructureSpecsB = {
  "wop-000132": {
    representationType: "network_fragment",
    scopeNote: "The drawing is a schematic diallyl-phthalate-derived junction with open continuation points. It does not define conversion, residual allyl content, network topology, or a unique cured repeat unit.",
    items: [item("pdap-network-fragment", "Diallyl-phthalate-derived junction", "[*]CC(COC(=O)c1ccccc1C(=O)OCC([*])C[*])[*]", "schematic", "Diallyl-phthalate-derived network fragment with four open continuation bonds", "Schematic network fragment illustrating a phthalate diester between allyl-derived carbon chains; cure conversion and junction distribution are not specified.")]
  },
  "wop-000133": {
    representationType: "no_unique_repeat",
    scopeNote: "Thermosetting polyimide covers chemically distinct imide oligomers, reactive end caps, and addition-cured networks. The cited family scope does not select one backbone/end-cap pair or one cured junction that could be drawn as a unique repeat unit.",
    items: []
  },
  "wop-000134": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the cis-1,4-polyisoprene chain constitution that dominates natural rubber. It omits chain ends, non-rubber constituents, naturally occurring branching or network features, and source-dependent minor microstructures.",
    items: [item("cis-1-4-polyisoprene-unit", "cis-1,4-polyisoprene unit", "[*]C/C(=C\\C[*])/C", "representative", "Cis-1,4-polyisoprene repeat segment with a methyl-substituted carbon-carbon double bond", "Representative cis-1,4-isoprene-derived segment; natural-rubber non-polyisoprene constituents and network features are not shown.")]
  },
  "wop-000135": {
    representationType: "stereochemical_repeat_segment",
    scopeNote: "The segment encodes the high-cis 1,4 microstructure of the synthetic polymer. It does not claim perfect cis content, a particular catalyst, molecular mass, end group, or vulcanized network.",
    items: [item("cis-1-4-polyisoprene-unit", "cis-1,4-polyisoprene unit", "[*]C/C(=C\\C[*])/C", "representative", "Cis-1,4-polyisoprene repeat segment with a methyl-substituted carbon-carbon double bond", "Representative high-cis 1,4 segment; grade-dependent microstructural defects and chain ends are omitted.")]
  },
  "wop-000136": {
    representationType: "stereochemical_repeat_segment",
    scopeNote: "The segment encodes the high-trans 1,4 microstructure. It does not claim perfect trans content, a particular molecular mass, end group, crystallite, or cured network.",
    items: [item("trans-1-4-polyisoprene-unit", "trans-1,4-polyisoprene unit", "[*]C/C(=C/C[*])/C", "representative", "Trans-1,4-polyisoprene repeat segment with a methyl-substituted carbon-carbon double bond", "Representative high-trans 1,4 segment; microstructural defects, chain ends, and crystallite packing are not shown.")]
  },
  "wop-000137": {
    representationType: "family_representative_set",
    scopeNote: "Polybutadiene rubber can contain cis-1,4, trans-1,4, and 1,2-vinyl units in catalyst-dependent proportions. The drawings are possible microstructural units, not a sequence, ratio, or vulcanized network.",
    items: [
      item("cis-1-4-polybutadiene-unit", "cis-1,4 unit", "[*]C/C=C\\C[*]", "representative", "Cis-1,4-polybutadiene segment with an internal carbon-carbon double bond", "Representative cis-1,4 unit; its abundance is grade dependent."),
      item("trans-1-4-polybutadiene-unit", "trans-1,4 unit", "[*]C/C=C/C[*]", "representative", "Trans-1,4-polybutadiene segment with an internal carbon-carbon double bond", "Representative trans-1,4 unit; its abundance is grade dependent."),
      item("1-2-polybutadiene-unit", "1,2-vinyl unit", "[*]CC(C=C)[*]", "representative", "Polybutadiene 1,2-addition unit with a pendant vinyl group", "Representative 1,2-addition unit; tacticity and abundance are not specified.")
    ]
  },
  "wop-000138": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows styrene- and butadiene-derived units encountered across the SBR family. It does not assert sequence, styrene fraction, diene microstructure, functionalization, or cure state.",
    items: [
      item("polystyrene-unit", "Styrene-derived unit", "[*]CC(c1ccccc1)[*]", "representative", "Polystyrene repeat unit with a phenyl side group", "Styrene-derived unit shown without a claimed copolymer sequence or fraction."),
      item("polybutadiene-1-4-unspecified-unit", "Butadiene 1,4 unit", "[*]CC=CC[*]", "representative", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Representative 1,4-butadiene unit with unspecified cis/trans geometry; vinyl content also varies across SBR."),
      item("1-2-polybutadiene-unit", "Butadiene 1,2 unit", "[*]CC(C=C)[*]", "representative", "Polybutadiene 1,2-addition unit with a pendant vinyl group", "Representative 1,2-butadiene-derived unit; abundance is not specified.")
    ]
  },
  "wop-000139": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows styrene- and butadiene-derived units compatible with emulsion SBR. It does not encode the emulsion recipe, random sequence, comonomer ratio, diene microstructure distribution, branching, or vulcanization.",
    items: [
      item("polystyrene-unit", "Styrene-derived unit", "[*]CC(c1ccccc1)[*]", "representative", "Polystyrene repeat unit with a phenyl side group", "Styrene-derived unit; no sequence or fraction is implied."),
      item("polybutadiene-1-4-unspecified-unit", "Butadiene 1,4 unit", "[*]CC=CC[*]", "representative", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Representative 1,4-butadiene-derived unit with unspecified cis/trans geometry."),
      item("1-2-polybutadiene-unit", "Butadiene 1,2 unit", "[*]CC(C=C)[*]", "representative", "Polybutadiene 1,2-addition unit with a pendant vinyl group", "Representative 1,2-butadiene-derived unit; actual abundance varies.")
    ]
  },
  "wop-000140": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows the principal styrene- and butadiene-derived constitutional possibilities in solution SBR. It does not specify sequence, composition, cis/trans/vinyl distribution, chain-end functionalization, or cure state.",
    items: [
      item("polystyrene-unit", "Styrene-derived unit", "[*]CC(c1ccccc1)[*]", "representative", "Polystyrene repeat unit with a phenyl side group", "Styrene-derived unit; no sequence or fraction is implied."),
      item("cis-1-4-polybutadiene-unit", "cis-1,4-butadiene unit", "[*]C/C=C\\C[*]", "representative", "Cis-1,4-polybutadiene segment with an internal carbon-carbon double bond", "Possible cis-1,4 unit; its abundance depends on the solution-polymerization route."),
      item("trans-1-4-polybutadiene-unit", "trans-1,4-butadiene unit", "[*]C/C=C/C[*]", "representative", "Trans-1,4-polybutadiene segment with an internal carbon-carbon double bond", "Possible trans-1,4 unit; its abundance depends on the solution-polymerization route."),
      item("1-2-polybutadiene-unit", "1,2-vinyl unit", "[*]CC(C=C)[*]", "representative", "Polybutadiene 1,2-addition unit with a pendant vinyl group", "Possible 1,2 unit; its abundance and tacticity are not specified.")
    ]
  },
  "wop-000141": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows styrene, butadiene, and one common acid-comonomer-derived unit as representative XSBR constituents. It does not fix the acid identity, sequence, composition, neutralization, latex-particle structure, or vulcanized network.",
    items: [
      item("polystyrene-unit", "Styrene-derived unit", "[*]CC(c1ccccc1)[*]", "representative", "Polystyrene repeat unit with a phenyl side group", "Styrene-derived constituent without a claimed sequence or fraction."),
      item("polybutadiene-1-4-unspecified-unit", "Butadiene-derived unit", "[*]CC=CC[*]", "representative", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "One representative 1,4-butadiene-derived unit with unspecified cis/trans geometry; diene microstructure varies."),
      item("polyacrylic-acid-unit", "Acid-comonomer-derived unit", "[*]CC(C(=O)O)[*]", "representative", "Vinyl-chain unit bearing a carboxylic acid side group", "Acrylic-acid-derived unit illustrates carboxyl functionality; XSBR grades may use other acid comonomers and contents.")
    ]
  },
  "wop-000142": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows acrylonitrile- and butadiene-derived units found in NBR. It does not define acrylonitrile content, sequence, cis/trans/vinyl microstructure, branching, or a cured formulation.",
    items: [
      item("polyacrylonitrile-unit", "Acrylonitrile-derived unit", "[*]CC(C#N)[*]", "representative", "Polyacrylonitrile repeat unit with a nitrile side group", "Acrylonitrile-derived constituent; its fraction is grade dependent."),
      item("polybutadiene-1-4-unspecified-unit", "Butadiene 1,4 unit", "[*]CC=CC[*]", "representative", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Representative 1,4-butadiene-derived unit with unspecified cis/trans geometry."),
      item("1-2-polybutadiene-unit", "Butadiene 1,2 unit", "[*]CC(C=C)[*]", "representative", "Polybutadiene 1,2-addition unit with a pendant vinyl group", "Representative 1,2-butadiene-derived unit; abundance is not specified.")
    ]
  },
  "wop-000143": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set illustrates the nitrile-bearing unit, the saturated unit produced by hydrogenating 1,4-butadiene segments, and a possible residual unsaturated unit. It does not specify composition, hydrogenation conversion, sequence, or vulcanization.",
    items: [
      item("polyacrylonitrile-unit", "Acrylonitrile-derived unit", "[*]CC(C#N)[*]", "representative", "Polyacrylonitrile repeat unit with a nitrile side group", "Nitrile-bearing constituent retained during hydrogenation; its fraction varies."),
      item("polyethylene-unit", "Hydrogenated diene segment", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Saturated backbone segment representing extensively hydrogenated 1,4-butadiene-derived connectivity."),
      item("polybutadiene-1-4-unspecified-unit", "Residual unsaturated unit", "[*]CC=CC[*]", "schematic", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Possible residual 1,4 unsaturation with unspecified cis/trans geometry; its abundance is not fixed here.")
    ]
  },
  "wop-000144": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows acrylonitrile, butadiene, and a representative carboxyl-bearing unit in XNBR. Acid identity, unit fractions, diene microstructure, sequence, neutralization, and crosslinking remain grade or formulation variables.",
    items: [
      item("polyacrylonitrile-unit", "Acrylonitrile-derived unit", "[*]CC(C#N)[*]", "representative", "Polyacrylonitrile repeat unit with a nitrile side group", "Acrylonitrile-derived constituent; its fraction varies."),
      item("polybutadiene-1-4-unspecified-unit", "Butadiene-derived unit", "[*]CC=CC[*]", "representative", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Representative 1,4-diene microstructure with unspecified cis/trans geometry; vinyl content also varies."),
      item("polymethacrylic-acid-sru", "Carboxyl-bearing unit", "[*]CC(C)(C(=O)O)[*]", "representative", "Methacrylic-acid-derived chain unit bearing methyl and carboxylic acid substituents", "Methacrylic-acid-derived unit from the cited XNBR lineage illustrates carboxyl functionality without fixing the acid-comonomer identity or content of every grade.")
    ]
  },
  "wop-000145": {
    representationType: "copolymer_unit_set",
    scopeNote: "The two drawings are the isobutylene-rich saturated unit and a representative unsaturated isoprene-derived unit. Their order and ratio, detailed isoprene microstructure, chain ends, and vulcanized network are not specified.",
    items: [
      item("polyisobutylene-unit", "Isobutylene-derived unit", "[*]CC(C)(C)[*]", "representative", "Polyisobutylene repeat unit with two methyl substituents", "Dominant isobutylene-derived unit in butyl rubber."),
      item("polyisoprene-1-4-unspecified-unit", "Unsaturated isoprene-derived unit", "[*]CC(C)=CC[*]", "schematic", "Isoprene-derived 1,4 chain segment with unspecified carbon-carbon double-bond geometry", "Representative low-abundance 1,4-isoprene-derived unit with unspecified cis/trans geometry; detailed IIR microstructure and sequence are not fixed.")
    ]
  },
  "wop-000146": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set shows the isobutylene-rich backbone and the exo-methylene allylic-bromide motif that is the principal ambient-temperature halobutyl microstructure. It does not assign the bromine content, minor endo-bromomethyl or diene isomers, sequence, or cure network.",
    items: [
      item("polyisobutylene-unit", "Isobutylene-derived unit", "[*]CC(C)(C)[*]", "representative", "Polyisobutylene repeat unit with two methyl substituents", "Isobutylene-rich backbone unit retained from IIR."),
      item("bromobutyl-exomethylene-motif", "Exo-methylene allylic bromide motif", "[*]CC(=C)C(Br)C[*]", "representative", "Bromobutyl chain segment with an exo-methylene group and secondary allylic bromide", "Representative dominant exo-methylene allylic-bromide microstructure at ambient temperature; minor endo and diene isomers are omitted.")
    ]
  },
  "wop-000147": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set shows the isobutylene-rich backbone and the exo-methylene allylic-chloride motif that is the principal halobutyl microstructure. It does not assign the chlorine content, minor endo-chloromethyl or diene isomers, sequence, or cure network.",
    items: [
      item("polyisobutylene-unit", "Isobutylene-derived unit", "[*]CC(C)(C)[*]", "representative", "Polyisobutylene repeat unit with two methyl substituents", "Isobutylene-rich backbone unit retained from IIR."),
      item("chlorobutyl-exomethylene-motif", "Exo-methylene allylic chloride motif", "[*]CC(=C)C(Cl)C[*]", "representative", "Chlorobutyl chain segment with an exo-methylene group and secondary allylic chloride", "Representative dominant exo-methylene allylic-chloride microstructure; minor endo and diene isomers are omitted.")
    ]
  },
  "wop-000148": {
    representationType: "stereochemical_repeat_segment",
    scopeNote: "The drawing shows the ideal (2Z)-2-chlorobut-2-ene-1,4-diyl unit used to define poly(chloroprene). It does not assign the abundance of this unit in a grade, minor addition modes, crystallinity, branching, or cure network.",
    items: [item("polychloroprene-z-1-4-sru", "(2Z)-1,4-chloroprene unit", "[*]C/C=C(\\Cl)C[*]", "exact", "Polychloroprene repeat segment with Z geometry at the chlorine-substituted carbon-carbon double bond", "Exact ideal (2Z)-1,4-chloroprene constitutional unit; minor microstructures and the cured state are omitted.")]
  },
  "wop-000149": {
    representationType: "copolymer_unit_set",
    scopeNote: "The drawings show ethylene- and propylene-derived units in binary EPM. They do not assert sequence, composition, propylene stereochemistry, branching, molecular mass, or cure state.",
    items: [
      item("polyethylene-unit", "Ethylene-derived unit", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Ethylene-derived constituent; no fraction or sequence is implied."),
      item("polypropylene-unspecified-unit", "Propylene-derived unit", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Propylene-derived constituent with unspecified stereochemistry and sequence.")
    ]
  },
  "wop-000150": {
    representationType: "copolymer_unit_set",
    scopeNote: "The drawings show ethylene, propylene, and one representative ENB-derived cure-site motif. EPDM grades may use different dienes and compositions; sequence, diene content, stereochemistry, and the cured network are not specified.",
    items: [
      item("polyethylene-unit", "Ethylene-derived unit", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Ethylene-derived constituent; no fraction or sequence is implied."),
      item("polypropylene-unspecified-unit", "Propylene-derived unit", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Propylene-derived constituent with unspecified stereochemistry."),
      item("epdm-enb-cure-site-motif", "Representative diene cure-site motif", "[*]C1C2CC(=CC)C(C2)C1[*]", "schematic", "Polymer-incorporated ENB motif with saturated norbornane ring bonds, two open chain attachments, and a retained exocyclic ethylidene double bond", "Schematic ENB-derived cure-site motif showing incorporation through the endocyclic norbornene double bond and retention of the exocyclic ethylidene unsaturation; other EPDM diene identities and linkage isomers are not represented.")
    ]
  },
  "wop-000151": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates common alkyl-acrylate backbone units in acrylic rubber. It does not define alkyl-group distribution, cure-site comonomer, composition, sequence, or a vulcanized network.",
    items: [
      item("polyethyl-acrylate-unit", "Ethyl acrylate unit", "[*]CC(C(=O)OCC)[*]", "representative", "Polyethyl acrylate repeat unit with an ethyl ester side group", "Representative ethyl-acrylate-derived unit from the broader acrylic-rubber family."),
      item("polybutyl-acrylate-unit", "Butyl acrylate unit", "[*]CC(C(=O)OCCCC)[*]", "representative", "Polybutyl acrylate repeat unit with a butyl ester side group", "Representative butyl-acrylate-derived unit; no family-wide composition is implied.")
    ]
  },
  "wop-000152": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set illustrates ethylene and a representative alkyl-acrylate unit in AEM. It omits grade-dependent cure-site comonomers, exact acrylate identity and fraction, sequence, and the final vulcanized network.",
    items: [
      item("polyethylene-unit", "Ethylene-derived unit", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Ethylene-derived constituent; no sequence or fraction is implied."),
      item("polyethyl-acrylate-unit", "Alkyl-acrylate-derived unit", "[*]CC(C(=O)OCC)[*]", "representative", "Polyethyl acrylate repeat unit with an ethyl ester side group", "Ethyl acrylate is shown as a representative alkyl-acrylate unit; AEM grades can use other alkyl groups and cure-site units.")
    ]
  },
  "wop-000153": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ring-opened epichlorohydrin repeat constitution. It omits chain ends, defects, molecular mass, compounding ingredients, and the formulation-specific cured network.",
    items: [item("polyepichlorohydrin-unit", "Epichlorohydrin-derived unit", "[*]CC(CCl)O[*]", "exact", "Polyepichlorohydrin repeat unit with an ether linkage and chloromethyl side group", "Exact constitutional repeat unit of the ideal epichlorohydrin homopolymer; end groups and cure state are not shown.")]
  },
  "wop-000154": {
    representationType: "copolymer_unit_set",
    scopeNote: "The two drawings show the epichlorohydrin- and ethylene-oxide-derived ether units in ECO. They do not specify composition, sequence, chain ends, or the cured formulation.",
    items: [
      item("polyepichlorohydrin-unit", "Epichlorohydrin-derived unit", "[*]CC(CCl)O[*]", "representative", "Polyepichlorohydrin repeat unit with an ether linkage and chloromethyl side group", "Epichlorohydrin-derived copolyether unit; no sequence or fraction is implied."),
      item("polyethylene-oxide-unit", "Ethylene-oxide-derived unit", "[*]CCO[*]", "representative", "Polyethylene oxide repeat unit with a carbon-carbon-oxygen backbone", "Ethylene-oxide-derived copolyether unit; no sequence or fraction is implied.")
    ]
  },
  "wop-000155": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set illustrates unsubstituted and chlorinated ethylene-backbone motifs. Chlorine content, substitution pattern, starting-polyethylene branching, blockiness, and cure state vary among CPE elastomer grades.",
    items: [
      item("polyethylene-unit", "Unsubstituted ethylene motif", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Unchlorinated polyethylene-backbone motif retained in CPE."),
      item("polyvinyl-chloride-unit", "Chlorinated ethylene motif", "[*]CC(Cl)[*]", "representative", "Polyethylene chain unit bearing one chlorine substituent", "Representative chlorinated backbone motif; it does not specify chlorine fraction or placement.")
    ]
  },
  "wop-000156": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set illustrates chlorinated polyethylene backbone sites and one sulfonyl-chloride-bearing site. It does not fix chlorine or chlorosulfonyl content, substitution distribution, branching, or cure network.",
    items: [
      item("polyvinyl-chloride-unit", "Chlorinated backbone motif", "[*]CC(Cl)[*]", "representative", "Polyethylene chain unit bearing one chlorine substituent", "Representative chlorinated polyethylene motif; substitution fraction is not specified."),
      item("chlorosulfonated-polyethylene-unit", "Chlorosulfonyl-bearing motif", "[*]CC(S(=O)(=O)Cl)[*]", "representative", "Polyethylene chain unit bearing a sulfonyl chloride side group", "Representative chlorosulfonyl-bearing backbone motif; placement and abundance vary.")
    ]
  },
  "wop-000157": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates VDF-, HFP-, and TFE-derived units common in FKM architectures. It does not define a particular copolymer composition, sequence, cure-site monomer, chain end, or cured network.",
    items: [
      item("polyvinylidene-fluoride-unit", "VDF-derived unit", "[*]CC(F)(F)[*]", "representative", "Vinylidene fluoride repeat unit with one methylene and one difluoromethylene carbon", "Representative VDF-derived unit found in many FKM members."),
      item("hexafluoropropylene-unit", "HFP-derived unit", "[*]C(F)(F)C(F)(C(F)(F)F)[*]", "representative", "Hexafluoropropylene-derived chain unit with a trifluoromethyl side group", "Representative HFP-derived unit; no family-wide composition or sequence is implied."),
      item("polytetrafluoroethylene-unit", "TFE-derived unit", "[*]C(F)(F)C(F)(F)[*]", "representative", "Perfluorinated two-carbon tetrafluoroethylene repeat unit", "Representative TFE-derived unit present in some FKM architectures.")
    ]
  },
  "wop-000158": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates TFE and perfluoro(methyl vinyl ether) units used in representative perfluoroelastomer backbones. It does not define composition, sequence, cure-site identity, end groups, or the cured network.",
    items: [
      item("polytetrafluoroethylene-unit", "TFE-derived unit", "[*]C(F)(F)C(F)(F)[*]", "representative", "Perfluorinated two-carbon tetrafluoroethylene repeat unit", "Representative TFE-derived backbone unit."),
      item("perfluoromethyl-vinyl-ether-unit", "Perfluorovinyl-ether-derived unit", "[*]C(F)(F)C(F)(OC(F)(F)F)[*]", "representative", "Perfluorinated chain unit bearing a trifluoromethoxy substituent", "Representative perfluoro(methyl vinyl ether)-derived unit; FFKM compositions and cure sites vary.")
    ]
  },
  "wop-000159": {
    representationType: "copolymer_unit_set",
    scopeNote: "The drawings show TFE- and propylene-derived units in the FEPM backbone. They do not assert composition, sequence, propylene stereochemistry, cure-site content, brominated end groups, or vulcanization.",
    items: [
      item("polytetrafluoroethylene-unit", "TFE-derived unit", "[*]C(F)(F)C(F)(F)[*]", "representative", "Perfluorinated two-carbon tetrafluoroethylene repeat unit", "TFE-derived copolymer unit; no fraction or sequence is implied."),
      item("polypropylene-unspecified-unit", "Propylene-derived unit", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Propylene-derived copolymer unit with unspecified stereochemistry.")
    ]
  },
  "wop-000160": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal dimethylsiloxane unit as the common PDMS representative of silicone rubber. It does not represent every silicone elastomer substituent pattern, vinyl cure-site content, fillers, crosslinker, chain ends, or cured-network topology.",
    items: [item("polydimethylsiloxane-unit", "Dimethylsiloxane unit", "[*]O[Si](C)(C)[*]", "representative", "Siloxane repeat unit with two methyl groups on silicon", "Representative PDMS backbone unit for silicone rubber; other organosiloxanes and the cured network are omitted.")]
  },
  "wop-000161": {
    representationType: "copolymer_unit_set",
    scopeNote: "The drawings show dimethylsiloxane backbone units and methyl-vinyl-siloxane cure-site units in VMQ. They do not specify vinyl content, sequence, chain ends, filler, crosslinker, or network topology.",
    items: [
      item("polydimethylsiloxane-unit", "Dimethylsiloxane unit", "[*]O[Si](C)(C)[*]", "representative", "Siloxane repeat unit with two methyl groups on silicon", "Dominant dimethylsiloxane backbone unit."),
      item("methyl-vinyl-siloxane-unit", "Methyl-vinyl-siloxane unit", "[*]O[Si](C)(C=C)[*]", "representative", "Siloxane unit bearing methyl and vinyl substituents on silicon", "Representative low-abundance vinyl-bearing cure-site unit.")
    ]
  },
  "wop-000162": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates methyl-trifluoropropyl, dimethyl, and methyl-vinyl siloxane units encountered in FVMQ compositions. It does not prescribe their ratio or sequence, nor does it show the formulation-specific cured network.",
    items: [
      item("methyl-trifluoropropyl-siloxane-unit", "Methyl-trifluoropropyl siloxane unit", "[*]O[Si](C)(CCC(F)(F)F)[*]", "representative", "Siloxane unit bearing methyl and trifluoropropyl substituents", "Defining representative fluorinated organosiloxane unit."),
      item("polydimethylsiloxane-unit", "Dimethylsiloxane unit", "[*]O[Si](C)(C)[*]", "representative", "Siloxane repeat unit with two methyl groups on silicon", "Possible dimethylsiloxane constituent; fraction and sequence vary."),
      item("methyl-vinyl-siloxane-unit", "Methyl-vinyl-siloxane unit", "[*]O[Si](C)(C=C)[*]", "representative", "Siloxane unit bearing methyl and vinyl substituents on silicon", "Possible vinyl-bearing cure-site unit; abundance is not specified.")
    ]
  },
  "wop-000163": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is a representative organic polysulfide chain motif used in liquid polysulfide precursors. It does not define precursor functionality, sulfur rank distribution, branching, end groups, oxidant, or cured sealant network.",
    items: [item("organic-polysulfide-chain-motif", "Organic polysulfide chain motif", "[*]CCOCOCCSS[*]", "representative", "Flexible ether-containing organic chain segment joined to a disulfide linkage", "Representative ether-containing disulfide backbone motif; sulfur rank and network-forming end groups vary across polysulfide rubbers.")]
  },
  "wop-000164": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the saturated isobutylene homopolymer repeat constitution. It omits molecular mass, chain ends, branching defects, end-functional grades, and any downstream formulation.",
    items: [item("polyisobutylene-unit", "Isobutylene-derived unit", "[*]CC(C)(C)[*]", "exact", "Polyisobutylene repeat unit with two methyl substituents", "Exact constitutional repeat unit of ideal polyisobutylene; chain ends and grade-specific features are not shown.")]
  },
  "wop-000165": {
    representationType: "copolymer_unit_set",
    scopeNote: "The drawings show ethylene- and 1-octene-derived units in an ethylene–octene elastomer. They do not assert octene fraction, sequence, branch distribution, molecular mass, crystallinity, or a formulation.",
    items: [
      item("polyethylene-unit", "Ethylene-derived unit", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Ethylene-derived constituent; no fraction or sequence is implied."),
      item("ethylene-octene-unit", "1-Octene-derived unit", "[*]CC(CCCCCC)[*]", "representative", "Polyolefin chain unit bearing a six-carbon hexyl side group", "Representative 1-octene-derived unit; comonomer content and distribution vary by grade.")
    ]
  },
  "wop-000166": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The two drawings identify the polystyrene end-block chemistry and possible polybutadiene midblock microstructure in an A–B–A architecture. They do not define block lengths, diene microstructure fractions, molecular mass, coupling, or morphology.",
    items: [
      item("polystyrene-unit", "Polystyrene end blocks", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Polystyrene chemistry assigned to both outer blocks; block length is not represented."),
      item("polybutadiene-1-4-unspecified-unit", "Polybutadiene midblock", "[*]CC=CC[*]", "schematic", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Representative polybutadiene midblock unit with unspecified cis/trans geometry; vinyl content is grade dependent.")
    ]
  },
  "wop-000167": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings identify polystyrene outer blocks and a polyisoprene midblock in the supported A–B–A architecture. They do not define block lengths, isoprene microstructure distribution, molecular mass, coupling, or morphology.",
    items: [
      item("polystyrene-unit", "Polystyrene end blocks", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Polystyrene chemistry assigned to both outer blocks; block length is not represented."),
      item("polyisoprene-1-4-unspecified-unit", "Polyisoprene midblock", "[*]CC(C)=CC[*]", "schematic", "Isoprene-derived 1,4 chain segment with unspecified carbon-carbon double-bond geometry", "Representative 1,4-polyisoprene midblock unit with unspecified cis/trans geometry; other microstructures are not fixed.")
    ]
  },
  "wop-000168": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings identify polystyrene outer blocks and a saturated hydrogenated-polybutadiene-derived midblock. They do not define block lengths, ethylene/butylene distribution, residual unsaturation, coupling, or morphology.",
    items: [
      item("polystyrene-unit", "Polystyrene end blocks", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Polystyrene chemistry assigned to both outer blocks; block length is not represented."),
      item("sebs-saturated-midblock-motif", "Ethylene/butylene midblock", "[*]CCCC[*]", "schematic", "Saturated four-carbon hydrocarbon chain segment with two continuation bonds", "Schematic saturated midblock motif derived from hydrogenated polybutadiene; it does not encode local sequence or branch distribution.")
    ]
  },
  "wop-000169": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings identify polystyrene outer blocks and an ethylene/propylene-like saturated midblock derived from hydrogenated polyisoprene. They do not define block lengths, local sequence, branch distribution, coupling, or morphology.",
    items: [
      item("polystyrene-unit", "Polystyrene end blocks", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Polystyrene chemistry assigned to both outer blocks; block length is not represented."),
      item("seps-saturated-midblock-motif", "Ethylene/propylene midblock", "[*]CCC(C)[*]", "schematic", "Saturated hydrocarbon chain segment containing one methyl branch", "Schematic hydrogenated-polyisoprene-derived midblock motif; it does not encode local sequence or stereochemistry.")
    ]
  },
  "wop-000170": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings identify polystyrene outer blocks and two representative saturated motifs within the mixed SEEPS midblock. They do not define sub-block order, lengths, local sequence, branch distribution, coupling, or morphology.",
    items: [
      item("polystyrene-unit", "Polystyrene end blocks", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Polystyrene chemistry assigned to both outer blocks; block length is not represented."),
      item("sebs-saturated-midblock-motif", "Ethylene/butylene midblock motif", "[*]CCCC[*]", "schematic", "Saturated four-carbon hydrocarbon chain segment with two continuation bonds", "Schematic ethylene/butylene-like portion of the saturated midblock."),
      item("seps-saturated-midblock-motif", "Ethylene/propylene midblock motif", "[*]CCC(C)[*]", "schematic", "Saturated hydrocarbon chain segment containing one methyl branch", "Schematic ethylene/propylene-like portion of the saturated midblock.")
    ]
  },
  "wop-000171": {
    representationType: "component_set",
    scopeNote: "The set illustrates a polypropylene matrix and representative olefin-elastomer constituent chemistries used across TPO materials. TPO can be reactor-made or compounded; component identity, sequence, phase fraction, fillers, and morphology are not fixed.",
    items: [
      item("polypropylene-unspecified-unit", "Polypropylene phase", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Representative polypropylene matrix chemistry; tacticity and phase fraction are not specified."),
      item("polyethylene-unit", "Ethylene-rich elastomer motif", "[*]CC[*]", "representative", "Saturated polyethylene-like two-carbon chain segment", "Representative ethylene-derived motif within an EPR, EPDM, or ethylene–alpha-olefin elastomer constituent."),
      item("polypropylene-unspecified-unit", "Propylene-derived elastomer motif", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Representative propylene-derived motif within an olefin-elastomer constituent; no covalent bond to the polypropylene phase is implied.")
    ]
  },
  "wop-000172": {
    representationType: "component_set",
    scopeNote: "The set illustrates a thermoplastic polypropylene phase and representative EPDM-derived motifs in a dynamically crosslinked rubber phase. It does not define rubber identity for every TPV, phase ratio, cure-site identity, crosslink topology, oil, filler, or morphology.",
    items: [
      item("polypropylene-unspecified-unit", "Thermoplastic polypropylene phase", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Representative continuous thermoplastic-phase chemistry; tacticity and phase fraction are not fixed."),
      item("polyethylene-unit", "EPDM ethylene motif", "[*]CC[*]", "schematic", "Saturated polyethylene-like two-carbon chain segment", "One motif of a representative dynamically crosslinked EPDM phase; it is not covalently attached to the polypropylene drawing."),
      item("polypropylene-unspecified-unit", "EPDM propylene motif", "[*]CC(C)[*]", "schematic", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Propylene-derived motif in the representative rubber phase; sequence and crosslinking are not encoded."),
      item("epdm-enb-cure-site-motif", "EPDM cure-site motif", "[*]C1C2CC(=CC)C(C2)C1[*]", "schematic", "Polymer-incorporated ENB motif with saturated norbornane ring bonds, two open chain attachments, and a retained exocyclic ethylidene double bond", "Schematic ENB-derived motif showing incorporation through the endocyclic norbornene double bond and retention of the exocyclic ethylidene unsaturation; the dynamically cured network itself is not uniquely defined.")
    ]
  },
  "wop-000173": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings illustrate a common MDI-derived urethane hard-segment motif and a PTMEG soft-segment repeat in a segmented TPU. They do not define the family-wide diisocyanate, polyol, chain extender, block lengths, sequence, or hard/soft ratio.",
    items: [
      item("mdi-urethane-hard-segment-motif", "Representative hard segment", "[*]OC(=O)Nc1ccc(Cc2ccc(NC(=O)O[*])cc2)cc1", "representative", "Aromatic methylene-diphenyl urethane segment with two continuation bonds", "Representative MDI-derived urethane hard-segment motif; TPU families include other diisocyanates and chain extenders."),
      item("polytetramethylene-ether-unit", "Representative soft segment", "[*]OCCCC[*]", "representative", "Tetramethylene ether repeat unit with four methylene groups and one oxygen", "Representative PTMEG-derived soft-segment unit; block length and end groups are omitted.")
    ]
  },
  "wop-000174": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings illustrate PBT hard-segment and PTMEG soft-segment chemistries used in one established TPC architecture. They do not exhaust possible polyester/polyether choices or define block lengths, sequence, blend content, or morphology.",
    items: [
      item("polybutylene-terephthalate-unit", "Representative polyester hard segment", "[*]OCCCCOC(=O)c1ccc(C(=O)[*])cc1", "representative", "Polybutylene terephthalate repeat unit with aromatic diester and tetramethylene groups", "Representative PBT hard-segment unit; other TPC hard-segment chemistries exist."),
      item("polytetramethylene-ether-unit", "Representative polyether soft segment", "[*]OCCCC[*]", "representative", "Tetramethylene ether repeat unit with four methylene groups and one oxygen", "Representative PTMEG-derived soft-segment unit; block length and sequence are omitted.")
    ]
  },
  "wop-000175": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings illustrate a nylon-12 hard-block unit and PTMEG soft-block unit as one representative PEBA architecture. The family includes other polyamide and polyether blocks; block lengths, end groups, sequence, and composition are not fixed.",
    items: [
      item("nylon-12-unit", "Representative polyamide block", "[*]NCCCCCCCCCCCC(=O)[*]", "representative", "Nylon-12 repeat unit with an amide linkage and eleven methylene groups", "Representative nylon-12 hard-block unit; other PEBA grades use different polyamide blocks."),
      item("polytetramethylene-ether-unit", "Representative polyether block", "[*]OCCCC[*]", "representative", "Tetramethylene ether repeat unit with four methylene groups and one oxygen", "Representative PTMEG-derived soft-block unit; other polyethers and block lengths are possible.")
    ]
  },
  "wop-000176": {
    representationType: "family_representative_set",
    scopeNote: "The drawings show para-aramid PPTA and meta-aramid PMIA as representative, chemically distinct members. They illustrate rather than exhaust the aromatic-polyamide family and do not represent fiber orientation or grade-specific copolymers.",
    items: [
      item("ppta-unit", "Para-aramid (PPTA) unit", "[*]C(=O)c1ccc(C(=O)Nc2ccc(N[*])cc2)cc1", "representative", "Para-linked aromatic polyamide repeat segment with terephthalamide and p-phenylene groups", "Representative para-aramid constitution; fiber orientation and chain ends are not shown."),
      item("pmia-unit", "Meta-aramid (PMIA) unit", "[*]C(=O)c1cccc(C(=O)Nc2cccc(N[*])c2)c1", "representative", "Meta-linked aromatic polyamide repeat segment with isophthalamide and m-phenylene groups", "Representative meta-aramid constitution; fiber morphology and chain ends are not shown.")
    ]
  },
  "wop-000177": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal PPTA constitutional repeat with para-linked aromatic rings. It omits chain ends, molecular mass, defects, protonation or solvent complexes, and spun-fiber orientation.",
    items: [item("ppta-unit", "PPTA repeat unit", "[*]C(=O)c1ccc(C(=O)Nc2ccc(N[*])cc2)cc1", "exact", "Para-linked aromatic polyamide repeat segment with terephthalamide and p-phenylene groups", "Exact constitutional repeat of ideal PPTA; chain ends and higher-order fiber structure are not shown.")]
  },
  "wop-000178": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal PMIA constitutional repeat with meta-linked aromatic rings. It omits chain ends, molecular mass, defects, solution complexes, and spun-fiber morphology.",
    items: [item("pmia-unit", "PMIA repeat unit", "[*]C(=O)c1cccc(C(=O)Nc2cccc(N[*])c2)c1", "exact", "Meta-linked aromatic polyamide repeat segment with isophthalamide and m-phenylene groups", "Exact constitutional repeat of ideal PMIA; chain ends and fiber morphology are not shown.")]
  },
  "wop-000179": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows PPTA-like p-phenylene and ether-containing 3,4′-oxydiphenylene terephthalamide units. It does not assert comonomer fraction, sequence, chain ends, or the orientation of a spun copolyaramid fiber.",
    items: [
      item("ppta-unit", "p-Phenylene terephthalamide unit", "[*]C(=O)c1ccc(C(=O)Nc2ccc(N[*])cc2)cc1", "representative", "Para-linked aromatic polyamide repeat segment with terephthalamide and p-phenylene groups", "p-Phenylene-containing copolyaramid unit; no fraction or sequence is implied."),
      item("oda-ppta-unit", "Oxydiphenylene terephthalamide unit", "[*]C(=O)c1ccc(C(=O)Nc2ccc(Oc3cccc(N[*])c3)cc2)cc1", "representative", "Aromatic terephthalamide segment containing an ether-linked diphenylene diamine residue", "Representative 3,4′-oxydiphenylene-containing unit; copolymer sequence and fraction are not specified.")
    ]
  },
  "wop-000180": {
    representationType: "family_representative_set",
    scopeNote: "The drawing is a representative aromatic benzimidazole-containing backbone motif. Polybenzimidazole is family-level, so it does not select one comonomer pair, regiochemistry, molecular mass, chain end, or processed morphology.",
    items: [item("aromatic-polybenzimidazole-motif", "Benzimidazole backbone motif", "[*]c1ccc2[nH]c(-c3cccc([*])c3)nc2c1", "representative", "Fused benzimidazole ring joined to an aromatic continuation segment", "Representative aromatic benzimidazole-containing motif; it is not an exhaustive or unique PBI family repeat.")]
  },
  "wop-000181": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal poly(p-phenylene-2,6-benzobisoxazole) constitutional repeat, including both oxazole rings fused to the central benzene. It omits chain ends, defects, molecular mass, protonation or acid complexes, and fiber packing or orientation.",
    items: [item("pbo-benzobisoxazole-sru", "PBO repeat unit", "[*]c1ccc(-c2nc3cc4nc([*])oc4cc3o2)cc1", "exact", "Para-phenylene connected to a fused benzobisoxazole unit with two nitrogen and two oxygen atoms", "Exact ideal PBO constitutional repeat with the complete benzobisoxazole connection table; chain ends and higher-order fiber structure are omitted.")]
  },
  "wop-000182": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal poly(p-phenylene-2,6-benzobisthiazole) constitutional repeat, including both thiazole rings fused to the central benzene. It omits chain ends, defects, molecular mass, protonation or acid complexes, and fiber packing or orientation.",
    items: [item("pbzt-benzobisthiazole-sru", "PBZT repeat unit", "[*]c1ccc(-c2nc3cc4sc([*])nc4cc3s2)cc1", "exact", "Para-phenylene connected to a fused benzobisthiazole unit with two nitrogen and two sulfur atoms", "Exact ideal PBZT constitutional repeat with the complete benzobisthiazole connection table; chain ends and higher-order fiber structure are omitted.")]
  },
  "wop-000183": {
    representationType: "family_representative_set",
    scopeNote: "The drawing illustrates a linear aromatic 1,3,4-oxadiazole-containing backbone motif. Polyoxadiazoles vary in heterocycle regiochemistry, spacers, and architecture, including hyperbranched members, so no family-wide exact repeat is implied.",
    items: [item("aromatic-polyoxadiazole-motif", "Aromatic oxadiazole motif", "[*]c1ccc(-c2nnc(o2)-c2ccc([*])cc2)cc1", "representative", "Aromatic chain segment containing a five-membered oxadiazole ring", "Representative linear aromatic oxadiazole motif; regiochemistry and architecture vary across the family.")]
  },
  "wop-000184": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set illustrates acrylonitrile and vinyl-chloride units as one established modacrylic composition. Modacrylics may use other substantial comonomers; unit fractions, sequence, additives, and fiber morphology are not fixed.",
    items: [
      item("polyacrylonitrile-unit", "Acrylonitrile-derived unit", "[*]CC(C#N)[*]", "representative", "Polyacrylonitrile repeat unit with a nitrile side group", "Acrylonitrile-derived constituent; no fraction or sequence is implied."),
      item("polyvinyl-chloride-unit", "Vinyl-chloride-derived unit", "[*]CC(Cl)[*]", "representative", "Polyvinyl chloride repeat unit with one chlorine substituent", "Vinyl-chloride-derived unit illustrates one established modacrylic comonomer lineage; other comonomers occur.")
    ]
  },
  "wop-000185": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates PVC and vinyl-acetate-derived units from an established vinyon copolymer lineage. It does not exhaust afterchlorinated or other qualifying vinyon compositions, nor define comonomer ratio, sequence, additives, or fiber morphology.",
    items: [
      item("polyvinyl-chloride-unit", "Vinyl-chloride-derived unit", "[*]CC(Cl)[*]", "representative", "Polyvinyl chloride repeat unit with one chlorine substituent", "Dominant vinyl-chloride-derived constituent in the illustrated vinyon lineage."),
      item("polyvinyl-acetate-unit", "Vinyl-acetate-derived unit", "[*]CC(OC(=O)C)[*]", "representative", "Polyvinyl acetate repeat unit with an acetate ester side group", "Representative vinyl-acetate comonomer unit; no fraction or sequence is implied.")
    ]
  },
  "wop-000186": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings illustrate an MDI/diamine-derived urea hard-segment motif and PTMEG soft-segment unit from a segmented polyurethane–urea elastane architecture. Other diisocyanates, chain extenders, and soft segments exist; lengths, sequence, ratio, and fiber morphology are not fixed.",
    items: [
      item("mdi-urea-hard-segment-motif", "Representative hard segment", "[*]NC(=O)Nc1ccc(Cc2ccc(NC(=O)N[*])cc2)cc1", "representative", "Aromatic methylene-diphenyl segment flanked by urea linkages and two continuation bonds", "Representative MDI/diamine-derived urea hard-segment motif from a polyurethane–urea elastane lineage; other chain extenders and hard-segment chemistries occur."),
      item("polytetramethylene-ether-unit", "Representative soft segment", "[*]OCCCC[*]", "representative", "Tetramethylene ether repeat unit with four methylene groups and one oxygen", "Representative PTMEG-derived soft-segment unit; block length and end groups are omitted.")
    ]
  },
  "wop-000187": {
    representationType: "network_fragment",
    scopeNote: "The drawing is a schematic methylene-linked phenolic network fragment derived from a novolac precursor. It does not define phenol substitution, methylene-bridge distribution, crosslink density, residual curing agent, or a unique network repeat.",
    items: [item("novoloid-phenolic-network-fragment", "Phenolic network fragment", "[*]Cc1cc(C[*])c(O)c(C[*])c1", "schematic", "Phenolic aromatic ring with hydroxyl group and three open methylene-linked continuation points", "Schematic crosslinked phenolic fragment with open continuation bonds; the finite motif is not a unique novoloid repeat unit.")]
  },
  "wop-000188": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "Regeneration changes cellulose morphology rather than its β-1,4-glucan constitution. The drawing shows one ideal anhydroglucose chain unit and omits chain ends, degree of polymerization, residual derivatization, allomorph, and regenerated-fiber morphology.",
    items: [item("cellulose-anhydroglucose-unit", "β-1,4-anhydroglucose unit", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "exact", "Beta-linked anhydroglucose unit with three hydroxyl-bearing positions", "Exact ideal cellulose chain constitution; regeneration-dependent crystal form and morphology are not depicted.")]
  },
  "wop-000189": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set illustrates the cellulose backbone and one acetylated anhydroglucose motif. Acetyl degree and site distribution vary; the drawings are not a sequence, a substitution ratio, or a unique cellulose-acetate repeat.",
    items: [
      item("cellulose-anhydroglucose-unit", "Unsubstituted cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit with three hydroxyl-bearing positions", "Unsubstituted backbone motif retained within a substitution-variable cellulose ester."),
      item("cellulose-monoacetate-motif", "Acetylated cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OC(=O)C)[C@@H]1O", "schematic", "Beta-linked anhydroglucose unit bearing one acetate ester", "One illustrative acetylation site; actual cellulose acetate has a distribution of sites and degrees of substitution.")
    ]
  },
  "wop-000190": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the fully acetylated ideal cellulose triacetate anhydroglucose unit. Commercial CTA can have degree of substitution below three and a distribution of residual hydroxyl groups; chain ends and morphology are omitted.",
    items: [item("cellulose-triacetate-unit", "Triacetylated anhydroglucose unit", "[*]O[C@H]1O[C@@H](COC(=O)C)[C@H](O[*])[C@@H](OC(=O)C)[C@@H]1OC(=O)C", "representative", "Beta-linked anhydroglucose unit bearing three acetate ester substituents", "Ideal fully acetylated cellulose unit; real CTA grades can retain a small, distributed hydroxyl fraction.")]
  },
  "wop-000191": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the β-1,4-linked anhydroglucose chain constitution shared by cellulose. It does not encode chain length, reducing ends, native allomorph, crystallinity, microfibril organization, or plant-wall constituents.",
    items: [item("cellulose-anhydroglucose-unit", "β-1,4-anhydroglucose unit", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "exact", "Beta-linked anhydroglucose unit with three hydroxyl-bearing positions", "Exact ideal cellulose constitutional unit; allomorph and higher-order microfibrillar structure are not shown.")]
  },
  "wop-000192": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing is one mixed acetyl/butyryl cellulose motif. CAB grades vary in acetyl, butyryl, and residual hydroxyl content and in site distribution, so it is not a unique repeat or substitution sequence.",
    items: [item("cellulose-acetate-butyrate-motif", "Mixed acetate/butyrate motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OC(=O)C)[C@@H]1OC(=O)CCC", "representative", "Beta-linked anhydroglucose unit bearing one acetate and one butyrate ester", "Representative mixed-ester motif; substitution sites and amounts vary among CAB grades.")]
  },
  "wop-000193": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing is one mixed acetyl/propionyl cellulose motif. CAP grades vary in acetyl, propionyl, and residual hydroxyl content and in site distribution, so it is not a unique repeat or substitution sequence.",
    items: [item("cellulose-acetate-propionate-motif", "Mixed acetate/propionate motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OC(=O)C)[C@@H]1OC(=O)CC", "representative", "Beta-linked anhydroglucose unit bearing one acetate and one propionate ester", "Representative mixed-ester motif; substitution sites and amounts vary among CAP grades.")]
  },
  "wop-000194": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set shows the cellulose backbone and one nitrate-ester-bearing anhydroglucose motif. Nitrogen content, degree and site distribution of nitration, residual hydroxyls, and formulation components vary; no unique repeat is implied.",
    items: [
      item("cellulose-anhydroglucose-unit", "Unsubstituted cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit with three hydroxyl-bearing positions", "Unsubstituted backbone motif retained within substitution-variable cellulose nitrate."),
      item("cellulose-nitrate-motif", "Nitrate-ester-bearing motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O[N+](=O)[O-])[C@@H]1O", "schematic", "Beta-linked anhydroglucose unit bearing one nitrate ester", "One illustrative nitrate-ester site; actual nitration degree and site distribution vary.")
    ]
  },
  "wop-000195": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing shows one methyl-ether-bearing anhydroglucose motif. Methylcellulose has grade-dependent methyl degree and site distribution plus residual hydroxyl groups; the item is not a unique repeat or sequence.",
    items: [{ ...item("methyl-cellulose-motif", "Methylated cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OC)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit bearing one methoxy substituent", "One illustrative methyl-ether site; degree and distribution of substitution vary."), polymerSgroup: false }]
  },
  "wop-000196": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing shows one ethyl-ether-bearing anhydroglucose motif. Ethylcellulose grades have variable ethyl degree and site distribution plus residual hydroxyls; the item is not a unique repeat or sequence.",
    items: [{ ...item("ethyl-cellulose-motif", "Ethylated cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OCC)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit bearing one ethoxy substituent", "One illustrative ethyl-ether site; degree and distribution of substitution vary."), polymerSgroup: false }]
  },
  "wop-000197": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing shows one hydroxyethyl-ether-bearing anhydroglucose motif. HEC varies in molar substitution, chain length of substituent additions, site distribution, and residual hydroxyls; no unique repeat is implied.",
    items: [{ ...item("hydroxyethyl-cellulose-motif", "Hydroxyethylated cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OCCO)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit bearing one hydroxyethyl ether", "One illustrative hydroxyethyl site; substitution amount and oligomeric side-chain length vary."), polymerSgroup: false }]
  },
  "wop-000198": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing shows one hydroxypropyl-ether-bearing anhydroglucose motif. HPC varies in molar substitution, substituent chain growth, site distribution, and residual hydroxyls; no unique repeat is implied.",
    items: [{ ...item("hydroxypropyl-cellulose-motif", "Hydroxypropylated cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OCC(C)O)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit bearing one hydroxypropyl ether", "One illustrative hydroxypropyl site; amount, site distribution, and side-chain growth vary."), polymerSgroup: false }]
  },
  "wop-000199": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing shows one anhydroglucose motif carrying both methoxy and hydroxypropoxy substituents. HPMC grades vary independently in both substitution levels and site distributions; the motif is not a unique repeat or sequence.",
    items: [{ ...item("hydroxypropyl-methylcellulose-motif", "Mixed methyl/hydroxypropyl motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OC)[C@@H]1OCC(C)O", "representative", "Beta-linked anhydroglucose unit bearing methoxy and hydroxypropoxy substituents", "One illustrative mixed-substitution motif; sites and amounts vary among HPMC grades."), polymerSgroup: false }]
  },
  "wop-000200": {
    representationType: "variable_substitution_motif",
    scopeNote: "The drawing shows one carboxymethyl-ether-bearing cellulose motif in its acid form. CMC varies in substitution degree and site distribution and is often supplied as a salt; counterion, neutralization, and sequence are not fixed.",
    items: [item("carboxymethyl-cellulose-motif", "Carboxymethylated cellulose motif", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](OCC(=O)O)[C@@H]1O", "representative", "Beta-linked anhydroglucose unit bearing one carboxymethyl ether in acid form", "One illustrative carboxymethyl site shown in acid form; substitution amount, site distribution, and salt form vary.")]
  },
  "wop-000201": {
    representationType: "component_set",
    scopeNote: "The set shows an α-1,4-glucan chain motif and an α-1,6 branch-point motif representing amylose and amylopectin fractions. It does not define botanical-source composition, chain-length distribution, branch density, granule organization, or processing history.",
    items: [
      item("alpha-1-4-glucan-unit", "Amylose-like α-1,4 unit", "[*]O[C@@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "representative", "Alpha-linked anhydroglucose chain unit with hydroxyl substituents", "Representative predominantly linear α-1,4-glucan motif from the amylose fraction."),
      item("amylopectin-alpha-1-6-branch-motif", "Amylopectin branch-point motif", "[*]O[C@@H]1O[C@@H](CO[*])[C@H](O[*])[C@@H](O)[C@@H]1O", "schematic", "Alpha-glucan residue with three continuation bonds including a C6 branch", "Schematic α-1,6 branch-point residue from amylopectin; branch spacing and chain lengths are not represented.")
    ]
  },
  "wop-000202": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal α-1,4-linked anhydroglucose chain unit of amylose. It omits reducing ends, chain-length distribution, occasional branching, helices, complexes, and higher-order association.",
    items: [item("alpha-1-4-glucan-unit", "α-1,4-anhydroglucose unit", "[*]O[C@@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "representative", "Alpha-linked anhydroglucose chain unit with hydroxyl substituents", "Ideal α-1,4-glucan unit representing the predominantly linear amylose chain; rare branches and chain ends are omitted.")]
  },
  "wop-000203": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is an α-1,6 branch-point residue embedded in an α-1,4 glucan context. It does not define branch spacing, cluster architecture, chain lengths, reducing ends, or starch-granule organization.",
    items: [item("amylopectin-alpha-1-6-branch-motif", "α-1,6 branch-point motif", "[*]O[C@@H]1O[C@@H](CO[*])[C@H](O[*])[C@@H](O)[C@@H]1O", "schematic", "Alpha-glucan residue with three continuation bonds including a C6 branch", "Schematic amylopectin branch-point residue; the finite motif is not a unique repeat for the whole branched macromolecule.")]
  },
  "wop-000204": {
    representationType: "component_set",
    scopeNote: "The set identifies amylose-like and amylopectin branch motifs retained in thermoplastic starch. Plasticizer identity and loading, destructuring, retrogradation, botanical composition, blends, and additives are formulation variables and are not drawn.",
    items: [
      item("alpha-1-4-glucan-unit", "Amylose-like chain motif", "[*]O[C@@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1O", "representative", "Alpha-linked anhydroglucose chain unit with hydroxyl substituents", "Representative amylose-like starch component after thermomechanical processing."),
      item("amylopectin-alpha-1-6-branch-motif", "Amylopectin branch motif", "[*]O[C@@H]1O[C@@H](CO[*])[C@H](O[*])[C@@H](O)[C@@H]1O", "schematic", "Alpha-glucan residue with three continuation bonds including a C6 branch", "Schematic amylopectin component motif; no branch density or component ratio is implied.")
    ]
  },
  "wop-000205": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the β-1,4-linked N-acetylglucosamine constitution of ideal chitin. It omits chain ends, degree of acetylation defects, protein/mineral associates, allomorph, crystallinity, and hierarchical microfibril structure.",
    items: [item("chitin-n-acetylglucosamine-unit", "N-acetylglucosamine unit", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1NC(=O)C", "exact", "Beta-linked anhydro sugar unit bearing an acetamido substituent", "Exact ideal chitin constitutional unit; acetylation defects and higher-order allomorphs are not shown.")]
  },
  "wop-000206": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows deacetylated glucosamine and residual N-acetylglucosamine units. Their ratio and sequence, protonation, counterions, molecular mass, chain ends, and any crosslinked formulation vary among chitosans.",
    items: [
      item("chitosan-glucosamine-unit", "Glucosamine unit", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1N", "representative", "Beta-linked anhydro sugar unit bearing a primary amino group", "Deacetylated glucosamine-derived unit; protonation and fraction are not fixed."),
      item("chitin-n-acetylglucosamine-unit", "Residual N-acetylglucosamine unit", "[*]O[C@H]1O[C@@H](CO)[C@H](O[*])[C@@H](O)[C@@H]1NC(=O)C", "representative", "Beta-linked anhydro sugar unit bearing an acetamido substituent", "Residual acetylated unit; no sequence or degree of deacetylation is implied.")
    ]
  },
  "wop-000207": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows sodium mannuronate- and guluronate-like residue motifs as the two epimeric building units of alginate. It does not encode M/G ratio, block sequence, molecular mass, botanical source, protonation, or divalent-ion network junctions.",
    items: [
      item("sodium-mannuronate-unit", "Mannuronate residue", "[*]O[C@H]1O[C@@H](C(=O)[O-])[C@H](O[*])[C@@H](O)[C@@H]1O.[Na+]", "representative", "Anionic uronate sugar residue with sodium counterion and two chain continuation bonds", "Representative sodium mannuronate-like residue; counterion, ionization, and sequence vary."),
      item("sodium-guluronate-unit", "Guluronate residue", "[*]O[C@H]1O[C@H](C(=O)[O-])[C@H](O[*])[C@@H](O)[C@@H]1O.[Na+]", "representative", "Epimeric anionic uronate sugar residue with sodium counterion and two chain continuation bonds", "Representative sodium guluronate-like residue; M/G sequence and ion-mediated junctions are not represented.")
    ]
  },
  "wop-000208": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawings identify the two alternating residue types in the agarobiose motif of agarose. They do not yet encode their full connected disaccharide S-group, chain ends, residual agaropectin, molecular mass, or physical gel junctions.",
    items: [
      item("agarose-galactose-residue-motif", "D-galactose residue motif", "[*]O[C@H]1O[C@@H](CO)[C@@H](O[*])[C@@H](O)[C@@H]1O", "schematic", "Galactose-like pyranose residue with two glycosidic continuation bonds", "Schematic D-galactose-like residue within agarobiose; final V3000 review must confirm the connected alternating disaccharide repeat."),
      item("agarose-3-6-anhydrogalactose-motif", "3,6-Anhydro-L-galactose motif", "[*]O[C@@H]1O[C@H]2CO[C@@H]2[C@H](O[*])[C@@H]1O", "schematic", "Bicyclic 3,6-anhydrogalactose-like residue with two continuation bonds", "Schematic 3,6-anhydro-L-galactose-like residue; it is an architectural part, not a complete agarobiose repeat.")
    ]
  },
  "wop-000209": {
    representationType: "stereochemical_repeat_segment",
    scopeNote: "The drawing shows the ideal dianionic iota-carrageenan disaccharide repeat as one source-defined representative of the broader carrageenan family. It does not represent kappa-, lambda-, hybrid, or precursor carrageenans, counterion identity, natural substitution, sequence irregularity, or gel junctions.",
    items: [item("iota-carrageenan-sru", "Iota-carrageenan repeat", "[*]O[C@@H]1[C@@H]2OC[C@H]1O[C@H](O[C@@H]1[C@@H](O)[C@H]([*])O[C@H](CO)[C@@H]1OS(=O)(=O)[O-])[C@@H]2OS(=O)(=O)[O-]", "exact", "Iota-carrageenan disaccharide repeat with explicit stereochemistry and two sulfate anions", "Exact ideal iota-carrageenan disaccharide repeat in its dianionic form; counterions and other carrageenan structures are omitted.")]
  },
  "wop-000210": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is one guaiacyl β-O-4-linked aromatic dimer motif, selected to illustrate a prevalent lignin linkage. Lignin has no unique repeat: H/G/S composition, ether and carbon–carbon linkages, branching, condensation, end groups, and technical-isolation changes all vary.",
    items: [item("lignin-guaiacyl-beta-o-4-motif", "Guaiacyl β-O-4 motif", "COc1cc(C(O)COc2cc(OC)c(O)cc2)ccc1O", "representative", "Two methoxyphenol rings connected through a beta-O-4 aryl ether side-chain motif", "Representative guaiacyl β-O-4 lignin motif; this finite dimer is not a constitutional repeat or complete lignin architecture.")]
  },
  "wop-000211": {
    representationType: "no_unique_repeat",
    scopeNote: "Collagen is a protein family with type-dependent amino-acid sequences, post-translational modifications, chain stoichiometries, interruptions, and hierarchical triple-helix/fibril organization. The family scope therefore has no single source-defensible chemical repeat unit or finite motif that represents every collagen type.",
    items: []
  },
  "wop-000212": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is a GAGAGS peptide segment representative of a recurring silk-fibroin block. It does not define the full protein sequence, species, chain termini, minor amino-acid blocks, beta-sheet packing, sericin content, or regenerated morphology.",
    items: [item("silk-fibroin-gagags-motif", "Gly-Ala-Gly-Ala-Gly-Ser motif", "[*]NCC(=O)N[C@@H](C)C(=O)NCC(=O)N[C@@H](C)C(=O)NCC(=O)N[C@@H](CO)C(=O)[*]", "representative", "Six-residue glycine-alanine-glycine-alanine-glycine-serine peptide segment", "Representative GAGAGS peptide motif; it is not the complete silk-fibroin sequence or a claim about beta-sheet packing.")]
  },
  "wop-000213": {
    representationType: "family_representative_set",
    scopeNote: "The set shows 3-hydroxybutyrate, 3-hydroxyvalerate, and 3-hydroxyhexanoate polyester units as representative short- and medium-chain-length PHA members. It does not exhaust side-chain identities, copolymer sequences, compositions, stereochemistry variants, or biological inclusions.",
    items: [
      item("poly-3-hydroxybutyrate-unit", "3-Hydroxybutyrate unit", "[*]O[C@@H](C)CC(=O)[*]", "representative", "Chiral hydroxybutyrate polyester unit with a methyl side group", "Representative 3HB unit from a short-chain-length PHA."),
      item("poly-3-hydroxyvalerate-unit", "3-Hydroxyvalerate unit", "[*]O[C@@H](CC)CC(=O)[*]", "representative", "Chiral hydroxyvalerate polyester unit with an ethyl side group", "Representative 3HV unit; no copolymer composition is implied."),
      item("poly-3-hydroxyhexanoate-unit", "3-Hydroxyhexanoate unit", "[*]O[C@@H](CCC)CC(=O)[*]", "representative", "Chiral hydroxyhexanoate polyester unit with a propyl side group", "Representative 3HHx unit from the broader PHA compositional range.")
    ]
  },
  "wop-000214": {
    representationType: "stereochemical_repeat_segment",
    scopeNote: "The drawing shows the common stereoregular 3-hydroxybutyrate polyester unit. It omits chain ends, molecular mass, stereodefects, biological inclusions, crystal packing, and processing history.",
    items: [item("poly-3-hydroxybutyrate-unit", "3-Hydroxybutyrate unit", "[*]O[C@@H](C)CC(=O)[*]", "exact", "Chiral hydroxybutyrate polyester unit with a methyl side group", "Stereochemically specified ideal PHB repeat unit; chain ends and higher-order morphology are not shown.")]
  },
  "wop-000215": {
    representationType: "copolymer_unit_set",
    scopeNote: "The two drawings show 3HB- and 3HV-derived polyester units. They do not specify 3HV fraction, sequence distribution, molecular mass, chain ends, stereodefects, or processing-dependent morphology.",
    items: [
      item("poly-3-hydroxybutyrate-unit", "3HB unit", "[*]O[C@@H](C)CC(=O)[*]", "representative", "Chiral hydroxybutyrate polyester unit with a methyl side group", "3HB-derived copolyester unit; no fraction or sequence is implied."),
      item("poly-3-hydroxyvalerate-unit", "3HV unit", "[*]O[C@@H](CC)CC(=O)[*]", "representative", "Chiral hydroxyvalerate polyester unit with an ethyl side group", "3HV-derived copolyester unit; no fraction or sequence is implied.")
    ]
  },
  "wop-000216": {
    representationType: "copolymer_unit_set",
    scopeNote: "The two drawings show 3HB- and 3HHx-derived polyester units. They do not specify 3HHx fraction, sequence distribution, molecular mass, chain ends, stereodefects, or processing-dependent morphology.",
    items: [
      item("poly-3-hydroxybutyrate-unit", "3HB unit", "[*]O[C@@H](C)CC(=O)[*]", "representative", "Chiral hydroxybutyrate polyester unit with a methyl side group", "3HB-derived copolyester unit; no fraction or sequence is implied."),
      item("poly-3-hydroxyhexanoate-unit", "3HHx unit", "[*]O[C@@H](CCC)CC(=O)[*]", "representative", "Chiral hydroxyhexanoate polyester unit with a propyl side group", "3HHx-derived copolyester unit; no fraction or sequence is implied.")
    ]
  },
  "wop-000217": {
    representationType: "family_representative_set",
    scopeNote: "The set shows L- and D-lactyl repeat stereoisomers to represent the stereochemical range within PLA. It does not define enantiomer ratio, stereosequence, stereoblocks, molecular mass, chain ends, additives, or crystallinity.",
    items: [
      item("poly-l-lactide-unit", "L-lactyl unit", "[*]O[C@H](C)C(=O)[*]", "representative", "Chiral lactyl polyester unit in the L configuration", "L-lactyl repeat stereoisomer; no family-wide fraction or sequence is implied."),
      item("poly-d-lactide-unit", "D-lactyl unit", "[*]O[C@@H](C)C(=O)[*]", "representative", "Chiral lactyl polyester unit in the D configuration", "D-lactyl repeat stereoisomer; racemic and stereoblock arrangements are not encoded.")
    ]
  },
  "wop-000218": {
    representationType: "stereochemical_repeat_segment",
    scopeNote: "The drawing specifies the L-lactyl repeat stereochemistry of ideal PLLA. It omits chain ends, molecular mass, stereodefects, D-unit content, additives, crystal packing, and processing history.",
    items: [item("poly-l-lactide-unit", "L-lactyl unit", "[*]O[C@H](C)C(=O)[*]", "exact", "Chiral lactyl polyester unit in the L configuration", "Stereochemically specified ideal PLLA repeat unit; chain ends and higher-order morphology are not shown.")]
  },
  "wop-000219": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal glycolate polyester repeat constitution. It omits chain ends, molecular mass, defects, catalysts, crystal packing, and processing history.",
    items: [item("polyglycolide-unit", "Glycolate unit", "[*]OCC(=O)[*]", "exact", "Polyglycolide repeat unit with an ether oxygen and carbonyl group", "Exact ideal PGA constitutional repeat; chain ends and morphology are not shown.")]
  },
  "wop-000220": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows lactyl and glycolyl polyester units. PLGA may contain D-, L-, or mixed lactyl stereochemistry; composition, sequence, chain ends, molecular mass, and morphology are not fixed.",
    items: [
      item("polylactide-unspecified-unit", "Lactyl unit", "[*]OC(C)C(=O)[*]", "representative", "Lactyl polyester unit with unspecified stereochemistry at the methyl-bearing carbon", "Lactide-derived unit with unspecified D/L configuration; no stereosequence or copolymer ratio is implied."),
      item("polyglycolide-unit", "Glycolyl unit", "[*]OCC(=O)[*]", "representative", "Polyglycolide repeat unit with an ether oxygen and carbonyl group", "Glycolide-derived unit; no copolymer ratio or sequence is implied.")
    ]
  },
  "wop-000221": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal ε-caprolactone-derived polyester repeat. It omits chain ends, molecular mass, catalysts, branching, additives, crystallinity, and processing history.",
    items: [item("polycaprolactone-unit", "Caprolactone-derived unit", "[*]OCCCCCC(=O)[*]", "exact", "Polycaprolactone repeat unit with five methylene groups and one ester carbonyl", "Exact ideal PCL constitutional repeat; chain ends and morphology are not shown.")]
  },
  "wop-000222": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal butylene-succinate polyester repeat. It omits chain ends, molecular mass, catalysts, chain extenders, defects, additives, and processing-dependent morphology.",
    items: [item("polybutylene-succinate-unit", "Butylene succinate unit", "[*]OCCCCOC(=O)CCC(=O)[*]", "exact", "Polyester repeat containing tetramethylene glycol and succinate residues", "Exact ideal PBS constitutional repeat; chain ends and formulation-specific modifications are not shown.")]
  },
  "wop-000223": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows butylene-adipate and butylene-terephthalate polyester units. It does not specify comonomer ratio, sequence distribution, molecular mass, chain ends, catalyst residues, branching, or formulation.",
    items: [
      item("polybutylene-adipate-unit", "Butylene adipate unit", "[*]OCCCCOC(=O)CCCCC(=O)[*]", "representative", "Aliphatic polyester unit containing tetramethylene glycol and adipate residues", "Butylene-adipate-derived copolyester unit; no fraction or sequence is implied."),
      item("polybutylene-terephthalate-unit", "Butylene terephthalate unit", "[*]OCCCCOC(=O)c1ccc(C(=O)[*])cc1", "representative", "Polybutylene terephthalate repeat unit with aromatic diester and tetramethylene groups", "Butylene-terephthalate-derived copolyester unit; no fraction or sequence is implied.")
    ]
  },
  "wop-000224": {
    representationType: "copolymer_unit_set",
    scopeNote: "The set shows butylene-succinate and butylene-adipate polyester units. It does not specify comonomer ratio, sequence distribution, molecular mass, chain ends, catalyst residues, chain extension, or formulation.",
    items: [
      item("polybutylene-succinate-unit", "Butylene succinate unit", "[*]OCCCCOC(=O)CCC(=O)[*]", "representative", "Polyester repeat containing tetramethylene glycol and succinate residues", "Butylene-succinate-derived copolyester unit; no fraction or sequence is implied."),
      item("polybutylene-adipate-unit", "Butylene adipate unit", "[*]OCCCCOC(=O)CCCCC(=O)[*]", "representative", "Aliphatic polyester unit containing tetramethylene glycol and adipate residues", "Butylene-adipate-derived copolyester unit; no fraction or sequence is implied.")
    ]
  },
  "wop-000225": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal ethylene 2,5-furandicarboxylate polyester repeat. It omits chain ends, molecular mass, regio-defects, catalysts, additives, crystallinity, and processing history.",
    items: [item("polyethylene-furanoate-unit", "Ethylene furandicarboxylate unit", "[*]OCCOC(=O)c1ccc(C(=O)[*])o1", "exact", "Polyester repeat containing ethylene glycol and a 2,5-disubstituted furan ring", "Exact ideal PEF constitutional repeat with a 2,5-furandicarboxylate residue; chain ends and morphology are omitted.")]
  },
  "wop-000226": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal ethylene-oxide-derived polyether repeat. It omits hydroxyl or other chain ends, molecular mass, defects, water, salts, blends, and crystalline or solution morphology.",
    items: [item("polyethylene-oxide-unit", "Ethylene oxide unit", "[*]CCO[*]", "exact", "Polyethylene oxide repeat unit with a carbon-carbon-oxygen backbone", "Exact ideal PEO constitutional repeat; end groups and associated species are not shown.")]
  },
  "wop-000227": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the propylene-oxide-derived polyether constitution with unspecified stereochemistry at the substituted backbone carbon. It omits tacticity, head-to-tail defects, chain ends, molecular mass, and crosslinked or polyurethane formulations.",
    items: [item("polypropylene-oxide-unit", "Propylene oxide unit", "[*]CC(C)O[*]", "representative", "Polypropylene oxide repeat unit with an ether linkage and methyl substituent", "Representative PPO constitutional unit with unspecified backbone stereochemistry; tacticity and end groups are not encoded.")]
  },
  "wop-000228": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal tetramethylene-ether chain repeat. It omits the hydroxyl termini that define a PTMEG diol grade, molecular mass, unsaturation, cyclic oligomers, and downstream polyurethane or copolymer connectivity.",
    items: [item("polytetramethylene-ether-unit", "Tetramethylene ether unit", "[*]OCCCC[*]", "exact", "Tetramethylene ether repeat unit with four methylene groups and one oxygen", "Exact ideal PTMEG chain repeat; hydroxyl end groups and molecular-weight grade are not shown.")]
  },
  "wop-000229": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal HEMA homopolymer repeat with an unspecified backbone stereocenter. It omits tacticity, chain ends, molecular mass, crosslinker, water, and hydrogel or biomedical formulation details.",
    items: [item("polyhema-unit", "HEMA-derived unit", "[*]CC(C)(C(=O)OCCO)[*]", "representative", "Methacrylate polymer unit bearing methyl and hydroxyethyl ester substituents", "Representative PHEMA constitutional unit with unspecified backbone stereochemistry; crosslinked hydrogel structure is not shown.")]
  },
  "wop-000230": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal N-isopropylacrylamide homopolymer repeat with unspecified backbone stereochemistry. It omits tacticity, chain ends, molecular mass, hydration state, crosslinker, comonomers, and hydrogel architecture.",
    items: [item("pnipam-unit", "N-Isopropylacrylamide unit", "[*]CC(C(=O)NC(C)C)[*]", "representative", "Acrylamide polymer unit bearing an N-isopropyl substituent", "Representative PNIPAM constitutional unit with unspecified backbone stereochemistry; hydration and crosslinking are not depicted.")]
  },
  "wop-000231": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows a cyclopolymerized N,N-dimethylpyrrolidinium backbone unit with chloride counterion. Ring-junction stereochemistry, sequence defects, chain ends, molecular mass, counterion exchange, and solution conformation are not fixed.",
    items: [item("pdadmac-pyrrolidinium-chloride-unit", "Pyrrolidinium chloride unit", "C[N+]1(C)CC([*])C([*])C1.[Cl-]", "representative", "Five-membered dimethylpyrrolidinium ring with two chain attachments and a chloride counterion", "Representative PDADMAC cyclopolymer unit with explicit chloride; backbone ring stereochemistry is unspecified.")]
  },
  "wop-000232": {
    representationType: "family_representative_set",
    scopeNote: "The set contrasts a linear secondary-amine chain unit with a branched tertiary-amine junction motif. It does not define linear/branched fraction, branch topology, molecular mass, protonation, counterions, end groups, or solvent-dependent conformation.",
    items: [
      item("linear-polyethyleneimine-unit", "Linear PEI unit", "[*]CCN[*]", "representative", "Ethyleneimine chain unit containing one secondary amine", "Representative neutral linear-PEI unit; protonation and end groups are not shown."),
      item("branched-polyethyleneimine-junction", "Branched PEI junction", "[*]CCN(CC[*])CC[*]", "schematic", "Tertiary amine junction connected to three ethylene chain continuations", "Schematic tertiary-amine branch junction; it does not define the statistical distribution of primary, secondary, and tertiary amines.")
    ]
  },
  "wop-000233": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows a styrene-derived repeat bearing para-sulfonate with an explicit sodium counterion. It omits tacticity, chain ends, molecular mass, counterion exchange, hydration, crosslinking, and complexes with other polymers.",
    items: [item("sodium-polystyrenesulfonate-unit", "Sodium 4-styrenesulfonate unit", "[*]CC(c1ccc(S(=O)(=O)[O-])cc1)[*].[Na+]", "representative", "Polystyrene repeat bearing a para-sulfonate anion with sodium counterion", "Representative PNaSS constitutional unit with explicit sodium; backbone stereochemistry and hydration are not shown.")]
  },
  "wop-000234": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates a TFE-derived fluorocarbon backbone unit and one long-side-chain perfluoroether sulfonic-acid unit used in a representative PFSA architecture. Side-chain length, equivalent weight, comonomer sequence, acid/salt form, hydration, and commercial composition vary.",
    items: [
      item("polytetrafluoroethylene-unit", "TFE-derived backbone unit", "[*]C(F)(F)C(F)(F)[*]", "representative", "Perfluorinated two-carbon tetrafluoroethylene repeat unit", "Representative perfluorocarbon backbone unit within PFSA ionomers."),
      item("pfsa-long-side-chain-sulfonic-acid-unit", "Sulfonic-acid side-chain unit", "[*]C(F)(F)C(F)(OC(F)(F)C(F)(C(F)(F)F)OC(F)(F)C(F)(F)S(=O)(=O)O)[*]", "representative", "Perfluorocarbon chain unit bearing a perfluoroether side chain terminated by sulfonic acid", "Representative long-side-chain PFSA unit; it does not define all PFSA side-chain architectures or ionization states.")
    ]
  },
  "wop-000235": {
    representationType: "variable_substitution_motif",
    scopeNote: "The set shows an unsubstituted PEEK repeat and one ring-sulfonated PEEK motif. Degree and site distribution of sulfonation, acid/salt form, sequence, molecular mass, hydration, and membrane morphology vary; no unique SPEEK repeat is implied.",
    items: [
      item("peek-unit", "Unsubstituted PEEK unit", "[*]Oc1ccc(Oc2ccc(C(=O)c3ccc([*])cc3)cc2)cc1", "representative", "Aromatic polyether ether ketone repeat segment with ether and ketone linkages", "Unsubstituted PEEK backbone motif retained within partially sulfonated material."),
      item("sulfonated-peek-motif", "Sulfonated PEEK motif", "[*]Oc1cc(S(=O)(=O)O)c(Oc2ccc(C(=O)c3ccc([*])cc3)cc2)cc1", "representative", "Polyether ether ketone backbone segment bearing one sulfonic acid group", "One illustrative ring-sulfonated motif; degree and site distribution of sulfonation are not fixed.")
    ]
  },
  "wop-000236": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates poly(2-methyl-2-oxazoline) and poly(2-ethyl-2-oxazoline) repeat units as representative side-chain variants. It does not exhaust 2-substituents, architectures, end groups, ionization states, blocks, or functional modifications.",
    items: [
      item("poly-2-methyl-2-oxazoline-unit", "2-Methyl-2-oxazoline unit", "[*]CCN(C(=O)C)[*]", "representative", "Tertiary polyamide repeat unit bearing an acetyl side group on nitrogen", "Representative methyl-substituted poly(2-oxazoline) unit."),
      item("poly-2-ethyl-2-oxazoline-unit", "2-Ethyl-2-oxazoline unit", "[*]CCN(C(=O)CC)[*]", "representative", "Tertiary polyamide repeat unit bearing a propionyl side group on nitrogen", "Representative ethyl-substituted poly(2-oxazoline) unit; the family contains many other side chains.")
    ]
  },
  "wop-000237": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the N-vinylpyrrolidone-derived homopolymer repeat with unspecified backbone stereochemistry. It omits tacticity, chain ends, molecular mass, hydration, crosslinking, copolymerization, and formulation components.",
    items: [item("polyvinylpyrrolidone-unit", "N-Vinylpyrrolidone unit", "[*]CC(N1CCCC1=O)[*]", "representative", "Vinyl-chain repeat bearing a five-membered lactam ring through nitrogen", "Representative PVP constitutional unit with unspecified backbone stereochemistry; crosslinked forms are not shown.")]
  },
  "wop-000238": {
    representationType: "block_or_graft_architecture",
    scopeNote: "The drawings identify PEO outer-block and PPO central-block repeat chemistries in the PEO–PPO–PEO architecture. They do not define block lengths, PEO/PPO ratio, PPO stereochemistry, chain ends, commercial grade, micelles, or gels.",
    items: [
      item("polyethylene-oxide-unit", "PEO outer blocks", "[*]CCO[*]", "schematic", "Polyethylene oxide repeat unit with a carbon-carbon-oxygen backbone", "PEO chemistry assigned to both outer blocks; block length and hydroxyl end groups are not represented."),
      item("polypropylene-oxide-unit", "PPO central block", "[*]CC(C)O[*]", "schematic", "Polypropylene oxide repeat unit with an ether linkage and methyl substituent", "PPO central-block unit with unspecified stereochemistry; block length is not represented.")
    ]
  },
  "wop-000239": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is a schematic tertiary-amine branching motif with amidoamine arms. It does not define the ethylenediamine or alternative core, complete generation, terminal-group conversion, defects, protonation, counterions, guest molecules, or a linear repeat unit.",
    items: [item("pamam-amidoamine-branching-motif", "Amidoamine branching motif", "[*]N(CCC(=O)NCCN[*])CCC(=O)NCCN[*]", "schematic", "Tertiary amine branch point with one incoming continuation and two propionamide-ethylenediamine descendant arms", "Schematic one-in/two-out PAMAM branch motif with the Michael-addition propionamide orientation; generation, core, defects, and terminal groups must be specified separately for a complete dendrimer.")]
  },
  "wop-000240": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal dimethylsiloxane chain repeat. It omits chain ends, molecular mass, cyclics, vinyl or other functional units, fillers, crosslinker, and the topology of cured PDMS networks.",
    items: [item("polydimethylsiloxane-unit", "Dimethylsiloxane unit", "[*]O[Si](C)(C)[*]", "exact", "Siloxane repeat unit with two methyl groups on silicon", "Exact ideal PDMS constitutional repeat; chain ends and cured-network structure are not shown.")]
  },
  "wop-000241": {
    representationType: "family_representative_set",
    scopeNote: "The set shows cis and trans alkene geometries possible in polyacetylene backbones. It does not define cis/trans sequence or fraction, chain ends, defects, molecular mass, dopant, charge carriers, or solid-state packing.",
    items: [
      item("cis-polyacetylene-unit", "cis-Polyacetylene segment", "[*]/C=C\\[*]", "representative", "Cis carbon-carbon double bond with two polymer continuation bonds", "Cis polyacetylene backbone segment; no sequence or fraction is implied."),
      item("trans-polyacetylene-unit", "trans-Polyacetylene segment", "[*]/C=C/[*]", "representative", "Trans carbon-carbon double bond with two polymer continuation bonds", "Trans polyacetylene backbone segment; defects and doping state are not shown.")
    ]
  },
  "wop-000242": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is a neutral benzenoid amine-linked backbone motif. Polyaniline spans multiple oxidation and protonation states with delocalized charge, counterions, and sequence distributions, so this motif is not a unique conductive-state repeat.",
    items: [item("polyaniline-benzenoid-amine-motif", "Benzenoid amine motif", "[*]c1ccc(Nc2ccc(N[*])cc2)cc1", "representative", "Two para-linked benzenoid rings joined by amine nitrogens", "Representative reduced benzenoid polyaniline motif; emeraldine/pernigraniline oxidation, protonation, and counterions are not encoded.")]
  },
  "wop-000243": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing shows a neutral 2,5-linked pyrrole backbone motif. Oxidatively prepared polypyrrole has variable oxidation, delocalized charge, counterions, defects, and coupling regiochemistry, so no single doped-state repeat or stoichiometry is implied.",
    items: [item("polypyrrole-2-5-unit", "2,5-Linked pyrrole motif", "[*]c1ccc([*])[nH]1", "representative", "Pyrrole ring with polymer continuation bonds at the alpha positions", "Representative neutral 2,5-linked pyrrole motif; oxidation state and counterions are not shown.")]
  },
  "wop-000244": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates unsubstituted 2,5-linked polythiophene and a hexyl-substituted member. Side-chain identity, regioregularity, copolymer sequence, molecular mass, oxidation, counterions, and solid-state organization vary across the family.",
    items: [
      item("polythiophene-2-5-unit", "Unsubstituted thiophene unit", "[*]c1ccc([*])s1", "representative", "Thiophene ring with polymer continuation bonds at the 2 and 5 positions", "Representative neutral 2,5-linked polythiophene unit."),
      item("poly-3-hexylthiophene-unit", "3-Hexylthiophene unit", "[*]c1c(CCCCCC)cc([*])s1", "representative", "Thiophene ring with a hexyl side chain and two polymer continuation bonds", "Representative P3HT unit illustrating one substituted family member; regioregular sequence is not encoded by this single unit.")
    ]
  },
  "wop-000245": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing is a head-to-tail 3-hexylthiophene dyad motif. It illustrates regioregular connectivity but does not assert perfect regioregularity, chain length, end groups, oxidation state, counterions, film packing, or device formulation.",
    items: [item("p3ht-head-to-tail-dyad", "Head-to-tail P3HT dyad", "[*]c1sc(cc1CCCCCC)-c1sc([*])cc1CCCCCC", "representative", "Two linked 3-hexylthiophene rings arranged in a head-to-tail dyad", "Representative head-to-tail P3HT dyad; isolated regiochemical defects and higher-order lamellar packing are not shown.")]
  },
  "wop-000246": {
    representationType: "macromolecular_motif",
    scopeNote: "The drawing shows a neutral 2,5-linked EDOT-derived backbone motif. PEDOT oxidation level, delocalized charge, counterions, coupling defects, chain ends, and deposition-dependent morphology vary and are not assigned.",
    items: [item("pedot-neutral-unit", "Neutral EDOT-derived motif", "[*]c1sc2OCCOc2c1[*]", "representative", "Thiophene backbone unit fused to an ethylenedioxy ring with two continuation bonds", "Representative neutral PEDOT backbone motif; route-dependent oxidation and dopant are not encoded.")]
  },
  "wop-000247": {
    representationType: "component_set",
    scopeNote: "PEDOT:PSS is shown as two disconnected neutral parent-connectivity motifs: an EDOT-derived conjugated chain and poly(styrenesulfonic acid). The colon does not denote a covalent bond. Real PEDOT:PSS is partially oxidized and ionically associated, but oxidation level, charge localization, PSS protonation, composition, additives, and domain morphology vary, so no fixed localized charge stoichiometry is drawn.",
    items: [
      item("pedot-neutral-unit", "PEDOT backbone motif", "[*]c1sc2OCCOc2c1[*]", "schematic", "Neutral EDOT-derived parent chain unit with two continuation bonds", "Neutral parent connectivity of the PEDOT component; actual chains are partially oxidized with delocalized positive charge that is not assigned to one repeat unit."),
      {
        key: "polystyrene-sulfonic-acid-unit",
        label: "PSS parent-acid motif",
        molfilePath: "./curated-structures/polystyrene-sulfonic-acid-unit.mol",
        fidelity: "schematic",
        altText: "Polystyrene repeat bearing a para-sulfonic acid group and no covalent connection to PEDOT",
        caption: "Neutral parent-acid connectivity of the PSS component; actual sulfonate/proton balance and charge compensation depend on PEDOT oxidation and formulation."
      }
    ]
  },
  "wop-000248": {
    representationType: "family_representative_set",
    scopeNote: "The set shows trans and cis phenylene-vinylene backbone geometries. The PPV family also includes substituted and copolymer variants; cis/trans fraction and sequence, defects, chain ends, precursor conversion, doping, and morphology are not fixed.",
    items: [
      item("trans-ppv-unit", "trans-Phenylene-vinylene unit", "[*]c1ccc(/C=C/[*])cc1", "representative", "Para-phenylene ring joined to a trans vinylene segment with two continuation bonds", "Representative trans phenylene-vinylene backbone unit."),
      item("cis-ppv-unit", "cis-Phenylene-vinylene unit", "[*]c1ccc(/C=C\\[*])cc1", "representative", "Para-phenylene ring joined to a cis vinylene segment with two continuation bonds", "Representative cis phenylene-vinylene backbone unit; no family-wide fraction or sequence is implied.")
    ]
  },
  "wop-000249": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows a trans phenylene-vinylene unit bearing methoxy and 2-ethylhexyloxy substituents. It omits cis defects, regiochemical defects, chain ends, molecular mass, oxidation/doping, and film morphology.",
    items: [item("meh-ppv-trans-unit", "MEH-PPV unit", "[*]c1c(OC)cc(OCC(CC)CCCC)c(/C=C/[*])c1", "representative", "Substituted phenylene-vinylene unit with methoxy and branched 2-ethylhexyloxy side groups", "Representative trans MEH-PPV constitutional unit; defects and electronic doping are not shown.")]
  },
  "wop-000250": {
    representationType: "family_representative_set",
    scopeNote: "The drawings illustrate unsubstituted fluorene and 9,9-dimethylfluorene backbone motifs. Polyfluorenes commonly use other 9,9-substituents and copolymer units; side-chain identity, sequence, defects, molecular mass, doping, and aggregation are not fixed.",
    items: [
      item("polyfluorene-unsubstituted-motif", "Fluorene backbone motif", "[*]c1ccc2c(c1)c1cc([*])ccc1C2", "representative", "Fused fluorene ring system with two aromatic chain continuation bonds", "Representative unsubstituted fluorene backbone motif; many practical polyfluorenes are 9,9-disubstituted."),
      item("poly-9-9-dimethylfluorene-motif", "9,9-Dimethylfluorene motif", "[*]c1ccc2c(c1)c1cc([*])ccc1C2(C)C", "representative", "Fused fluorene unit with two methyl groups at carbon 9 and two chain continuations", "Representative 9,9-disubstituted polyfluorene motif; substituent identity varies across the family.")
    ]
  },
  "wop-000251": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows bisphenol-A polycarbonate as one source-defined representative of the broader polycarbonate family. It does not represent aliphatic polycarbonates, alternative bisphenols, copolymers, chain ends, molecular mass, or formulations.",
    items: [item("bisphenol-a-polycarbonate-unit", "Bisphenol-A polycarbonate unit", "[*]OC(=O)Oc1ccc(C(C)(C)c2ccc(O[*])cc2)cc1", "representative", "Aromatic polycarbonate repeat containing a bisphenol-A residue and carbonate linkage", "Representative BPA-PC constitutional unit; other polycarbonate chemistries are outside this drawing's scope.")]
  },
  "wop-000252": {
    representationType: "family_representative_set",
    scopeNote: "The set shows representative PSU, PESU, and PPSU aromatic ether-sulfone backbone segments. It illustrates the different bisphenol-derived connectors without defining chain ends, molecular mass, copolymers, blends, or processed membrane morphology.",
    items: [
      item("bisphenol-a-polysulfone-unit", "PSU representative", "[*]Oc1ccc(C(C)(C)c2ccc(Oc3ccc(S(=O)(=O)c4ccc([*])cc4)cc3)cc2)cc1", "representative", "Aromatic ether-sulfone repeat segment containing a bisphenol-A connector", "Representative bisphenol-A polysulfone constitution."),
      item("polyethersulfone-unit", "PESU representative", "[*]Oc1ccc(S(=O)(=O)c2ccc(Oc3ccc([*])cc3)cc2)cc1", "representative", "Aromatic ether-sulfone repeat segment without a bisphenol-A isopropylidene group", "Representative polyethersulfone constitution; chain ends and membrane morphology are omitted."),
      item("polyphenylsulfone-unit", "PPSU representative", "[*]Oc1ccc(-c2ccc(Oc3ccc(S(=O)(=O)c4ccc([*])cc4)cc3)cc2)cc1", "representative", "Aromatic ether-sulfone repeat segment containing a biphenyl connector", "Representative polyphenylsulfone constitution; chain ends and morphology are omitted.")
    ]
  },
  "wop-000253": {
    representationType: "family_representative_set",
    scopeNote: "The set contrasts cis- and trans-1,4-polyisoprene chain units. It does not exhaust 1,2/3,4 microstructures, natural-rubber non-polymer constituents, catalyst-dependent defect content, chain ends, branching, or vulcanized networks.",
    items: [
      item("cis-1-4-polyisoprene-unit", "cis-1,4-polyisoprene unit", "[*]C/C(=C\\C[*])/C", "representative", "Cis-1,4-polyisoprene repeat segment with a methyl-substituted carbon-carbon double bond", "Representative cis-1,4 member of the polyisoprene family."),
      item("trans-1-4-polyisoprene-unit", "trans-1,4-polyisoprene unit", "[*]C/C(=C/C[*])/C", "representative", "Trans-1,4-polyisoprene repeat segment with a methyl-substituted carbon-carbon double bond", "Representative trans-1,4 member; no family-wide abundance is implied.")
    ]
  },
  "wop-000254": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates PTFE, PVDF, PCTFE, and an HFP-derived fluorinated unit as representative family chemistries. It is not exhaustive and does not define copolymer sequence/composition, tacticity, chain ends, cure sites, additives, or morphology.",
    items: [
      item("polytetrafluoroethylene-unit", "PTFE unit", "[*]C(F)(F)C(F)(F)[*]", "representative", "Perfluorinated two-carbon tetrafluoroethylene repeat unit", "Representative fully fluorinated homopolymer unit."),
      item("polyvinylidene-fluoride-unit", "PVDF unit", "[*]CC(F)(F)[*]", "representative", "Vinylidene fluoride repeat unit with one methylene and one difluoromethylene carbon", "Representative partially fluorinated homopolymer unit; PVDF polymorph and tacticity are not shown."),
      item("polychlorotrifluoroethylene-unit", "PCTFE unit", "[*]C(F)(F)C(F)(Cl)[*]", "representative", "Chlorotrifluoroethylene repeat unit with chlorine and three fluorines", "Representative chlorofluoropolymer unit."),
      item("hexafluoropropylene-unit", "HFP-derived unit", "[*]C(F)(F)C(F)(C(F)(F)F)[*]", "representative", "Hexafluoropropylene-derived chain unit with a trifluoromethyl side group", "Representative fluorinated comonomer-derived unit used in several copolymer families.")
    ]
  },
  "wop-000255": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates aromatic MDI- and aliphatic HDI-derived urethane motifs. The polyol, chain extender, block lengths, sequence, crosslinking, urea content, blowing chemistry, and formulation determine actual polyurethane structures and are not fixed here.",
    items: [
      item("mdi-urethane-hard-segment-motif", "Aromatic urethane motif", "[*]OC(=O)Nc1ccc(Cc2ccc(NC(=O)O[*])cc2)cc1", "representative", "Aromatic methylene-diphenyl urethane segment with two continuation bonds", "Representative MDI-derived urethane motif; it is not a complete family-wide repeat."),
      item("hdi-urethane-motif", "Aliphatic urethane motif", "[*]OC(=O)NCCCCCCNC(=O)O[*]", "representative", "Hexamethylene segment flanked by two urethane groups and continuation bonds", "Representative HDI-derived aliphatic urethane motif; polyol identity and architecture are omitted.")
    ]
  },
  "wop-000256": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the ideal dimethylsiloxane unit of PDMS as the most common source-defined polysiloxane representative. It does not represent the family's other organic substituents, unit distributions, architectures, chain ends, condensation defects, fillers, or cured networks.",
    items: [item("polydimethylsiloxane-unit", "Dimethylsiloxane unit", "[*]O[Si](C)(C)[*]", "representative", "Siloxane repeat unit with two methyl groups on silicon", "Representative PDMS constitutional unit; other polysiloxane substituent patterns and architectures are omitted.")]
  },
  "wop-000257": {
    representationType: "family_representative_set",
    scopeNote: "The set identifies polystyrene block chemistry and representative unsaturated polybutadiene, polyisoprene, and saturated hydrogenated-diene midblock motifs. It does not encode every block sequence, block length, coupling architecture, composition, or morphology.",
    items: [
      item("polystyrene-unit", "Styrenic block unit", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Representative polystyrene hard-block chemistry shared across many SBCs."),
      item("polybutadiene-1-4-unspecified-unit", "Polybutadiene midblock motif", "[*]CC=CC[*]", "schematic", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "Representative SBS-like unsaturated midblock motif with unspecified cis/trans geometry; vinyl content is not fixed."),
      item("polyisoprene-1-4-unspecified-unit", "Polyisoprene midblock motif", "[*]CC(C)=CC[*]", "schematic", "Isoprene-derived 1,4 chain segment with unspecified carbon-carbon double-bond geometry", "Representative SIS-like midblock motif with unspecified cis/trans geometry; other microstructures are not fixed."),
      item("sebs-saturated-midblock-motif", "Hydrogenated-diene midblock motif", "[*]CCCC[*]", "schematic", "Saturated four-carbon hydrocarbon chain segment with two continuation bonds", "Representative SEBS-like saturated midblock motif; local sequence and branching are not encoded.")
    ]
  },
  "wop-000258": {
    representationType: "component_set",
    scopeNote: "The blend is shown without covalent bonds between a BPA-polycarbonate component and ABS constituent motifs. ABS itself is a graft/phase-structured styrene–acrylonitrile–butadiene material; the drawings do not define graft topology, ratios, compatibilizer, additives, or blend morphology.",
    items: [
      item("bisphenol-a-polycarbonate-unit", "Polycarbonate component", "[*]OC(=O)Oc1ccc(C(C)(C)c2ccc(O[*])cc2)cc1", "representative", "Aromatic polycarbonate repeat containing a bisphenol-A residue and carbonate linkage", "Representative BPA-PC component; it is not covalently attached to the ABS motifs shown separately."),
      item("polystyrene-unit", "ABS styrene-derived motif", "[*]CC(c1ccccc1)[*]", "schematic", "Polystyrene repeat unit with a phenyl side group", "Styrene-derived motif within the ABS component; no graft sequence or fraction is implied."),
      item("polyacrylonitrile-unit", "ABS acrylonitrile-derived motif", "[*]CC(C#N)[*]", "schematic", "Polyacrylonitrile repeat unit with a nitrile side group", "Acrylonitrile-derived motif within the ABS component; no sequence or fraction is implied."),
      item("polybutadiene-1-4-unspecified-unit", "ABS butadiene-derived motif", "[*]CC=CC[*]", "schematic", "Polybutadiene 1,4 segment with unspecified carbon-carbon double-bond geometry", "One representative butadiene-derived rubber motif within ABS; grafting, cis/trans geometry, and vinyl content are not encoded.")
    ]
  },
  "wop-000259": {
    representationType: "component_set",
    scopeNote: "The two drawings are separate PPE and polystyrene component repeat units; no covalent bond between them is implied. Blend ratio, PPE end groups, polystyrene tacticity, impact modifiers, additives, and phase morphology are not specified.",
    items: [
      item("poly-2-6-dimethylphenylene-ether-unit", "PPE component", "[*]Oc1c(C)cc([*])cc1C", "representative", "Aromatic ether repeat unit with methyl groups at the 2 and 6 positions", "Representative poly(2,6-dimethyl-1,4-phenylene ether) component; chain ends are omitted."),
      item("polystyrene-unit", "Polystyrene component", "[*]CC(c1ccccc1)[*]", "representative", "Polystyrene repeat unit with a phenyl side group", "Representative polystyrene component with unspecified tacticity; it is not covalently attached to PPE.")
    ]
  },
  "wop-000260": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the PVC resin repeat shared by PVC-U formulations. Absence of plasticizer is a formulation constraint, not a new polymer constitution; stabilizers, processing aids, lubricants, fillers, gelation, molecular mass, and tacticity are not drawn.",
    items: [item("polyvinyl-chloride-unit", "PVC resin component", "[*]CC(Cl)[*]", "representative", "Polyvinyl chloride repeat unit with one chlorine substituent", "PVC resin constitutional unit shared with other PVC formulations; this drawing does not represent the complete PVC-U additive package.")]
  },
  "wop-000261": {
    representationType: "constitutional_repeat_unit",
    scopeNote: "The drawing shows the PVC resin repeat shared by PVC-P formulations. Plasticizer identity and loading, stabilizers, fillers, processing aids, molecular mass, tacticity, and morphology vary and are not represented by one unique component set.",
    items: [item("polyvinyl-chloride-unit", "PVC resin component", "[*]CC(Cl)[*]", "representative", "Polyvinyl chloride repeat unit with one chlorine substituent", "PVC resin constitutional unit shared with PVC-U; the variable plasticizer and additive package is not drawn.")]
  },
  "wop-000262": {
    representationType: "family_representative_set",
    scopeNote: "The set illustrates units associated with VDF/HFP FKM, TFE/perfluorovinyl-ether FFKM, and TFE/propylene FEPM architectures. It does not define complete copolymer sequences, ratios, cure sites, chain ends, fillers, or formulation-specific cured networks.",
    items: [
      item("polyvinylidene-fluoride-unit", "VDF-derived unit", "[*]CC(F)(F)[*]", "representative", "Vinylidene fluoride repeat unit with one methylene and one difluoromethylene carbon", "Representative VDF-derived motif from FKM architectures."),
      item("hexafluoropropylene-unit", "HFP-derived unit", "[*]C(F)(F)C(F)(C(F)(F)F)[*]", "representative", "Hexafluoropropylene-derived chain unit with a trifluoromethyl side group", "Representative HFP-derived motif from FKM architectures."),
      item("polytetrafluoroethylene-unit", "TFE-derived unit", "[*]C(F)(F)C(F)(F)[*]", "representative", "Perfluorinated two-carbon tetrafluoroethylene repeat unit", "Representative TFE-derived motif occurring in FFKM and FEPM lineages."),
      item("perfluoromethyl-vinyl-ether-unit", "Perfluorovinyl-ether-derived unit", "[*]C(F)(F)C(F)(OC(F)(F)F)[*]", "representative", "Perfluorinated chain unit bearing a trifluoromethoxy substituent", "Representative perfluorovinyl-ether motif from an FFKM architecture."),
      item("polypropylene-unspecified-unit", "Propylene-derived unit", "[*]CC(C)[*]", "representative", "Polypropylene repeat unit with a methyl side group and unspecified stereochemistry", "Representative propylene-derived motif from FEPM architectures.")
    ]
  },
};

// Explicit evidence selection. Each locator was inspected in the v1 entry;
// migration code must not infer structural evidence from a generic source.
const evidenceByWopId = {
  "wop-000132": ["dap-fmc-us3385836"],
  "wop-000133": ["tspi-zhang-phenylethynyl-oligomer-synthesis-2022"],
  "wop-000134": ["naturalrubber-chen-ijms-2018"],
  "wop-000135": ["cis-polyisoprene-ziegler-latex-ep3428217"],
  "wop-000136": ["trans-pi-fu-sulfur-crystallinity-mechanics-2014"],
  "wop-000137": ["polybutadiene-neodymium-us5428119"],
  "wop-000138": ["sbr-emulsion-recipe-us5583173", "sbr-solution-end-modification-us6133388"],
  "wop-000139": ["esbr-goodyear-ep0942042a2"],
  "wop-000140": ["ssbr-alkoxide-organolithium-us5679751"],
  "wop-000141": ["steinwand-carboxylated-copolymers-patent"],
  "wop-000142": ["nbr-bayer-5770660"],
  "wop-000143": ["hnbr-lanxess-2020020677"],
  "wop-000144": ["muller-xnbr-emulsifier-free-patent-1999"],
  "wop-000145": ["egami-butyl-manufacture-1978"],
  "wop-000146": ["sone-butyl-rubber-industry-2015"],
  "wop-000147": ["chlorobutyl-exxon-2964489"],
  "wop-000148": ["polychloroprene-emulsion-us2707180"],
  "wop-000149": ["epr-uniroyal-3402140"],
  "wop-000150": ["epdm-bravaya-catalysts-2022", "epdm-exxon-6384162"],
  "wop-000151": ["sugiyama-acrylic-rubber-2016"],
  "wop-000152": ["aem-dupont-us3925326a"],
  "wop-000153": ["epa-epichlorohydrin-elastomer-assessment", "polyepichlorohydrin-activated-monomer-patent"],
  "wop-000154": ["organomagnesium-epoxide-copolymerization-patent"],
  "wop-000155": ["cpe-us20210230322a1-chlorinated-polyethylene-patent"],
  "wop-000156": ["cspe-dow-3542746"],
  "wop-000157": ["fkm-immix-us20020099142a1"],
  "wop-000158": ["dupont-perfluoroelastomer-nitrile-cure-site-1995"],
  "wop-000159": ["fepm-cure-site-emulsion-us20040116612"],
  "wop-000160": ["silicone-rubber-peroxide-condensation-us20040023042", "silicone-rubber-addition-rtv-us5247046"],
  "wop-000161": ["vmq-hongda-107151325"],
  "wop-000162": ["fluorosilicone-shinetsu-5824736"],
  "wop-000163": ["polysulfide-rubber-thiol-precursor-us5430192"],
  "wop-000164": ["pib-controlled-chain-ends-pmc10460079"],
  "wop-000165": ["eto-borealis-2933277"],
  "wop-000166": ["sbs-living-diblock-coupling-us8349950"],
  "wop-000167": ["sis-sequential-anionic-cn113461882"],
  "wop-000168": ["sebs-sbs-preparation-hydrogenation-us7186782"],
  "wop-000169": ["seps-sis-hydrogenation-ep1352940"],
  "wop-000170": ["seeps-mixed-diene-precursor-ep1352940"],
  "wop-000171": ["tpo-compound-grade-melt-blending-chapter-2024"],
  "wop-000172": ["tpv-dynamic-vulcanization-chemistry-lehel-2020"],
  "wop-000173": ["tpu-segment-chemistry-synthesis-asensio-2019"],
  "wop-000174": ["tpc-dmt-bdo-ptmg-jp2000290483"],
  "wop-000175": ["peba-carboxyl-pa-polyether-us5310557"],
  "wop-000176": ["aramid-acs-copolymer-fiber-2025"],
  "wop-000177": ["dupont-ppta-molten-tpc-solution-1974"],
  "wop-000178": ["pmia-interfacial-polycondensation-patent-1961"],
  "wop-000179": ["teijin-copolyaramid-oda-ppd-tpc-1978"],
  "wop-000180": ["pbi-preparation-us3174947"],
  "wop-000181": ["pbo-dupont-us4608427"],
  "wop-000182": ["pbt-teijin-ep0346094"],
  "wop-000183": ["polyoxadiazole-ppa-us7847054"],
  "wop-000184": ["modacrylic-kanegafuchi-4524193"],
  "wop-000185": ["vinyon-vc-vac-afterchlorination-us3627853"],
  "wop-000186": ["elastane-dupont-5362432"],
  "wop-000187": ["american-kynol-novoloid-crosslinked-novolac-1978"],
  "wop-000188": ["regenerated-cellulose-fiber-properties-review-2024"],
  "wop-000189": ["cellulose-acetate-secondary-alcoholysis-patent"],
  "wop-000190": ["cta-shaikh-date-palm-cellulose-2022"],
  "wop-000191": ["cellulose-rongpipi-structure-mechanics-2019"],
  "wop-000192": ["cab-ambrosio-silica-stationary-phase-2025"],
  "wop-000193": ["cap-daicel-ep0822201-patent-2003"],
  "wop-000194": ["cellulose-nitrate-budaeva-synthetic-cellulose-2025"],
  "wop-000195": ["ioelovich-alkali-cellulose-etherification-study"],
  "wop-000196": ["ethyl-cellulose-hercules-gb778732a"],
  "wop-000197": ["hec-dow-4084060"],
  "wop-000198": ["hpc-shinetsu-4292426"],
  "wop-000199": ["hpmc-dow-3839319"],
  "wop-000200": ["rahman-recent-cmc-developments-2021"],
  "wop-000201": ["starch-edible-packaging-mechanics-review-2024"],
  "wop-000202": ["amylose-mdpi-starch-packaging-2024"],
  "wop-000203": ["amylopectin-mdpi-starch-packaging-2024"],
  "wop-000204": ["thermoplastic-starch-packaging-review-2022"],
  "wop-000205": ["chitin-lee-nanochitin-mechanics-review-2023"],
  "wop-000206": ["chitosan-rinaudo-2015"],
  "wop-000207": ["lee-alginate-properties-2012"],
  "wop-000208": ["jiang-agarose-hydrogel-review-2023"],
  "wop-000209": ["carrageenan-hilliou-gel-elasticity-2021"],
  "wop-000210": ["lignin-fabbri-biomodified-platform-review-2023"],
  "wop-000211": ["collagen-bose-multiscale-review-2022"],
  "wop-000212": ["silk-fibroin-guan-regenerated-mechanics-2025"],
  "wop-000213": ["pha-monomer-composition-mechanical-variability-review-2015"],
  "wop-000214": ["phb-production-crystallinity-mechanics-review-2020"],
  "wop-000215": ["phbv-composition-crystallinity-review-2021"],
  "wop-000216": ["phbhhx-tang-neoh-sudesh-review-2022"],
  "wop-000217": ["pla-naser-processing-routes-review-2021"],
  "wop-000218": ["stereogradient-plla-rop-study-2022", "stereocontrolled-cyclic-ester-rop-review-2010"],
  "wop-000219": ["pga-synthesis-and-catalysis-review-2010"],
  "wop-000220": ["high-glycolide-plga-rop-study-2021"],
  "wop-000221": ["pcl-continuous-rop-us20050014923"],
  "wop-000222": ["hitachi-pbs-esterification-polycondensation-2012"],
  "wop-000223": ["pbat-esterification-process-patent-2001"],
  "wop-000224": ["tepha-pbsa-condensation-2021"],
  "wop-000225": ["natura-pef-fdca-polycondensation-2014"],
  "wop-000226": ["dow-peo-metal-cyanide-2001"],
  "wop-000227": ["anionic-ppo-initiator-study-2018"],
  "wop-000228": ["ptmeg-polymeg-technical-information"],
  "wop-000229": ["tabatabaee-phema-radical-synthesis"],
  "wop-000230": ["pnipam-ren-jove-2020"],
  "wop-000231": ["pdadmac-uf-us4742134"],
  "wop-000232": ["branched-pei-aziridine-ep0905254", "linear-pei-polyoxazoline-us6025104"],
  "wop-000233": ["high-purity-sodium-styrenesulfonate-polymer-patent-2016"],
  "wop-000234": ["dupont-perfluorovinyl-ether-ionomer-1966"],
  "wop-000235": ["speek-sulfonation-workup-yee-2013"],
  "wop-000236": ["leiske-cationic-polyoxazoline-review"],
  "wop-000237": ["pvp-basf-us6187884"],
  "wop-000238": ["poloxamer-sequential-block-synthesis-2012"],
  "wop-000239": ["pamam-dendritic-composites-review-2022"],
  "wop-000240": ["pdms-dmdcs-hydrolysis-us5476916"],
  "wop-000241": ["polyacetylene-identity-structure-review-2018"],
  "wop-000242": ["pani-acid-dopant-scirep-2021"],
  "wop-000243": ["polypyrrole-powder-us4697000"],
  "wop-000244": ["polythiophene-paleti-doping-mechanics-review-2024"],
  "wop-000245": ["p3ht-hamill-2017"],
  "wop-000246": ["nie-pedot-synthesis-review"],
  "wop-000247": ["pedotpss-water-soluble-dispersion-patent-2015"],
  "wop-000248": ["ppv-cis-trans-mechanical-stability-2023"],
  "wop-000249": ["meh-ppv-gilch-monomer-pmc10810778"],
  "wop-000250": ["polyfluorene-yamamoto-us7947801"],
  "wop-000251": ["polycarbonate-interfacial-melt-ep1155737"],
  "wop-000252": ["polysulfone-membranes-family-review-2026"],
  "wop-000253": ["polyisoprene-neodymium-us20030187162"],
  "wop-000254": ["fluoropolymer-liang-molecules-2023"],
  "wop-000255": ["polyurethane-water-stable-catalysts-wo2008155569"],
  "wop-000256": ["polysiloxane-organohalosilane-hydrolysis-us6326452"],
  "wop-000257": ["sbc-family-synthesis-review-feng-2017"],
  "wop-000258": ["pc-abs-modifier-wo2009143223"],
  "wop-000259": ["cizek-ppe-styrene-blend-patent-1968"],
  "wop-000260": ["upvc-rigid-additive-package-us5077331"],
  "wop-000261": ["plasticizedpvc-lanxess-8026314", "plasticized-pvc-bovo-flexible-extrusion-processing-2024"],
  "wop-000262": ["fluoroelastomer-periyasamy-low-temperature-extrusion-2024"]
};

// Reuse canonical keys already established by the first migration slice. The
// BPA-PC and PDMS overrides also adopt that slice's exact repeat boundary and
// serialization so one registry record is shared rather than duplicated.
const sharedStructureAliases = {
  "polyethylene-unit": { key: "polyethylene-sru" },
  "ethylene-octene-unit": { key: "poly-1-octene-sru" },
  "polypropylene-unspecified-unit": { key: "polypropylene-unspecified-sru" },
  "polyvinyl-acetate-unit": { key: "polyvinyl-acetate-sru" },
  "polyacrylic-acid-unit": { key: "polyacrylic-acid-sru" },
  "polyvinyl-chloride-unit": { key: "polyvinyl-chloride-sru" },
  "polystyrene-unit": { key: "polystyrene-sru" },
  "polyacrylonitrile-unit": { key: "polyacrylonitrile-sru" },
  "polybutadiene-1-4-unspecified-unit": { key: "polybutadiene-1-4-sru" },
  "polybutyl-acrylate-unit": { key: "poly-n-butyl-acrylate-sru" },
  "polybutylene-terephthalate-unit": { key: "polybutylene-terephthalate-sru" },
  "nylon-12-unit": { key: "polyamide-12-sru" },
  "polydimethylsiloxane-unit": { key: "polydimethylsiloxane-sru", smiles: "[*][Si](C)(C)O[*]" },
  "polyethylene-oxide-unit": { key: "polyethylene-oxide-sru" },
  "poly-2-6-dimethylphenylene-ether-unit": { key: "poly-2-6-dimethyl-phenylene-ether-sru" },
  "bisphenol-a-polysulfone-unit": { key: "bisphenol-a-polysulfone-sru" },
  "polyethersulfone-unit": {
    key: "polyether-sulfone-sru",
    smiles: "[*]Oc1ccc(S(=O)(=O)c2ccc([*])cc2)cc1"
  },
  "polyphenylsulfone-unit": { key: "polyphenylsulfone-sru" },
  "peek-unit": { key: "polyether-ether-ketone-sru" },
  "polytetrafluoroethylene-unit": { key: "polytetrafluoroethylene-sru" },
  "hexafluoropropylene-unit": { key: "polyhexafluoropropylene-sru" },
  "perfluoromethyl-vinyl-ether-unit": { key: "poly-perfluoromethyl-vinyl-ether-sru" },
  "polychlorotrifluoroethylene-unit": { key: "polychlorotrifluoroethylene-sru" },
  "polyvinylidene-fluoride-unit": { key: "polyvinylidene-fluoride-sru" },
  "bisphenol-a-polycarbonate-unit": {
    key: "bisphenol-a-polycarbonate-sru",
    smiles: "[*]Oc1ccc(C(C)(C)c2ccc(OC(=O)[*])cc2)cc1"
  }
};

// Stereochemical corrections established by capping the wildcard bonds and
// matching the resulting residues to authoritative small-molecule records.
const reviewedSmilesByKey = {
  "cellulose-anhydroglucose-unit": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](O)[C@H]1O",
  "cellulose-monoacetate-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OC(=O)C)[C@H]1O",
  "cellulose-triacetate-unit": "[*]O[C@@H]1O[C@H](COC(=O)C)[C@@H]([*])[C@H](OC(=O)C)[C@H]1OC(=O)C",
  "cellulose-acetate-butyrate-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OC(=O)C)[C@H]1OC(=O)CCC",
  "cellulose-acetate-propionate-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OC(=O)C)[C@H]1OC(=O)CC",
  "cellulose-nitrate-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](O[N+](=O)[O-])[C@H]1O",
  "methyl-cellulose-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OC)[C@H]1O",
  "ethyl-cellulose-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OCC)[C@H]1O",
  "hydroxyethyl-cellulose-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OCCO)[C@H]1O",
  "hydroxypropyl-cellulose-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OCC(C)O)[C@H]1O",
  "hydroxypropyl-methylcellulose-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OC)[C@H]1OCC(C)O",
  "carboxymethyl-cellulose-motif": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](OCC(=O)O)[C@H]1O",
  "alpha-1-4-glucan-unit": "[*]O[C@H]1O[C@H](CO)[C@@H]([*])[C@H](O)[C@H]1O",
  "amylopectin-alpha-1-6-branch-motif": "[*]O[C@H]1O[C@H](CO[*])[C@@H](O[*])[C@H](O)[C@H]1O",
  "chitin-n-acetylglucosamine-unit": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](O)[C@H]1NC(=O)C",
  "chitosan-glucosamine-unit": "[*]O[C@@H]1O[C@H](CO)[C@@H]([*])[C@H](O)[C@H]1N",
  "sodium-mannuronate-unit": "[*]O[C@@H]1O[C@H](C(=O)[O-])[C@@H]([*])[C@H](O)[C@@H]1O.[Na+]",
  "sodium-guluronate-unit": "[*]O[C@@H]1O[C@@H](C(=O)[O-])[C@@H]([*])[C@H](O)[C@@H]1O.[Na+]",
  "agarose-galactose-residue-motif": "[*]O[C@@H]1O[C@H](CO)[C@H](O)[C@H](O[*])[C@H]1O",
  "agarose-3-6-anhydrogalactose-motif": "[*]O[C@@H]1O[C@H]2CO[C@@H]([C@@H]1O)[C@@H]2O[*]",
  "carrageenan-monosulfated-galactose-motif": "[*]O[C@@H]1O[C@H](CO)[C@H](OS(=O)(=O)[O-])[C@H](O[*])[C@H]1O.[Na+]",
  "carrageenan-disulfated-galactose-motif": "[*]O[C@@H]1O[C@H](COS(=O)(=O)[O-])[C@H](OS(=O)(=O)[O-])[C@H](O[*])[C@H]1O.[Na+].[Na+]",
  "carrageenan-trisulfated-galactose-motif": "[*]O[C@@H]1O[C@H](COS(=O)(=O)[O-])[C@H](OS(=O)(=O)[O-])[C@H](O[*])[C@H]1OS(=O)(=O)[O-].[Na+].[Na+].[Na+]",
  "poly-3-hydroxybutyrate-unit": "[*]O[C@H](C)CC(=O)[*]",
  "poly-3-hydroxyvalerate-unit": "[*]O[C@H](CC)CC(=O)[*]",
  "poly-3-hydroxyhexanoate-unit": "[*]O[C@H](CCC)CC(=O)[*]",
  "poly-l-lactide-unit": "[*]O[C@@H](C)C(=O)[*]",
  "poly-d-lactide-unit": "[*]O[C@H](C)C(=O)[*]",
  "pedot-neutral-unit": "[*]c1sc([*])c2c1OCCO2",
  "pamam-amidoamine-branching-motif": "[*]N(CCC(=O)NCCN[*])CCC(=O)NCCN[*]"
};

// These entries remain draft because the selected v1 locator is useful as a
// structural lead but does not itself substantiate every connection-table,
// stereochemical, substitution, or architecture choice encoded above. Keeping
// the status explicit prevents old `structureAndMorphology` mappings from
// being mistaken for completed depiction review during migration.
const draftWopIds = new Set([
  "wop-000134",
  "wop-000137",
  "wop-000138",
  "wop-000139",
  "wop-000140",
  "wop-000141",
  "wop-000142",
  "wop-000146",
  "wop-000147",
  "wop-000148",
  "wop-000150",
  "wop-000160",
  "wop-000172",
  "wop-000176",
  "wop-000181",
  "wop-000182",
  "wop-000205",
  "wop-000208",
  "wop-000209",
  "wop-000212",
  "wop-000213",
  "wop-000214",
  "wop-000215",
  "wop-000216",
  "wop-000217",
  "wop-000231",
  "wop-000232",
  "wop-000242",
  "wop-000243",
  "wop-000251",
  "wop-000253",
  "wop-000256",
  "wop-000262"
]);

export const structureSpecsB = Object.fromEntries(
  Object.entries(rawStructureSpecsB).map(([wopId, spec]) => {
    const items = spec.items.map((entry) => {
      const aliased = { ...entry, ...(sharedStructureAliases[entry.key] ?? {}) };
      return { ...aliased, smiles: reviewedSmilesByKey[aliased.key] ?? aliased.smiles };
    });
    return [
      wopId,
      {
        reviewStatus: draftWopIds.has(wopId) ? "draft" : "reviewed",
        sourceIds: [...(evidenceByWopId[wopId] ?? [])],
        ...spec,
        items
      }
    ];
  })
);

export default structureSpecsB;
