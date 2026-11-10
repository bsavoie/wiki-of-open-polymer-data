// Structural-depiction evidence supplement for reviewed records wop-000072–wop-000130.
//
// New records directly support the depicted connection tables and representation
// scope. Empty source arrays select adequate source records already in the article.

const structuralSource = ({ licenseUrl, accessedDate = "2026-08-31", ...record }) => Object.freeze({
  ...record,
  accessedDate,
  accessStatus: "anonymous_full_content",
  reuseStatus: licenseUrl ? "open_licensed" : "publicly_accessible_citation_only",
  permissionBasis: licenseUrl
    ? "The complete source is anonymously readable under the stated open license; only a citation and precise locator are stored here."
    : "The complete source is anonymously readable; this record stores only a citation and a precise locator.",
  ...(licenseUrl ? { licenseUrl } : {}),
  supports: ["structuralDepictions"]
});

const selected = (...sourceIds) => Object.freeze({
  sources: Object.freeze([]),
  sourceIds: Object.freeze(sourceIds)
});

const added = (...sources) => Object.freeze({
  sources: Object.freeze(sources),
  sourceIds: Object.freeze(sources.map((source) => source.sourceId))
});

const combined = (sources, ...existingSourceIds) => Object.freeze({
  sources: Object.freeze(sources),
  sourceIds: Object.freeze([
    ...sources.map((source) => source.sourceId),
    ...existingSourceIds
  ])
});

const polyesterPc = structuralSource({
  sourceId: "polyester-pc-pet-bpa-units-wo2020205558",
  lineageId: "wo2020205558-pc-pet-copolymer",
  sourceType: "patent",
  citation: "Michal Elizabeth Porter, Mark Alan Barger, Yiyong He, Stephane Costeux, Gerald F. Billovits, Wenyi Huang, and Edoardo Nicoli, “Chemically Modified Polyesters and Process for Making,” WO 2020/205558 A1, 2020.",
  url: "https://patents.google.com/patent/WO2020205558A1/en",
  locator: "Paragraphs [0030]–[0036], [0058], [0064]–[0066], [0073], and [0079], Figures 1–2, and Examples 1–5: the ethylene-terephthalate and bisphenol-A carbonate units are drawn explicitly, and transesterification is shown to produce a covalent PET/polycarbonate copolymer whose composition and sequence depend on reaction extent; carbon-dioxide-loss side products are distinguished."
});

const pmdaOdaPolyimide = structuralSource({
  sourceId: "polyimide-pmda-oda-repeat-structures-2025",
  lineageId: "doi-10-3390-polym17101385",
  sourceType: "open_journal",
  citation: "Victor M. Nazarychev, Andrey A. Pavlov, Almaz M. Kamalov, et al., “The Effect of Synthesis Conditions and Chemical Structure of Thermoplastic Polyimides on Their Thermomechanical Properties and Short-Term Electrical Strength,” Polymers 17 (2025), 1385.",
  doi: "10.3390/polym17101385",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12115213/",
  locator: "Figure 1 and the synthesis and imidization discussion: Figure 1a explicitly draws the PMDA–ODA repeating unit, while Figures 1b–c and the text show that changing the dianhydride changes the linear polyimide chain structure.",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
});

const crosslinkedPolyimide = structuralSource({
  sourceId: "crosslinked-polyimide-family-scope-2021",
  lineageId: "doi-10-1039-d1py00997d",
  sourceType: "open_journal",
  citation: "Basiram Brahma Narzary, Benjamin C. Baker, Neha Yadav, Valerio D'Elia, and Charl F. J. Faul, “Crosslinked Porous Polyimides: Structure, Properties and Applications,” Polymer Chemistry 12 (2021), 6494–6514.",
  doi: "10.1039/D1PY00997D",
  url: "https://pubs.rsc.org/en/content/articlehtml/2021/py/d1py00997d",
  locator: "Introduction and Section 2, including the synthetic schemes: linear thermoplastic polyimides are distinguished from crosslinked polyimides assembled from multifunctional amine cores and dianhydride linkers, establishing that the family includes network architectures for which one linear repeat unit is not universal.",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0/"
});

