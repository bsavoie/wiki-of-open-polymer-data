// Structural-depiction evidence supplement for draft records wop-000003–wop-000070.
//
// These records are intentionally independent of article prose sources. Each source
// directly supports the depicted connection table(s) and the representation scope.

const structuralSource = ({ licenseUrl, ...record }) => Object.freeze({
  ...record,
  accessedDate: "2026-08-31",
  accessStatus: "anonymous_full_content",
  reuseStatus: licenseUrl ? "open_licensed" : "publicly_accessible_citation_only",
  permissionBasis: licenseUrl
    ? "The complete source is anonymously readable under the stated open license; only a citation and precise locator are stored here."
    : "The complete source is anonymously readable; this record stores only a citation and a precise locator.",
  ...(licenseUrl ? { licenseUrl } : {}),
  supports: ["structuralDepictions"]
});

const songPolyolefins = structuralSource({
  sourceId: "song-polyolefin-representations-2026",
  lineageId: "song-polyolefin-representations-2026",
  sourceType: "open_journal",
  citation: "Jiayi Song, Shan Ye, Rongjuan Cong, Shoupeng Qiao, Linge Ma, and Shuai Shao, “Advanced representations and generative artificial intelligence for polyolefins,” Clean Energy 10 (2026), 136–156.",
  doi: "10.1093/ce/zkag032",
  url: "https://academic.oup.com/ce/article/10/4/136/8713843",
  contentUrl: "https://oup.silverchair-cdn.com/article-minimal/8713843",
  locator: "Section 2.1.1, Figure 1, and Table 2: attachment-point representations for polyethylene, polypropylene, ethylene–vinyl acetate, ethylene–1-butene, and an experimentally characterized ethylene–1-octene copolymer; the surrounding text states the ensemble information those unit drawings omit."
});

const galassoLldpe = structuralSource({
  sourceId: "galasso-lldpe-comonomer-review-2025",
  lineageId: "galasso-lldpe-comonomer-review-2025",
  sourceType: "open_journal",
  citation: "Gianluigi Galasso, Roberta Cipullo, Vincenzo Busico, and Antonio Vittoria, “Comonomer Reactivity Trends in Catalytic Ethene/1-Alkene Copolymerizations to Linear Low-Density Polyethylene,” Polymers 17 (2025), 2290.",
  doi: "10.3390/polym17172290",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12431525/",
  locator: "Introduction and Section 2: LLDPE is described as ethene copolymerized with a minor 1-alkene fraction, including 1-butene, 1-hexene, and 1-octene, which creates short-chain branches whose identity and distribution vary."
});

const mdpePatent = structuralSource({
  sourceId: "biswas-mdpe-family-scope-us11492468",
  lineageId: "biswas-polyethylene-compositions-us11492468",
  sourceType: "patent",
  citation: "Sanjib Biswas et al., “Polyethylene compositions,” US 11,492,468 B2, 2022.",
  url: "https://patents.google.com/patent/US11492468B2/en",
  locator: "Detailed description, definition of MDPE: MDPE may be an ethylene homopolymer or an ethylene–alpha-olefin copolymer; the listed comonomers, density interval, and gas-, solution-, and slurry-phase routes establish why branching and comonomer identity are grade dependent."
});

const vldpePatent = structuralSource({
  sourceId: "smith-vldpe-family-scope-us5032463",
  lineageId: "smith-vldpe-film-patent-us5032463",
  sourceType: "patent",
  citation: "Edwin R. Smith, “Very low density polyethylene film from blends,” US 5,032,463 A, 1991.",
  url: "https://patents.google.com/patent/US5032463A/en",
  locator: "Detailed description, paragraphs defining VLDPE as an ethylene copolymer with an alpha-olefin such as 1-butene, 1-hexene, or 1-octene and describing the VLDPE density class; this supports 1-octene as representative rather than universal."
});

