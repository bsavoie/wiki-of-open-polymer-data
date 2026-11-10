// Direct structural-depiction evidence for the reviewed B-slice migration records.
//
// Every locator below was checked against anonymously readable source content.
// These records support only the depicted connectivity, stereochemistry,
// architecture, and stated scope; they do not broaden the article prose.

const structuralSource = (record) => Object.freeze({
  ...record,
  accessedDate: "2026-08-31",
  accessStatus: "anonymous_full_content",
  reuseStatus: "publicly_accessible_citation_only",
  permissionBasis: "The complete source is anonymously readable; this record stores only a citation and a precise locator.",
  supports: ["structuralDepictions"]
});

const withSources = (...sources) => Object.freeze({
  sources,
  sourceIds: sources.map(({ sourceId }) => sourceId)
});

const withExistingSourceIds = (sourceIds, ...sources) => Object.freeze({
  sources,
  sourceIds: [...sourceIds, ...sources.map(({ sourceId }) => sourceId)]
});

const chebiSource = ({ id, slug, name, locator }) => structuralSource({
  sourceId: `chebi-${id}-${slug}`,
  lineageId: `chebi-${id}`,
  sourceType: "public_dataset",
  citation: `EMBL-EBI, Chemical Entities of Biological Interest (ChEBI), CHEBI:${id}, “${name}.”`,
  url: `https://www.ebi.ac.uk/chebi/CHEBI%3A${id}`,
  contentUrl: `https://www.ebi.ac.uk/chebi/backend/api/public/molfile/${id}`,
  locator
});

const labanaBenzoguanamine = structuralSource({
  sourceId: "labana-benzoguanamine-formaldehyde-crosslinkers-us4002699",
  lineageId: "us4002699-powder-coating-crosslinkers",
  sourceType: "patent",
  citation: "Santokh S. Labana and Yun Feng Chang, Powder Coating Composition with Hydroxy Functional Copolymer and Amino Functional Crosslinking Agent, US Patent 4,002,699 (1977).",
  url: "https://patents.google.com/patent/US4002699A/en",
  contentUrl: "https://patentimages.storage.googleapis.com/7d/de/6c/18a60a4f6771e3/US4002699.pdf",
  locator: "Detailed Description of the Invention, ‘Crosslinking Agent,’ paragraph beginning ‘Exemplary of the monomeric condensation reaction products’: dimethylolbenzoguanamine is directly listed as a formaldehyde/benzoguanamine condensation product, while the same paragraph separately identifies butylated benzoguanamine-formaldehyde resin as polymeric; this supports a representative methylolated benzoguanamine precursor and variable resin scope, not a unique cured-network repeat."
});

const naturalRubberChebi = chebiSource({
  id: 53406,
  slug: "natural-rubber",
  name: "natural rubber macromolecule",
  locator: "Entry definition, IUPAC name, and downloadable connection table: the macromolecule is composed of repeating (2Z)-2-methylbut-2-ene-1,4-diyl units; the molfile supplies the corresponding two-ended SRU connectivity and alkene geometry."
});

const rodgersPolybutadiene = structuralSource({
  sourceId: "rodgers-polybutadiene-microstructures-2004",
  lineageId: "wiley-rubber-compounding-2004",
  sourceType: "open_textbook",
  citation: "Brendan Rodgers, Walter H. Waddell, and William Klingensmith, “Rubber Compounding,” Encyclopedia of Polymer Science and Technology, Wiley, 2004.",
  doi: "10.1002/0471440264.pst328",
  url: "https://onlinelibrary.wiley.com/doi/10.1002/0471440264.pst328",
  contentUrl: "https://catalogimages.wiley.com/images/db/pdf/9781118766835.excerpt.pdf",
  locator: "Open excerpt, polybutadiene discussion and Table 7: cis-1,4, trans-1,4, and 1,2-vinyl polybutadiene structures are drawn and their grade-dependent proportions are tabulated."
});