const odpaMpdaPolyimide = structuralSource({
  sourceId: "tpi-odpa-mpda-structure-nasa-1993",
  lineageId: "nasa-ntrs-19950017476-polyimide-uv",
  sourceType: "public_report",
  citation: "John S. Forsythe, Graeme A. George, David J. T. Hill, James H. O'Donnell, Peter J. Pomery, and Firas A. Rasoul, “The Effect of Simulated Low Earth Orbit Radiation on Polyimides (UV Degradation Study),” in LDEF: 69 Months in Space, Third Post-Retrieval Symposium, Part 2, NASA CP-3275 (1993), 645–655.",
  url: "https://ntrs.nasa.gov/api/citations/19950017476/downloads/19950017476.pdf",
  locator: "Printed pages 645–648, especially Figure 1: eight linear aromatic polyimide structures are drawn, including ODPA–mPDA; the adjacent discussion relates ether bridges and meta-linked kinks to reduced charge-transfer interactions and thermoplastic flow."
});

const pfaPave = structuralSource({
  sourceId: "pfa-tfe-pmve-units-us20150191561",
  lineageId: "us20150191561-pfa-pave",
  sourceType: "patent",
  citation: "Hitomi Kitagawa and Yuji Mochizuki, “Tetrafluoroethylene/Perfluoro(alkyl Vinyl Ether) Copolymer,” US 2015/0191561 A1, 2015.",
  url: "https://patents.google.com/patent/US20150191561A1/en",
  locator: "Paragraphs [0002] and [0046]–[0053]: PFA is defined as a tetrafluoroethylene/perfluoro(alkyl vinyl ether) copolymer; the PAVE formula is given and PMVE, PEVE, and PPVE are named as alternatives, with copolymer composition treated as variable."
});

const orthoUpr = structuralSource({
  sourceId: "ortho-upr-ethylene-phthalate-maleate-us4902773",
  lineageId: "us4902773-orthophthalic-upr",
  sourceType: "patent",
  citation: "Akos Bodnar, Maria Solymoss, Ibolya Vancson Szmercsanyi, Istvan Szigeti, Laszlo Szommer, “Method of Preparation of Unsaturated Polyester Resins from Maleic Acid/Anhydride,” US 4,902,773 A, 1990.",
  url: "https://patents.google.com/patent/US4902773A/en",
  locator: "Example 4: maleic anhydride, phthalic anhydride, ethylene glycol, and propylene glycol are polycondensed before dilution with styrene; the explicit feed verifies representative ethylene-phthalate and ethylene-maleate motifs while also showing that a practical ortho resin can contain mixed glycol-derived units."
});

const bpaVinylEster = structuralSource({
  sourceId: "vinyl-ester-epoxy-methacrylation-us20080039590",
  lineageId: "drexel-army-multimodal-vinyl-ester-patent",
  sourceType: "patent",
  citation: "Giuseppe Palmese, John La Scala, and James Sands, “Multi-Modal Vinyl Ester Resins,” US 2008/0039590 A1, 2008.",
  url: "https://patents.google.com/patent/US20080039590A1/en",
  locator: "Paragraphs [0016]–[0018], the reaction scheme, and Examples 16 and 26: bisphenol-A diglycidyl ether (Epon 828) is reacted with methacrylic acid, consuming the two epoxide groups to give a bisphenol-A epoxy vinyl ester with two terminal methacrylate groups; the approximately 540 molecular mass bounds the illustrated lowest oligomer."
});