const polypropylenePatent = structuralSource({
  sourceId: "asanuma-polypropylene-family-scope-us5098967",
  lineageId: "mitsubishi-pp-hydrogen-control-patent",
  sourceType: "patent",
  citation: "Tadashi Asanuma, Ichiro Fujio, and Nobutaka Uchikawa, “Method of controlling the molecular weight of polypropylene,” US 5,098,967 A, 1992.",
  url: "https://patents.google.com/patent/US5098967A/en",
  locator: "Description, Technical Field and Detailed Description: polypropylene expressly includes propylene homopolymer and propylene copolymers, with ethylene listed among the copolymerizable alpha-olefins."
});

const openstaxTacticity = structuralSource({
  sourceId: "openstax-polypropylene-tacticity",
  lineageId: "openstax-organic-chemistry",
  sourceType: "open_textbook",
  citation: "John McMurry, Organic Chemistry, OpenStax, 2023, Section 31.2, “Stereochemistry of Polymerization: Ziegler–Natta Catalysts.”",
  url: "https://openstax.org/books/organic-chemistry/pages/31-2-stereochemistry-of-polymerization-ziegler-natta-catalysts",
  locator: "Figure 31.2 and adjacent text: polypropylene is drawn and defined as isotactic when successive methyl substituents have the same stereochemical relationship and syndiotactic when that relationship alternates; atactic material is distinguished explicitly."
});

const wangPolybutene = structuralSource({
  sourceId: "wang-polybutene-structure-thesis-2022",
  lineageId: "wang-polybutene-crystallization-thesis-2022",
  sourceType: "thesis",
  citation: "Wei Wang, “Novel aspects in the crystallization of polybutene-1,” doctoral thesis, Università degli Studi di Genova, 2022.",
  url: "https://tesidottorato.depositolegale.it/handle/20.500.14242/125457",
  contentUrl: "https://iris.unige.it/bitstream/11567/1070276/4/phdunige_4603898.pdf",
  locator: "Thesis page 15, Section 2.2 and Figure 2.8: 1-butene and the corresponding poly(1-butene) chain structure are shown; the discussion separately treats tacticity and crystalline polymorphs."
});

const hongPolynorbornene = structuralSource({
  sourceId: "hong-polynorbornene-structure-thesis-2015",
  lineageId: "hong-polynorbornene-membrane-thesis-2015",
  sourceType: "thesis",
  citation: "Eunice Koheun Hong, “Siloxane and Silane-functionalized Polynorbornenes as Membranes for Passive Carbon Dioxide Separation,” master’s thesis, University of Tennessee, Knoxville, 2015.",
  url: "https://voljournals.utk.edu/utk_gradthes/3585/",
  contentUrl: "https://trace.tennessee.edu/server/api/core/bitstreams/71cf04f5-3532-4d35-96f8-895b8d4bf420/content",
  locator: "Thesis page 10, Section 2.1 and Figure 2.1: norbornene polymerization routes are compared; vinyl addition consumes the double bond while retaining the bicyclic ring, unlike the ring-opened product."
});

const burroughsCyclicOlefins = structuralSource({
  sourceId: "burroughs-polycycloolefin-scope-2021",
  lineageId: "burroughs-polycycloolefin-conference-2021",
  sourceType: "institutional_reference",
  citation: "Justin Burroughs, “The synthesis of polycycloolefins through vinyl-addition polymerization,” ACS Spring Meeting, 2021.",
  url: "https://acs.digitellinc.com/p/s/the-synthesis-of-polycycloolefins-through-vinyl-addition-polymerization-54491",
  locator: "Public presentation abstract and structure graphic: ring-opening metathesis and vinyl-addition routes are contrasted; norbornene, cyclopentene derivatives, and cyclic allenes of multiple ring sizes establish the broader cyclic-monomer scope."
});

const wangEva = structuralSource({
  sourceId: "wang-eva-random-copolymer-2019",
  lineageId: "wang-eva-random-copolymer-2019",
  sourceType: "open_journal",
  citation: "Ke Wang and Qibo Deng, “The Thermal and Mechanical Properties of Poly(ethylene-co-vinyl acetate) Random Copolymers and Their Covalently Crosslinked Analogues,” Polymers 11 (2019), 1055.",
  doi: "10.3390/polym11061055",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6631310/",
  locator: "Figure 1 and Introduction: the ethylene and vinyl-acetate repeat-unit chemistry of the random copolymer is drawn, and vinyl-acetate content and optional covalent crosslinking are treated as separate variables."
});