const yamadaSbr = structuralSource({
  sourceId: "yamada-sbr-unit-structures-2023",
  lineageId: "yamada-functionalized-ssbr-thesis-2023",
  sourceType: "thesis",
  citation: "Chigusa Yamada, Influence of Functionalized S-SBR on Silica-Filled Rubber Compound Properties, doctoral dissertation, University of Twente, 2023.",
  doi: "10.3990/1.9789036556422",
  url: "https://ris.utwente.nl/ws/files/304340803/Chigusa_Yamada_Final.pdf",
  locator: "Chapter 2, Section 2.2.1 and Figure 2-4: SBR is represented with styrene, trans-1,4-, cis-1,4-, and 1,2-vinyl butadiene units; the adjacent discussion distinguishes E-SBR and S-SBR without fixing unit sequence or composition."
});

const sugamaXsbr = structuralSource({
  sourceId: "sugama-xsbr-terpolymer-structure-2023",
  lineageId: "sugama-xsbr-cement-composites-2023",
  sourceType: "open_journal",
  citation: "Toshifumi Sugama and Tatiana Pyatina, “Hydrophobic, Thermal Shock-and-Corrosion-Resistant XSBR Latex-Modified Lightweight Class G Cement Composites in Geothermal Well Energy Storage Systems,” Materials 16 (2023), 5792.",
  doi: "10.3390/ma16175792",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10489030/",
  locator: "Introduction, materials description, and Figure 1: the XSBR latex is identified and drawn as a styrene-butadiene-acrylic-acid terpolymer; the figure supports the three displayed constituent connectivities without assigning sequence or fraction."
});

const sheNbr = structuralSource({
  sourceId: "she-nbr-repeat-microstructures-2023",
  lineageId: "she-nbr-degradation-2023",
  sourceType: "open_journal",
  citation: "Congdong She, Fuping Zeng, Liangjun Dai, Long Li, Qiang Yao, and Ju Tang, “Degradation Behaviors and Mechanism of Nitrile Butadiene Rubber Caused by Insulating Medium C5F10O,” Polymers 15 (2023), 2282.",
  doi: "10.3390/polym15102282",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10223412/",
  locator: "Figure 6b and its discussion: the typical NBR repeat representation explicitly contains acrylonitrile-derived, 1,4-butadiene-derived, and 1,2-butadiene-derived connectivities; the text notes both butadiene addition modes."
});

const sukharevaHalobutyl = structuralSource({
  sourceId: "sukhareva-halobutyl-microstructures-2023",
  lineageId: "sukhareva-halobutyl-halogenation-2023",
  sourceType: "open_journal",
  citation: "Ksenia V. Sukhareva, Nikita R. Sukharev, Irina I. Levina, Peter O. Offor, and Anatoly A. Popov, “Solvent Swelling-Induced Halogenation of Butyl Rubber Using Polychlorinated N-Alkanes: Structure and Properties,” Polymers 15 (2023), 4137.",
  doi: "10.3390/polym15204137",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10610726/",
  locator: "Introduction plus Figure 1a-c: IIR, exo-methylene halobutyl, and endo-halomethyl structures are drawn with X = Cl, Br, or I; the text identifies exo-methylene units as the 70-90% principal microstructure and endo forms as minor."
});

const polychloropreneChebi = chebiSource({
  id: 53724,
  slug: "polychloroprene",
  name: "poly(chloroprene) macromolecule",
  locator: "Entry definition, IUPAC name, and downloadable connection table: the ideal macromolecule is composed of repeating (2Z)-2-chlorobut-2-ene-1,4-diyl units, with the Z double-bond geometry explicit in the molfile."
});

const deRooEpdm = structuralSource({
  sourceId: "de-roo-epdm-enb-structure-2021",
  lineageId: "de-roo-epdm-epoxidation-2021",
  sourceType: "open_journal",
  citation: "C. Maurits de Roo, Johann B. Kasper, Martin van Duin, Francesco Mecozzi, and Wesley R. Browne, “Off-line analysis in the manganese catalysed epoxidation of ethylene-propylene-diene rubber (EPDM) with hydrogen peroxide,” RSC Advances 11 (2021), 32505-32512.",
  doi: "10.1039/D1RA06222K",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9041766/",
  locator: "Figure 1 and adjacent text: EPDM is drawn with ethylene-, propylene-, and ENB-derived constituents; polymerization consumes the endocyclic ENB double bond while retaining exocyclic ethylidene unsaturation."
});