const dgebaPrecursor = structuralSource({
  sourceId: "dgeba-shundo-precursor-structure-2022",
  lineageId: "acs-dgeba-network-formation-review-2022",
  sourceType: "open_journal",
  citation: "Atsuomi Shundo and Satoru Yamamoto, “Network Formation and Physical Properties of Epoxy Resins for Future Practical Applications,” JACS Au 2 (2022), 1522–1542.",
  doi: "10.1021/jacsau.2c00120",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9327093/",
  locator: "Figure 1 and Section 2: the lowest-mass bisphenol-A diglycidyl ether precursor is drawn with two terminal glycidyl ether groups; the surrounding discussion distinguishes the precursor and higher oligomers from the hardener-dependent cured network.",
  licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/"
});

const dgebfRegioisomers = structuralSource({
  sourceId: "knox-dgebf-regioisomers-2019",
  lineageId: "doi-10-1021-acs-macromol-9b01441",
  sourceType: "open_journal",
  citation: "Stephen T. Knox, Anthony Wright, Colin Cameron, and John P. A. Fairclough, “Well-Defined Networks from DGEBF—The Importance of Regioisomerism in Epoxy Resin Networks,” Macromolecules 52 (2019), 6861–6867.",
  doi: "10.1021/acs.macromol.9b01441",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7007253/",
  locator: "Figure 1 and the opening results discussion: para–para, para–ortho, and ortho–ortho diglycidyl ether of bisphenol F are drawn as three distinct precursor regioisomers, and commercial DGEBF is identified as a mixture whose isomer distribution is not universal.",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
});

const cycloaliphaticDiepoxide = structuralSource({
  sourceId: "cycloaliphatic-epoxy-patry-precursor-structure-2025",
  lineageId: "patry-mdpi-epoxy-anhydride-comparison-2025",
  sourceType: "open_journal",
  citation: "Stéphane Patry, Alban Asseray, Mickaël Berne, Valéry Loriot, Luc Loriot, and Jean-Pierre Habas, “Structure–Property Relationships in Epoxy–Anhydride Systems: A Comprehensive Comparative Study of Cycloaliphatic, Novolac, and Aromatic Prepolymers,” Polymers 17 (2025), 2843.",
  doi: "10.3390/polym17212843",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12610736/",
  locator: "Section 2.1 and Table 1: the ECy prepolymer is identified as 3,4-epoxycyclohexylmethyl-3,4-epoxycyclohexane carboxylate (CAS 2386-87-0), drawn with two epoxidized cyclohexane rings connected through an ester linkage and explicitly distinguished from the MNA-cured formulation.",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
});

// The epoxy-family hero remains anchored to the broad Shundo perspective,
// while its two contextual precursor cards need their own direct records.
// Keep the two roles separate so a regeneration preserves the authoritative
// v2 source mapping instead of promoting either precursor source to the hero.
const epoxyFamilyContextualPrecursors = Object.freeze({
  sources: Object.freeze([dgebaPrecursor, cycloaliphaticDiepoxide]),
  sourceIds: Object.freeze(["epoxy-shundo-network-properties-perspective-2022"])
});

const bismaleimidodiphenylmethane = structuralSource({
  sourceId: "cai-bismaleimidodiphenylmethane-2023",
  lineageId: "mdpi-branched-bmi-mechanics-study-2023",
  sourceType: "open_journal",
  citation: "Haihui Cai, Jiahao Shi, Xiaorui Zhang, Zhou Yang, Ling Weng, Qingye Wang, Shaohui Yan, Lida Yu, Junlong Yang, and Noriko Hiraishi, “Characterization of Mechanical, Electrical and Thermal Properties of Bismaleimide Resins Based on Different Branched Structures,” Polymers 15 (2023), 592.",
  doi: "10.3390/polym15030592",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9919665/",
  locator: "Figure 2 and Section 2.2: the BDM starting material is drawn as 4,4′-bismaleimidodiphenylmethane before its Michael-addition modification with several diamines; the figure supports this molecule as one representative BMI precursor, not a universal cured repeat.",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
});