const venkateshEaa = structuralSource({
  sourceId: "venkatesh-eaa-structure-thesis-2020",
  lineageId: "venkatesh-eaa-nanocellulose-thesis-2020",
  sourceType: "thesis",
  citation: "Abhijit Venkatesh, “Melt-processing and properties of thermoplastic composites based on ethylene-acrylic acid copolymer reinforced with wood nanocellulose,” doctoral thesis, Chalmers University of Technology, 2020.",
  url: "https://research.chalmers.se/publication/520986",
  contentUrl: "https://research.chalmers.se/publication/520986/file/520986_Fulltext.pdf",
  locator: "Thesis pages 4–5, Section 1.3 and Figure 4: EAA is identified as a random copolymer with an ethylene backbone and acrylic-acid carboxyl substituents; examples with different acid contents establish composition variability."
});

const alamEaaIonomer = structuralSource({
  sourceId: "alam-eaa-ionomer-structures-2012",
  lineageId: "alam-lithium-eaa-ionomers-2012",
  sourceType: "open_journal",
  citation: "Todd M. Alam et al., “Heterogeneous Coordination Environments in Lithium-Neutralized Ionomers Identified Using Hydrogen-1 and Lithium-7 MAS NMR,” Materials 5 (2012), 1508–1527.",
  doi: "10.3390/ma5081508",
  url: "https://www.mdpi.com/1996-1944/5/8/1508",
  locator: "Chart 1 and the accompanying materials description: unneutralized and lithium-neutralized poly(ethylene-co-acrylic acid) structures are shown for precise and pseudo-random acid-group spacing, supporting the ionomer qualification without assigning a counterion to unneutralized EAA."
});

const aliEmaa = structuralSource({
  sourceId: "ali-emaa-copolymer-structure-2019",
  lineageId: "ali-emaa-film-blends-2019",
  sourceType: "open_journal",
  citation: "Sarmad Ali et al., “Preparation of Polyethylene and Ethylene/Methacrylic Acid Copolymer Blend Films with Tunable Surface Properties through Manipulating Processing Parameters during Film Blowing,” Polymers 11 (2019), 1565.",
  doi: "10.3390/polym11101565",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6836035/",
  locator: "Scheme 1 and Sections 2.1–2.2: the unneutralized ethylene–methacrylic-acid copolymer connectivity is drawn and the acid content of the studied EMAA is stated; no tactic sequence or counterion is assigned."
});

const openlearnRepeatUnits = structuralSource({
  sourceId: "openlearn-polymer-repeat-units",
  lineageId: "openlearn-introduction-to-polymers",
  sourceType: "courseware",
  citation: "The Open University, “Introduction to polymers: 2.2 Chain repeat units,” OpenLearn.",
  url: "https://www.open.edu/openlearn/science-maths-technology/chemistry/introduction-polymers/content-section-2.2",
  locator: "Table 3 and adjacent explanation: repeat units are shown for polyethylene, polypropylene, poly(vinyl chloride), poly(vinyl fluoride), PA6, and PA66, with open chain bonds and the substituent retained from each vinyl monomer."
});

const openstaxVinylPolymers = structuralSource({
  sourceId: "openstax-vinyl-polymer-repeat-units",
  lineageId: "openstax-organic-chemistry",
  sourceType: "open_textbook",
  citation: "John McMurry, Organic Chemistry, OpenStax, 2023, Section 8.10, “Radical Additions to Alkenes: Chain-Growth Polymers.”",
  url: "https://openstax.org/books/organic-chemistry/pages/8-10-radical-additions-to-alkenes-chain-growth-polymers",
  locator: "Table 8.1, Worked Example 8.4, and the adjacent construction rule: vinyl acetate, vinyl chloride, acrylonitrile, and methyl methacrylate are mapped to their polymers by replacing the monomer double bond with the carbon–carbon polymer backbone while retaining substituents."
});

