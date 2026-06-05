import type { SearchAction, SearchSchemaEntry } from "./searchTypes";

export const searchSchema: Partial<Record<SearchAction, SearchSchemaEntry>> = {
  "molar_mass": {
    keywords: [
      "mr",
      "mass",
      "molecular mass",
      "molecule mass",
      "atomic mass",
      "molar mass", 
      "relative mass", 
      "nucleon number", 
      "relative molecular mass", 
      "relative formula mass", 
      "atomic weight",
      "a" /// Meant to be 'A' as in the prefix of atomic number, but it has to be lowercase.
    ],
    params: {
      minElementArguments: 1, 
      allowCompounds: true
    }
  },

  "electronic_configuration_semantic": {
    params: {minElementArguments: 1, allowCompounds: false},
    keywords: [
      "short electronic configuration",
      "shorthand electron",
      "semantic electron",
      "semantic electronic configuration",
      "electronic configuration", 
      "electronic structure", 
      "electron arrangement",
      "electronic",
      "electron",
      "electrons",
      "configuration",
      "electron configuration",
      "orbital configuration",
      "atomic configuration",
      "electron distribution"
    ],
  },

  "electronic_configuration_full": {
    params: {minElementArguments: 1, allowCompounds: false},
    keywords: [
      "full electronic configuration",
      "electronic configuration", 
      "electronic structure", 
      "electron arrangement",
      "electronic",
      "electron",
      "electrons",
      "configuration",
      "electron configuration",
      "full orbital configuration",
      "orbital configuration",
      "full atomic configuration",
      "atomic configuration",
      "electron distribution"
    ],
  },

  "element_density": {
    params: {minElementArguments: 1, allowCompounds: false},
    keywords: ["density", "dense", "heavy"]
  },

  "element_group": {
    keywords: [
      "group",
      "family",
      "column",
      "valence electron number"
    ],
    params: {minElementArguments: 1, allowCompounds: false}
  },

  "element_period": {
    keywords: [
      "period",
      "principal quantum level",
      "shell number",
      "row" 
    ],
    params: {minElementArguments: 1, allowCompounds: false}
  },

  "element_state": {
    keywords: [
      "physical state",
      "state",
      "state at rtp",
      "state at room temperature",
      "matter"
    ],
    params: {minElementArguments: 1, allowCompounds: false} /// Unfortunately, we don't have physical state info on compounds.
  },
  
  "atomic_number": {
    keywords: [
      "atomic number",
      "proton number",
      "proton",
      "z", /// Meant to be 'Z' as in the acronym for atomic number, but it's meant to be lowercase
      "number",
      "shell electrons"
    ],

    params: {minElementArguments: 1, allowCompounds: false}
  },

  "element_mp": {
    keywords: [
      "melting point", "mp",
      "melting", "melt", 
      "freezing point", "fusion temperature",
      "softening point"
    ],

    params: {minElementArguments: 1, allowCompounds: false}
  },

  "element_bp": {
    keywords: [
      "boil", "bp", "boiling", "boiling point",
      "vaporization", "vapourization", "vapourization point",
      "point of formation of vapour"
    ],
    params: {minElementArguments: 1, allowCompounds: false}
  },

  "element_appearance": {
    keywords: [
      "appearance", "look", "looks", "appear"
    ],
    params: {minElementArguments: 1, allowCompounds: false}
  },
  
  "element_electronaffinity": {
    keywords: [
      "electron affinity", "electroaffinity", "affinity",
      "e- affinity", "e-affinity"
    ],

    params: {minElementArguments: 1, allowCompounds: false}
  },

  "electronegativity": {
    keywords: [
      "electronegativity", "en", "atom en", "atom electronegativity",
      "en pauling", "electronegativity pauling"
    ],

    params: {minElementArguments: 1, allowCompounds: false}
  },

  "empirical_formula": {
    keywords: [
      "empirical formula", "emp formula", "empirical",
      "simplest formula", "compositional formula", "stoichometric formula",
      "compositional", "stoichometric"
    ],

    params: {minElementArguments: 1, allowCompounds: true}
  },

  "bond_electronegativity": {
    keywords: [
      "electronegative difference", "en difference", "electronegativity difference", "en diff", "electronegative diff"
    ],

    params: {minElementArguments: 2, allowCompounds: false}
  },

  // Mass in 'n' moles of a compound.
  "mass_in_moles": {
    keywords: [
      "mass", "compound mass"
    ],

    params: {
      minElementArguments: 1,
      allowCompounds: true,
      quantityArguments: {
        "compoundMoles": "mole"
      }
    }
  },

  "moles_in_mass": {
    keywords: [
      "moles"
    ],

    params: {
      minElementArguments: 1,
      allowCompounds: true,
      quantityArguments: {"compoundMass": "mass"}
    }
  },

  "elements_in_group": {
    keywords: ["group", "g"],
    params: {minElementArguments: 0, needsExactElementArguments: true, allowCompounds: false, quantityArguments: {"group": "scalar"}}
  },
  
  "elements_in_period": {
    keywords: ["period", "p"],
    params: {minElementArguments: 0, needsExactElementArguments: true, allowCompounds: false, quantityArguments: {"period": "scalar"}}
  },

  "empirical_formula_by_composition": {
    keywords: ["composition", "empirical formula"],
    params: {minElementArguments: 1, allowCompounds: false, quantityArguments: {}}
  }
} as const;

const searchStopWords = new Set([
  "what", "of", "is", "the", "and", "be", "no",
  "for", "to", "in", "give", "show", "display", "why", "are",
  "were", "was", "there", "find", "get", "provide", "state", "explain"
]);

export function isStopWord(word: string) {
  return searchStopWords.has(word);
}