const mladenovicSilicone = structuralSource({
  sourceId: "mladenovic-polysiloxane-pdms-structure-2024",
  lineageId: "mladenovic-silicone-ophthalmology-review-2024",
  sourceType: "open_journal",
  citation: "Tamara Mladenovic, Fatima Zivic, Nenad Petrovic, Sasa Njezic, Jelena Pavic, Nikola Kotorcevic, Strahinja Milenkovic, and Nenad Grujovic, “Application of Silicone in Ophthalmology: A Review,” Materials 17 (2024), 3454.",
  doi: "10.3390/ma17143454",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11278226/",
  locator: "Section 2 and Figure 1: polysiloxanes are defined by an Si-O backbone with general -R2Si-O- units; the usual R examples listed are methyl, ethyl, propyl, phenyl, fluoroalkyl, aminoalkyl, hydroxy, mercapto, hydrogen, and vinyl, and PDMS is identified as the common linear -Me2SiO- representative."
});

const helTpv = structuralSource({
  sourceId: "hel-pp-epdm-tpv-architecture-2020",
  lineageId: "hel-tpv-morphology-2020",
  sourceType: "open_journal",
  citation: "C. L. Hel, V. Bounor-Legaré, M. Catherin, A. Lucas, A. Thèvenon, and P. Cassagnau, “TPV: A New Insight on the Rubber Morphology and Mechanic/Elastic Properties,” Polymers 12 (2020), 2315.",
  doi: "10.3390/polym12102315",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7601656/",
  locator: "Introduction and Experimental section: the investigated TPV is a dynamically vulcanized PP/EPDM system; the EPDM is specified as an ethylene/propylene/ENB terpolymer and the phase composition is reported without implying one covalent repeat for the blend."
});

const openstaxPolypropylene = structuralSource({
  sourceId: "openstax-polypropylene-tacticity",
  lineageId: "openstax-organic-chemistry",
  sourceType: "open_textbook",
  citation: "John McMurry, Organic Chemistry, OpenStax, 2023, Section 31.2, “Stereochemistry of Polymerization: Ziegler-Natta Catalysts.”",
  url: "https://openstax.org/books/organic-chemistry/pages/31-2-stereochemistry-of-polymerization-ziegler-natta-catalysts",
  locator: "Figure 31.2 and adjacent text: the methyl-substituted polypropylene backbone is drawn, and isotactic, syndiotactic, and atactic stereochemical relationships are distinguished; the supplement therefore leaves tacticity unspecified."
});

const hwangAramids = structuralSource({
  sourceId: "hwang-ppta-pmia-structures-2026",
  lineageId: "hwang-aramid-aerogels-2026",
  sourceType: "open_journal",
  citation: "Myeong Cheol Hwang, Yuto Yoshikawa, Ren Jianhua, Isao Tabata, Kazuhiko Kosuge, and Kazumasa Hirogaki, “Preparation mechanisms and characteristics of nanofiber aerogels derived from various aramid fibers,” Colloid and Polymer Science 304 (2026), 2395-2412.",
  doi: "10.1007/s00396-026-05662-1",
  url: "https://link.springer.com/article/10.1007/s00396-026-05662-1",
  locator: "Aramid-fiber comparison figure and accompanying materials discussion: the molecular structures of para-linked PPTA and meta-linked PMIA are drawn separately, supporting the two representative family cards."
});

const chinPbo = structuralSource({
  sourceId: "chin-nist-pbo-repeat-2006",
  lineageId: "nistir-7373-pbo-aging",
  sourceType: "public_report",
  citation: "Joannie Chin, Eric Byrd, Cyril Clerici, Mounira Oudina, Lipiin Sung, Amanda Forster, and Kirk Rice, Chemical and Physical Characterization of Poly(p-phenylene-2,6-benzobisoxazole) Fibers Used in Body Armor: Temperature and Humidity Aging, NISTIR 7373, National Institute of Standards and Technology, 2006.",
  url: "https://www.govinfo.gov/content/pkg/GOVPUB-C13-43b7798c55d7f15c4a59062fbf57d140/pdf/GOVPUB-C13-43b7798c55d7f15c4a59062fbf57d140.pdf",
  locator: "Report page 31, Figure 4: the complete bracketed poly(p-phenylene-2,6-benzobisoxazole) repeat is drawn with both fused oxazole rings and the para-phenylene connector."
});