const epaPvdc = structuralSource({
  sourceId: "epa-pvdc-homopolymer-structure-1977",
  lineageId: "epa-560-6-77-033-vdc-market-study",
  sourceType: "public_report",
  citation: "M. Lynne Neufeld, Marcus Sittenfield, Marcia J. Plotkin, Kathryn F. Wolk, and Robert E. Boyd, Market Input/Output Studies, Task I: Vinylidene Chloride, EPA-560/6-77-033, U.S. Environmental Protection Agency, 1977.",
  url: "https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=9101377C.TXT",
  locator: "Section 2.3.1.1, “Structure,” page 46 and Figure 2-1: PVDC is shown as the head-to-tail vinylidene-chloride homopolymer with the repeating carbon–carbon backbone unit bearing two chlorines on one carbon; commercial VDC copolymers are discussed separately."
});

const iupacAcrylicPolymer = structuralSource({
  sourceId: "iupac-acrylic-polymer-gold-book-2025",
  lineageId: "iupac-gold-book-fifth-edition",
  sourceType: "nomenclature_standard",
  citation: "International Union of Pure and Applied Chemistry, “acrylic polymer,” Compendium of Chemical Terminology, 5th ed., 2025.",
  doi: "10.1351/goldbook.15244",
  url: "https://goldbook.iupac.org/terms/view/15244",
  locator: "Definition, notes, and structure: the constitutional unit is given in general form with acid, ester, nitrile, and amide substituents and with hydrogen or alkyl at the alpha position; the displayed examples include the corresponding exact PAA, PMMA, PAN, and polyacrylamide cases."
});

const iupacPolyvinylAcetal = structuralSource({
  sourceId: "iupac-polyvinyl-acetal-gold-book-2025",
  lineageId: "iupac-gold-book-fifth-edition",
  sourceType: "nomenclature_standard",
  citation: "International Union of Pure and Applied Chemistry, “polyvinyl acetal,” Compendium of Chemical Terminology, 5th ed., 2025.",
  doi: "10.1351/goldbook.15256",
  url: "https://goldbook.iupac.org/terms/view/15256",
  locator: "Definition, notes, structure, and examples: polyvinyl acetals are formed by acetalizing PVA with an aldehyde; intrachain formal and butyral acetal examples are drawn, and common products are qualified as retaining a low fraction of unreacted hydroxy groups."
});

const fitaihiPva = structuralSource({
  sourceId: "fitaihi-pva-structure-thesis-2023",
  lineageId: "fitaihi-ocular-microneedles-thesis-2023",
  sourceType: "thesis",
  citation: "Rawan A. Fitaihi, “Design and Development of Particle-Loaded Ocular Microneedle Arrays Prepared Using 3D Printing,” doctoral thesis, University College London, 2023.",
  url: "https://discovery.ucl.ac.uk/id/eprint/10168206/",
  contentUrl: "https://discovery.ucl.ac.uk/10168206/1/Thesis%20RF%20final%20submission.pdf",
  locator: "Thesis page 59, Section 2.1.1 and Figure 2-1: fully hydrolyzed PVA is drawn as the hydroxyl-bearing vinyl unit, while partially hydrolyzed PVA is drawn with residual acetate-bearing units."
});

const samidePvb = structuralSource({
  sourceId: "samide-pvb-three-unit-structure-2020",
  lineageId: "samide-pvb-copper-coating-2020",
  sourceType: "open_journal",
  citation: "Adriana Samide, Claudia Merisanu, Bogdan Tutunaru, and Gabriela Eugenia Iacobescu, “Poly(vinyl butyral-co-vinyl alcohol-co-vinyl acetate) Coating Performance on Copper Corrosion in Saline Environment,” Molecules 25 (2020), 439.",
  doi: "10.3390/molecules25030439",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7037414/",
  locator: "Figure 4 and the accompanying molecular-formula discussion: the intrachain butyral acetal, residual vinyl-alcohol, and residual vinyl-acetate motifs are shown together and their nonstoichiometric proportions are described."
});