const novolacNist = structuralSource({
  sourceId: "novolac-nist-methylene-linkages-2003",
  lineageId: "nist-phenolic-network-reference",
  sourceType: "public_report",
  citation: "Sheng Lin-Gibson and J. S. Riffle, “Chemistry and Properties of Phenolic Resins and Networks,” in Synthetic Methods in Step-Growth Polymers, 2003.",
  url: "https://www.nist.gov/publications/chemistry-and-properties-phenolic-resins-and-networks",
  contentUrl: "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=852138",
  locator: "Printed pages 378–379, Section 7.3 and Figure 7.6: phenol/formaldehyde novolac oligomers are drawn as methylene-linked phenolic rings, and ortho–ortho, ortho–para, and para–para linkage variability is stated; later cure-network formation is discussed separately."
});

const resorcinolFormaldehyde = structuralSource({
  sourceId: "rf-prostredny-network-mechanism-2018",
  lineageId: "doi-10-3390-gels4020036",
  sourceType: "open_journal",
  citation: "Martin Prostredný, Mohammed G. M. Abduljalil, Paul A. Mulheran, and Ashleigh J. Fletcher, “Process Variable Optimization in the Manufacture of Resorcinol–Formaldehyde Gel Materials,” Gels 4 (2018), 36.",
  doi: "10.3390/gels4020036",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6209245/",
  locator: "Introduction and Figure 1: formaldehyde first forms hydroxymethyl-substituted resorcinol, whose condensation gives oligomeric chains and clusters that crosslink into a three-dimensional network; process-dependent network variation is described explicitly.",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
});

const alkydGlycerolPhthalateOleate = structuralSource({
  sourceId: "alkyd-gan-glycerol-phthalate-oleate-2023",
  lineageId: "gan-palm-oil-coating-resins-2023",
  sourceType: "open_journal",
  citation: "Seng Neon Gan, “Development of Environmentally Friendly Palm Oil-Based Resins for Coating Applications,” Malaysian Journal of Chemistry 25 (2023), 244–250.",
  url: "https://ikm.org.my/publications/malaysian-journal-of-chemistry/xcesfile.php?abs=J0044-6e8e905",
  locator: "Table 1 and the “Hybrid Acrylate–Alkyd Resin” section on printed pages 245–246: oleic acid is written as CH3(CH2)7CH=CH(CH2)7COOH, and glycerol, oleic acid, and phthalic anhydride are reacted to an alkyd in which the fatty-acid residue is a side chain; NMR confirms retained olefinic protons."
});

const oleicAcid = structuralSource({
  sourceId: "oleic-acid-pubchem-cid445639",
  lineageId: "pubchem-cid-445639",
  sourceType: "public_dataset",
  citation: "National Center for Biotechnology Information, PubChem Compound Summary for CID 445639, Oleic Acid.",
  url: "https://pubchem.ncbi.nlm.nih.gov/compound/Oleic-Acid",
  locator: "Sections “2D Structure” and “Computed Descriptors,” IUPAC Name: oleic acid is identified as (9Z)-octadec-9-enoic acid, directly verifying the cis double-bond geometry used for the representative oleate side chain."
});

const phthalonitrileCure = structuralSource({
  sourceId: "phthalonitrile-sheng-cure-products-2020",
  lineageId: "doi-10-1039-d0ra07581g",
  sourceType: "open_journal",
  citation: "Liping Sheng, Kerui Xiang, Rong Qiu, Yuxuan Wang, Shengpei Su, Dulin Yin, and Yongming Chen, “Polymerization Mechanism of 4-APN and a New Catalyst for Phthalonitrile Resin Polymerization,” RSC Advances 10 (2020), 39187–39194.",
  doi: "10.1039/D0RA07581G",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9057334/",
  locator: "Section 3.3 and Figures 9–10: triazine, isoindole, and phthalocyanine cure products reported for nitrile polymerization are compared with additional catalyst-dependent conjugated-ring and tertiary-amine structures; incomplete nitrile conversion is observed, directly supporting the absence of one exact cured repeat unit.",
  licenseUrl: "https://creativecommons.org/licenses/by-nc/3.0/"
});