const jiangPbzt = structuralSource({
  sourceId: "jiang-pbzt-repeat-1991",
  lineageId: "jiang-pbzt-carbon-fibers-1991",
  sourceType: "open_journal",
  citation: "H. Jiang, P. Desai, S. Kumar, and A. S. Abhiraman, “Carbon Fibers from Poly(p-Phenylene Benzobisthiazole) (PBZT) Fibers: Conversion and Morphological Aspects,” Carbon 29 (1991), 635-644.",
  url: "https://repository.gatech.edu/bitstreams/e09c6673-6e2a-425c-8f35-943a9b149f69/download",
  locator: "Article page 636, Figure 1: the complete bracketed PBZT repeat is drawn with the para-phenylene connector and both fused thiazole rings, including the opposed N/S heteroatom orientation."
});

const chitinChebi = chebiSource({
  id: 17029,
  slug: "chitin",
  name: "chitin",
  locator: "Entry definition, IUPAC name, and downloadable connection table: chitin is a beta-(1->4)-linked N-acetyl-D-glucosamine polymer; the molfile gives the stereochemical two-ended SRU."
});

const celluloseAcetateChebi = chebiSource({
  id: 145232,
  slug: "cellulose-acetate",
  name: "cellulose acetate",
  locator: "Entry definition and downloadable connection table: cellulose acetate is a glucan derivative in which some cellulose hydroxyl groups are replaced by acetyl groups; the record supports a substitution-variable glucan motif rather than one uniform exact repeat."
});

const agaroseChebi = chebiSource({
  id: 2511,
  slug: "agarose",
  name: "agarose",
  locator: "Entry definition, IUPAC name, and downloadable connection table: agarose alternates D-galactose and 3,6-anhydro-alpha-L-galactopyranose residues with alpha-(1->3) and beta-(1->4) linkages; the curated molfile contains the explicit SRU and stereochemistry."
});

const kappaCarrageenanChebi = chebiSource({
  id: 10583,
  slug: "kappa-carrageenan",
  name: "κ-carrageenan",
  locator: "Entry IUPAC name and downloadable connection table: the ideal repeat is (1->4)-3,6-anhydro-alpha-D-galactopyranosyl-(1->3)-4-O-sulfonato-beta-D-galactopyranan; the molfile supplies the sulfate position, glycosidic linkages, and residue stereochemistry."
});

const iotaCarrageenanChebi = chebiSource({
  id: 37168,
  slug: "iota-carrageenan",
  name: "ι-carrageenan",
  locator: "Entry IUPAC name and downloadable connection table: the ideal repeat is (1->4)-3,6-anhydro-2-O-sulfonato-alpha-D-galactopyranosyl-(1->3)-4-O-sulfonato-beta-D-galactopyranan; the molfile supplies both sulfate positions, glycosidic linkages, and residue stereochemistry."
});

const lambdaCarrageenanChebi = chebiSource({
  id: 37167,
  slug: "lambda-carrageenan",
  name: "λ-carrageenan",
  locator: "Entry IUPAC name and downloadable connection table: the ideal repeat is (1->4)-2,6-di-O-sulfonato-alpha-D-galactopyranosyl-(1->3)-2-O-sulfonato-beta-D-galactopyranan; the molfile supplies all three sulfate positions, glycosidic linkages, and residue stereochemistry."
});