const inceogluSan = structuralSource({
  sourceId: "inceoglu-san-copolymer-structure-2013",
  lineageId: "inceoglu-san-pmma-blends-2013",
  sourceType: "open_journal",
  citation: "Sebnem Inceoglu, Nicholas P. Young, Andrew J. Jackson, Steven R. Kline, Stéphane Costeux, and Nitash P. Balsara, “Effect of Supercritical Carbon Dioxide on the Thermodynamics of Model Blends of Styrene-Acrylonitrile Copolymer and Poly(methyl methacrylate) Studied by Small-Angle Neutron Scattering,” Macromolecules 46 (2013), 6345–6356.",
  doi: "10.1021/ma401090q",
  url: "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913991",
  locator: "Scheme 1a and Experimental section, pages 6345–6349: SAN is drawn with styrene- and acrylonitrile-derived repeat units; composition is measured while the detailed sequence distribution is not assigned."
});

const dorrSma = structuralSource({
  sourceId: "dorr-sma-structure-review-2016",
  lineageId: "dorr-sma-membrane-review-2016",
  sourceType: "open_journal",
  citation: "Jonas M. Dörr et al., “The styrene–maleic acid copolymer: a versatile tool in membrane research,” European Biophysics Journal 45 (2016), 3–21.",
  doi: "10.1007/s00249-015-1093-y",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4698303/",
  locator: "Figure 2 and Section “Copolymers of styrene and maleic acid/anhydride”: the styrene–maleic-anhydride precursor connectivity is drawn, conversion to the acid is distinguished, and copolymer composition is treated as variable."
});

const samynSma = structuralSource({
  sourceId: "samyn-sma-sequence-scope-2014",
  lineageId: "samyn-sma-film-morphology-2014",
  sourceType: "open_journal",
  citation: "Pieter Samyn and Gustaaf Schoukens, “Morphologies and Thermal Variability of Patterned Polymer Films with Poly(styrene-co-maleic anhydride),” Polymers 6 (2014), 820–845.",
  doi: "10.3390/polym6030820",
  url: "https://www.mdpi.com/2073-4360/6/3/820",
  locator: "Section 2.1 and the molecular-structure discussion: commercial SMA grades with different maleic-anhydride contents are compared, and alternating, semi-alternating, and nonalternating segment distributions are distinguished."
});

const rosaPanFibers = structuralSource({
  sourceId: "rosa-pan-fiber-structure-scope-2024",
  lineageId: "rosa-acrylic-fabric-review-2024",
  sourceType: "open_journal",
  citation: "Raphael Palucci Rosa, Giuseppe Rosace, and Valentina Trovato, “Recent Advancements in Acrylic Fabric Applications: A Comprehensive Review and Future Trends,” Polymers 16 (2024), 2111.",
  doi: "10.3390/polym16152111",
  url: "https://www.mdpi.com/2073-4360/16/15/2111",
  locator: "Introduction and Figure 2: the acrylonitrile unit is written as the nitrile-substituted carbon–carbon backbone unit; homopolymer PAN is distinguished from acrylic-fiber copolymers containing other vinyl units."
});

const kawanoAcrylateNetworks = structuralSource({
  sourceId: "kawano-alkyl-acrylate-networks-2023",
  lineageId: "kawano-polyacrylate-networks-2023",
  sourceType: "open_journal",
  citation: "Yutaro Kawano, Hiroshi Masai, Shintaro Nakagawa, Naoko Yoshie, and Jun Terao, “Effects of Alkyl Ester Chain Length on the Toughness of PolyAcrylate-Based Network Materials,” Polymers 15 (2023), 2389.",
  doi: "10.3390/polym15102389",
  url: "https://www.mdpi.com/2073-4360/15/10/2389",
  locator: "Abstract, Figure 1, and Section 2.2: methyl-, ethyl-, and n-butyl-acrylate networks are prepared with a separate diacrylate crosslinker, supporting the family side-chain variability and the statement that crosslinking is an optional architecture rather than part of either linear repeat unit."
});