const oCresolEpoxyNovolacVinylEster = structuralSource({
  sourceId: "jaswal-gaur-o-cresol-epoxy-novolac-vinyl-ester-2015",
  lineageId: "jaswal-gaur-o-cresol-epoxy-novolac-vinyl-ester-2015",
  sourceType: "open_journal",
  citation: "Shipra Jaswal and Bharti Gaur, “Morphological, Mechanical and Physio-chemical Performance of ortho-Cresol Epoxy Novolac Based Vinyl Ester Resin,” Polish Journal of Chemical Technology 17 (3) (2015), 1–7.",
  doi: "10.1515/pjct-2015-0041",
  url: "https://doi.org/10.1515/pjct-2015-0041",
  contentUrl: "https://bibliotekanauki.pl/articles/779370.pdf",
  locator: "Article p. 2, Figure 1: an o-cresol epoxy-novolac local structure, methacrylic-acid addition, and the resulting secondary-alcohol/methacrylate side chain; pp. 3–4: o-cresol methyl evidence, conversion evidence, and carbon-13 NMR identification of random ortho–ortho, ortho–para, and para–para methylene linkages.",
  accessedDate: "2026-09-03",
  licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/3.0/"
});

export const evidence = Object.freeze({
  "wop-000072": added(polyesterPc),
  "wop-000075": selected("pom-copolymer-process-us7906609"),
  "wop-000076": selected("ge-ppe-copper-amine-bromide-1973"),
  "wop-000080": selected("pps-polar-solvent-preparation-patent-2025"),
  "wop-000081": selected("paek-russo-blends-processing-review-2023"),
  "wop-000086": added(pmdaOdaPolyimide, crosslinkedPolyimide),
  "wop-000087": combined([odpaMpdaPolyimide], "thermoplastic-polyimide-mitsui-aurum-brochure-2013"),
  "wop-000089": selected("ptfe-suspension-polymerization-ep0152105"),
  "wop-000091": added(pfaPave),
  "wop-000092": selected("etfe-asahi-2090595"),
  "wop-000093": selected("ectfe-allied-us4482685a"),
  "wop-000094": selected("alliedsignal-pctfe-redox-polymerization-1995"),
  "wop-000095": selected("pvdf-pennwalt-us4360652"),
  "wop-000097": selected("gorham-para-xylylene-vapour-polymerization-1967"),
  "wop-000098": epoxyFamilyContextualPrecursors,
  "wop-000099": added(dgebaPrecursor),
  "wop-000100": added(dgebfRegioisomers),
  "wop-000102": selected("glycidylamine-shell-2951822"),
  "wop-000103": added(cycloaliphaticDiepoxide),
  "wop-000105": added(orthoUpr),
  "wop-000106": selected("california-research-isophthalic-up-resin-1959"),
  "wop-000109": added(bpaVinylEster),
  "wop-000110": combined([oCresolEpoxyNovolacVinylEster], "apicella-dulzer-novolac-vinyl-ester-patent"),
  "wop-000112": added(novolacNist),
  "wop-000114": combined([novolacNist], "cresol-formaldehyde-weber-coating-patent-1958"),
  "wop-000115": selected("rf-gel-process-optimization-2018"),
  "wop-000116": combined([novolacNist, resorcinolFormaldehyde], "prf-resin-4373062"),
  "wop-000119": selected("luo-muf-dialdehyde-starch-study"),
  "wop-000120": selected("puf-eco-friendly-resorcinol-plywood-processing"),
  "wop-000125": combined([alkydGlycerolPhthalateOleate, oleicAcid], "kalu-alkyd-resin-review-2024"),
  "wop-000126": selected("silicone-resin-hydroxyl-control-us3120500", "silicone-resin-trialkoxysilane-us4242252"),
  "wop-000127": added(bismaleimidodiphenylmethane),
  "wop-000128": selected("ce-mgc-cytester-homopolymer-properties"),
  "wop-000130": combined([phthalonitrileCure], "phthalonitrile-bulgakov-bio-based-review-2024")
});

export const unresolved = Object.freeze({});

export default evidence;