const tvaroskaCollagen = structuralSource({
  sourceId: "tvaroska-collagen-gly-pro-hyp-motif-2024",
  lineageId: "tvaroska-benito-collagen-glycosylation-review-2024",
  sourceType: "open_journal",
  citation: "Igor Tvaroška and Juan M. Benito, “Glycosylation Modulates the Structure and Functions of Collagen: A Review,” Molecules 29 (2024), 1417.",
  doi: "10.3390/molecules29071417",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11012932/",
  locator: "Section 2.1, ‘The Primary Structure,’ and Figure 1a-b: every collagen type is described by a repeating Xaa-Yaa-Gly motif with variable Xaa and Yaa residues; Pro-Hyp-Gly is identified as the most frequent triplet, and the figure uses a (Gly-Pro-Hyp)10 collagen model. This supports Gly-Pro-Hyp only as an explicitly representative finite motif, not a universal exact collagen repeat."
});

const zhouSilk = structuralSource({
  sourceId: "zhou-bombyx-fibroin-gagags-2000",
  lineageId: "zhou-bombyx-fibroin-gene-2000",
  sourceType: "open_journal",
  citation: "C. Z. Zhou et al., “Fine organization of Bombyx mori fibroin heavy chain gene,” Nucleic Acids Research 28 (2000), 2413-2419.",
  doi: "10.1093/nar/28.12.2413",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC102737/",
  locator: "Results and Figure 2: the Bombyx mori fibroin heavy-chain sequence contains 432 copies of the Gly-Ala-Gly-Ala-Gly-Ser motif; the supplement depicts that finite peptide segment rather than a complete protein repeat."
});

const jiangPha = structuralSource({
  sourceId: "jiang-pha-r-3-hydroxyalkanoate-structures-2016",
  lineageId: "jiang-pha-biorefineries-review-2016",
  sourceType: "open_journal",
  citation: "Guozhan Jiang, David Hill, Marek Kowalczuk, Brian Johnston, Grazyna Adamus, Victor Irorere, and Iza Radecka, “Carbon Sources for Polyhydroxyalkanoates and an Integrated Biorefinery,” International Journal of Molecular Sciences 17 (2016), 1157.",
  doi: "10.3390/ijms17071157",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4964529/",
  locator: "Figure 1 and accompanying text: the general PHA repeat is drawn with (R) configuration; its side-chain R is bounded at up to 18 carbon atoms, x spans 1-3, and the figure explicitly gives CH3 with x = 1 for P3HB and C2H5 with x = 1 for P3HV."
});

const phbChebi = chebiSource({
  id: 131525,
  slug: "poly-r-3-hydroxybutyrate",
  name: "poly[(R)-3-hydroxybutyrate] macromolecule",
  locator: "Entry definition, IUPAC name, and downloadable connection table: the macromolecule consists of repeating (R)-3-hydroxybutyrate units; the molfile makes the R stereocenter and polyester linkage explicit."
});

const naserPhbv = structuralSource({
  sourceId: "naser-phbv-repeat-structures-2021",
  lineageId: "naser-pla-pha-review-2021",
  sourceType: "open_journal",
  citation: "A. Z. Naser, I. Deiab, and B. M. Darras, “Poly(lactic acid) (PLA) and polyhydroxyalkanoates (PHAs), green alternatives to petroleum-based plastics: a review,” RSC Advances 11 (2021), 17151-17196.",
  doi: "10.1039/D1RA02390J",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9033233/",
  locator: "Figures 36 and 37 and adjacent PHBV discussion: PHB and PHV polyester repeat connectivities are shown as the two PHBV constituents, and 3HV content is treated as variable rather than a fixed sequence."
});

const tangPhbhhx = structuralSource({
  sourceId: "tang-phbhhx-repeat-structure-2022",
  lineageId: "tang-phbhhx-review-2022",
  sourceType: "open_journal",
  citation: "Hui Jia Tang, Soon Zher Neoh, and Kumar Sudesh, “A review on poly(3-hydroxybutyrate-co-3-hydroxyhexanoate) [P(3HB-co-3HHx)] and genetic modifications that affect its production,” Frontiers in Bioengineering and Biotechnology 10 (2022), 1057067.",
  doi: "10.3389/fbioe.2022.1057067",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9760699/",
  locator: "Figure 3 and adjacent text: P(3HB-co-3HHx) is drawn and named as a copolymer of (R)-3-hydroxybutyrate and (R)-3-hydroxyhexanoate, supporting both unit connectivities and stereocenters without fixing sequence or composition."
});