const liPolyesters = structuralSource({
  sourceId: "li-polyester-repeat-structures-thesis-2018",
  lineageId: "li-polyester-dyeing-thesis-2018",
  sourceType: "thesis",
  citation: "Shengyu Li, “Low Temperature Dyeing of Polyester Fibres through In-situ Dye Synthesis,” doctoral thesis, University of Leeds, 2018.",
  url: "https://etheses.whiterose.ac.uk/id/eprint/23799/",
  contentUrl: "https://etheses.whiterose.ac.uk/id/eprint/23799/1/Li_S_Design_PhD_2018.pdf",
  locator: "Thesis page 1, Figure 1.1 and adjacent text: PET, PBT, PTT, PCT, and PEN constitutional structures are drawn together and identified as distinct polyester members sharing ester groups in the main chain."
});

const watanabeVectra = structuralSource({
  sourceId: "watanabe-vectra-unit-structure-2024",
  lineageId: "watanabe-vectra-degradation-2024",
  sourceType: "open_journal",
  citation: "Yuya Watanabe, Kazuki Fukushima, and Takashi Kato, “Degradation of a Wholly Aromatic Main-Chain Thermotropic Liquid-Crystalline Polymer Mediated by Superbases,” JACS Au 4 (2024), 2944–2956.",
  doi: "10.1021/jacsau.4c00286",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11350567/",
  locator: "Figures 1–2 and pages 2944–2946: Vectra is drawn as a thermotropic aromatic copolyester containing para-hydroxybenzoate and 6-hydroxy-2-naphthoate units; the unit fraction is material specific rather than encoded by the two separate motifs."
});

const zhengPolyamides = structuralSource({
  sourceId: "zheng-polyamide-structures-review-2024",
  lineageId: "zheng-polyamide-recycling-review-2024",
  sourceType: "open_journal",
  citation: "Lin Zheng, Mengjin Wang, Yaoqin Li, Yan Xiong, and Chonggang Wu, “Recycling and Degradation of Polyamides,” Molecules 29 (2024), 1742.",
  doi: "10.3390/molecules29081742",
  url: "https://www.mdpi.com/1420-3049/29/8/1742",
  locator: "Introduction and Figures 1–2: exact constitutional structures are shown for PA6, PA66, PA46, PA610, PA612, PA11, PA12, PA1010, PA1012, PA6T, PA9T, PA10T, MXD6, and PA6I; the text distinguishes aliphatic, semiaromatic, and aromatic family scope and monomer pairing."
});

const openstaxBpaPc = structuralSource({
  sourceId: "openstax-bisphenol-a-polycarbonate",
  lineageId: "openstax-organic-chemistry",
  sourceType: "open_textbook",
  citation: "John McMurry, Organic Chemistry, OpenStax, 2023, Section 31.4, “Step-Growth Polymers.”",
  url: "https://openstax.org/books/organic-chemistry/pages/31-4-step-growth-polymers",
  locator: "Subsection “Polycarbonates” and its reaction figure: bisphenol A and diphenyl carbonate are shown forming the bisphenol-A polycarbonate constitutional repeat with carbonate links between bisphenol residues.",
  licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/"
});

const liuCpvcMicrostructure = structuralSource({
  sourceId: "liu-cpvc-ch2-chcl-ccl2-microstructure-2020",
  lineageId: "doi-10-3390-polym12020328",
  sourceType: "open_journal",
  citation: "Jinchang Liu, Hiroki Shimanoe, Seunghyun Ko, Hansong Lee, Chaehyun Jo, Jaewoong Lee, Seong-Hwa Hong, Hyunchul Lee, Young-Pyo Jeon, Koji Nakabayashi, Jin Miyawaki, and Seong-Ho Yoon, “Highly Chlorinated Polyvinyl Chloride as a Novel Precursor for Fibrous Carbon Material,” Polymers 12 (2020), 328.",
  doi: "10.3390/polym12020328",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7077477/",
  locator: "Section 3.2, Figure 4, and Table 1: solid-state carbon-13 NMR distinguishes methylene, CHCl, and CCl2 backbone-carbon environments in CPVC and reports their distributed proportions; the source does not prescribe one local sequence.",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
});

const sasanumaPpc = structuralSource({
  sourceId: "sasanuma-polypropylene-carbonate-structure-2017",
  lineageId: "sasanuma-polyalkylene-carbonates-2017",
  sourceType: "open_journal",
  citation: "Yuji Sasanuma and Yuta Takahashi, “Structure–Property Relationships of Poly(ethylene carbonate) and Poly(propylene carbonate),” ACS Omega 2 (2017), 4808–4819.",
  doi: "10.1021/acsomega.7b00964",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6641952/",
  locator: "Scheme 1, Figure 1, and the regio- and stereosequence analysis: PPC is shown as the alternating propylene-oxide/carbon-dioxide-derived carbonate chain, while head–tail regiochemistry and stereochemical distributions are analyzed as variables rather than fixed by a generic repeat drawing."
});

const withSources = (...sources) => Object.freeze({
  sources,
  sourceIds: sources.map(({ sourceId }) => sourceId)
});

export const evidence = Object.freeze({
  "wop-000003": withSources(songPolyolefins, galassoLldpe),
  "wop-000004": withSources(songPolyolefins, mdpePatent),
  "wop-000007": withSources(songPolyolefins, vldpePatent),
  "wop-000009": withSources(songPolyolefins, polypropylenePatent),
  "wop-000010": withSources(openstaxTacticity),
  "wop-000011": withSources(openstaxTacticity),
  "wop-000014": withSources(wangPolybutene),
  "wop-000016": withSources(hongPolynorbornene, burroughsCyclicOlefins),
  "wop-000018": withSources(wangEva),
  "wop-000020": withSources(venkateshEaa, alamEaaIonomer),
  "wop-000021": withSources(aliEmaa),
  "wop-000023": withSources(openlearnRepeatUnits),
  "wop-000024": withSources(liuCpvcMicrostructure),
  "wop-000025": withSources(epaPvdc),
  "wop-000026": withSources(openstaxVinylPolymers),
  "wop-000027": withSources(fitaihiPva),
  "wop-000028": withSources(samidePvb, iupacPolyvinylAcetal),
  "wop-000029": withSources(iupacPolyvinylAcetal, fitaihiPva),
  "wop-000032": withSources(inceogluSan),
  "wop-000036": withSources(dorrSma, samynSma),
  "wop-000038": withSources(iupacAcrylicPolymer, openstaxVinylPolymers),
  "wop-000039": withSources(iupacAcrylicPolymer, rosaPanFibers),
  "wop-000040": withSources(iupacAcrylicPolymer, kawanoAcrylateNetworks),
  "wop-000041": withSources(iupacAcrylicPolymer),
  "wop-000042": withSources(iupacAcrylicPolymer),
  "wop-000043": withSources(liPolyesters),
  "wop-000046": withSources(liPolyesters),
  "wop-000047": withSources(liPolyesters),
  "wop-000049": withSources(liPolyesters),
  "wop-000051": withSources(watanabeVectra),
  "wop-000052": withSources(zhengPolyamides),
  "wop-000053": withSources(zhengPolyamides),
  "wop-000054": withSources(zhengPolyamides),
  "wop-000055": withSources(zhengPolyamides),
  "wop-000056": withSources(zhengPolyamides),
  "wop-000057": withSources(zhengPolyamides),
  "wop-000058": withSources(zhengPolyamides),
  "wop-000059": withSources(zhengPolyamides),
  "wop-000060": withSources(zhengPolyamides),
  "wop-000061": withSources(zhengPolyamides),
  "wop-000062": withSources(zhengPolyamides),
  "wop-000063": withSources(zhengPolyamides),
  "wop-000064": withSources(zhengPolyamides),
  "wop-000065": withSources(zhengPolyamides),
  "wop-000066": withSources(zhengPolyamides),
  "wop-000068": withSources(openstaxBpaPc),
  "wop-000069": withSources(sasanumaPpc),
  "wop-000070": withSources(openlearnRepeatUnits)
});

// Every draft target in this assigned range has direct, anonymous evidence for
// its complete depiction and scope note. Keep this export so the migration can
// fail closed if a future spec change creates a new evidence gap.
export const unresolved = Object.freeze({});

export default evidence;