const pllaChebi = chebiSource({
  id: 53408,
  slug: "poly-l-lactic-acid",
  name: "poly[(S)-lactic acid] macromolecule",
  locator: "Entry definition, IUPAC name, and downloadable connection table: the macromolecule consists of repeating (S)-lactate units and the molfile makes the polyester linkage and stereocenter explicit."
});

const pdlaChebi = chebiSource({
  id: 53409,
  slug: "poly-d-lactic-acid",
  name: "poly[(R)-lactic acid] macromolecule",
  locator: "Entry definition, IUPAC name, and downloadable connection table: the macromolecule consists of repeating (R)-lactate units and the molfile makes the polyester linkage and stereocenter explicit."
});

const hardtPdadmac = structuralSource({
  sourceId: "hardt-pdadmac-repeat-structure-2024",
  lineageId: "hardt-pdadmac-surfactants-2024",
  sourceType: "open_journal",
  citation: "Michael Hardt et al., “Photoresponsive arylazopyrazole surfactant/PDADMAC mixtures: reversible control of bulk and interfacial properties,” Nanoscale 16 (2024), 9975-9984.",
  doi: "10.1039/D3NR05414D",
  url: "https://pubs.rsc.org/en/content/articlehtml/2024/nr/d3nr05414d",
  locator: "Figure 1 and its caption: PDADMAC is drawn as a cyclopolymerized dimethylpyrrolidinium backbone with chloride counterion; the single unit does not assign ring-junction stereochemistry or solution conformation."
});

const zhaoPei = structuralSource({
  sourceId: "zhao-linear-branched-pei-structures-2022",
  lineageId: "zhao-pei-drug-delivery-review-2022",
  sourceType: "open_journal",
  citation: "Chang Zhao and Bo Zhou, “Polyethyleneimine-Based Drug Delivery Systems for Cancer Theranostics,” Journal of Functional Biomaterials 14 (2022), 12.",
  doi: "10.3390/jfb14010012",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9862060/",
  locator: "Introduction and Figure 1: linear and branched PEI structures are drawn; the text specifies secondary amines in linear PEI and primary, secondary, and tertiary amines in branched PEI, supporting a linear unit and a schematic tertiary branch junction."
});

const songPolyaniline = structuralSource({
  sourceId: "song-polyaniline-oxidation-state-structures-2013",
  lineageId: "song-polyaniline-nanowire-review-2013",
  sourceType: "open_journal",
  citation: "Edward Song and Jin-Woo Choi, “Conducting Polyaniline Nanowire and Its Applications in Chemiresistive Sensing,” Nanomaterials 3 (2013), 498-523.",
  doi: "10.3390/nano3030498",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5304646/",
  locator: "Section 2 and Figure 1: generalized, fully reduced, half-oxidized, and fully oxidized polyaniline structures are distinguished; the supplement intentionally depicts only the neutral reduced benzenoid amine motif and qualifies other oxidation/protonation states as omitted."
});

const polypyrroleChebi = chebiSource({
  id: 53263,
  slug: "polypyrrole",
  name: "polypyrrole macromolecule",
  locator: "Entry definition, IUPAC name, and downloadable connection table: the macromolecule consists of pyrrole-2,5-diyl units; the molfile supplies the neutral two-ended 2,5-linked pyrrole connectivity."
});

const openstaxPolycarbonate = structuralSource({
  sourceId: "openstax-bisphenol-a-polycarbonate",
  lineageId: "openstax-organic-chemistry",
  sourceType: "open_textbook",
  citation: "John McMurry, Organic Chemistry, OpenStax, 2023, Section 31.4, “Step-Growth Polymers.”",
  url: "https://openstax.org/books/organic-chemistry/pages/31-4-step-growth-polymers",
  locator: "Polycarbonate reaction figure and adjacent text: bisphenol A and diphenyl carbonate are mapped to the aromatic BPA-polycarbonate repeat; this supports BPA-PC as a representative and not as the sole possible polycarbonate family structure."
});

const cruzMoralesPolyisoprene = structuralSource({
  sourceId: "cruz-morales-polyisoprene-microstructures-2023",
  lineageId: "cruz-morales-synthetic-polyisoprene-review-2023",
  sourceType: "open_journal",
  citation: "José A. Cruz-Morales, C. Gutiérrez-Flores, D. Zárate-Saldaña, M. Burelo, H. García-Ortega, and S. Gutiérrez, “Synthetic Polyisoprene Rubber as a Mimic of Natural Rubber: Recent Advances on Synthesis, Nanocomposites, and Applications,” Polymers 15 (2023), 4074.",
  doi: "10.3390/polym15204074",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10610710/",
  locator: "Figure 1 and introductory microstructure discussion: cis-1,4-, trans-1,4-, 1,2-, and 3,4-polyisoprene connectivities are distinguished; the supplement selects the cis/trans 1,4 pair and explicitly does not exhaust the family."
});

const oecdFluoroelastomers = structuralSource({
  sourceId: "oecd-fluoroelastomer-fact-card-2022",
  lineageId: "oecd-pfas-fact-cards-2022",
  sourceType: "public_report",
  citation: "Organisation for Economic Co-operation and Development, Fact Cards of Major Groups of Per- and Polyfluoroalkyl Substances (PFASs), ENV/CBC/MONO(2022)1, 2022.",
  url: "https://one.oecd.org/document/env/cbc/mono%282022%291/en/pdf",
  locator: "Fact Card 14, “Fluoroelastomers,” exemplary-structure figure and accompanying definitions: FKM is exemplified by VDF/HFP, FFKM by TFE/perfluoro(methyl vinyl ether), and FEPM by TFE/propylene; the fact card treats these as architectures rather than fixed sequences or compositions."
});

export const evidence = {
  "wop-000121": withSources(labanaBenzoguanamine),
  "wop-000134": withSources(naturalRubberChebi),
  "wop-000137": withSources(rodgersPolybutadiene),
  "wop-000138": withSources(yamadaSbr),
  "wop-000139": withSources(yamadaSbr),
  "wop-000140": withSources(yamadaSbr),
  "wop-000141": withSources(sugamaXsbr),
  "wop-000142": withSources(sheNbr),
  "wop-000146": withSources(sukharevaHalobutyl),
  "wop-000147": withSources(sukharevaHalobutyl),
  "wop-000148": withSources(polychloropreneChebi),
  "wop-000150": withSources(deRooEpdm),
  "wop-000160": withSources(mladenovicSilicone),
  "wop-000172": withExistingSourceIds(
    ["tpv-dynamic-vulcanization-chemistry-lehel-2020"],
    deRooEpdm,
    openstaxPolypropylene
  ),
  "wop-000176": withSources(hwangAramids),
  "wop-000181": withSources(chinPbo),
  "wop-000182": withExistingSourceIds(["pbzt-carbon-fiber-precursor-morphology-study-1991"]),
  "wop-000189": withExistingSourceIds(
    ["cellulose-acetate-secondary-alcoholysis-patent"],
    celluloseAcetateChebi
  ),
  "wop-000205": withSources(chitinChebi),
  "wop-000208": withSources(agaroseChebi),
  "wop-000209": withSources(kappaCarrageenanChebi, iotaCarrageenanChebi, lambdaCarrageenanChebi),
  "wop-000211": withSources(tvaroskaCollagen),
  "wop-000212": withSources(zhouSilk),
  "wop-000213": withSources(jiangPha),
  "wop-000214": withSources(phbChebi),
  "wop-000215": withSources(naserPhbv, jiangPha),
  "wop-000216": withExistingSourceIds(["phbhhx-tang-neoh-sudesh-review-2022"]),
  "wop-000217": withSources(pllaChebi, pdlaChebi),
  "wop-000231": withSources(hardtPdadmac),
  "wop-000232": withSources(zhaoPei),
  "wop-000242": withSources(songPolyaniline),
  "wop-000243": withSources(polypyrroleChebi),
  "wop-000251": withSources(openstaxPolycarbonate),
  "wop-000253": withSources(cruzMoralesPolyisoprene),
  "wop-000256": withSources(mladenovicSilicone),
  "wop-000262": withSources(oecdFluoroelastomers)
};

export const unresolved = {};

export default evidence;
