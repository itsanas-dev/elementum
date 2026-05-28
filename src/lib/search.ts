import type { Config, PeriodicTableSchema, TableElement } from "@/lib/types"
import { calculateAtomicMass, constructMolecularFormula } from "./periodicTable"
import { getDensityByConfig, getTemperatureByConfig } from "./unitConversion"
import { getEmpiricalFormula } from "./empiricalFormula"
import { displayDecimal, isDigit } from "./string"
import type { ElementCompositionComponent, ParsedElement, SearchAction, SearchIntentEntry, SearchSchemaEntry } from "./searchTypes"


type SearchWarning = | {kind: "unknown_element", token: string}
                     | {kind: "element_only_query", name: string}
                     | {kind: "argument_mismatch", received: number, expected: number, name: string }
                     | {kind: "unsupported_operation", message: string}


type SearchIntentExpression = {
  action: string,
  result: string
}

export type SearchIntent = {
  evaluation: SearchIntentEntry[],
  warnings?: SearchWarning[],

  params: {
    elements: ParsedElement[]
  }
}

const SearchSchema: Partial<Record<SearchAction, SearchSchemaEntry>> = {
  "molar_mass": {
    params: {minElementArguments: 1, allowCompounds: true},
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
    ]
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
      "electronegativity", "en", "atom en", "atom electronegativity"
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
      "en", "electronegativity", "electronegative difference",
      "en difference", "electronegativity difference", "en diff",
      "electronegative diff", "electronegativity pauling", "en pauling"
    ],

    params: {minElementArguments: 2, allowCompounds: false}
  }
} as const;

const SearchStopWords = new Set([
  "what", "of", "is", "the", "and", "be", "no",
  "for", "to", "in", "give", "show", "display", "why", "are",
  "were", "was", "there"
]);


function getNthElement(list: ParsedElement[], n: number) {
  if (n >= list.length) return null;

  const el = list[n];

  if (el.type === "compound") return null;
  if (el.composition.length === 0) return null;
  if (el.composition[0].components.length === 0) return null;

  return el.composition[0].components[0]
}

export function getIntendedArgumentCount(intentType: SearchAction) {
  if (intentType === "unknown") return -1;

  const entry = SearchSchema[intentType];

  if (!entry) return -1;

  return entry.params.minElementArguments;
}

function displayElementAttribute(table: PeriodicTableSchema, elements: ParsedElement[], attributeText: (el: TableElement) => string, responseText: (el: TableElement) => string, elementIndex: number = 0) {
  const el = table[getNthElement(elements, elementIndex)!.id]!;

  if (el.type !== "element") return null

  return {action: attributeText(el), result: responseText(el) }
}

// Type-checking here is sparse because we can be reasonably sure that the elements do exist for the
// action we are performing since it's filtered out in the search algorithm.
// Also, this code is very disgusting, maybe refactor it sometime.
export function getSearchExpression(
  table: PeriodicTableSchema, 
  intent: SearchIntentEntry, 
  elements: ParsedElement[],
  config: Config
): SearchIntentExpression|null {
  switch (intent.type) {
    case "atomic_number": 
      return displayElementAttribute(table, elements, 
        (el) => `The atomic number of ${el.symbol} is`,
        (el) => el.number.toFixed(0)
      )

    case "molar_mass":
      return {
        action: `The atomic mass of ${elements[0].raw} is`,
        result: `${displayDecimal(calculateAtomicMass(table, elements))} g/mol`
      }
      
    case "element_density":
      return displayElementAttribute(table, elements, 
        (el) => `The density of ${el.symbol} is`,
        (el) => el.density ? getDensityByConfig(el.density, config.preferredDensityUnit) : "Unknown"
      );

    case "electronic_configuration_semantic":
    case "electronic_configuration_full": 
      return displayElementAttribute(table, elements, 
        (el) => `The electronic configuration of ${el.symbol} is`,
        (el) => (intent.type === "electronic_configuration_full") ? el.electron_configuration : el.electron_configuration_semantic
      )

    case "element_group":
      return displayElementAttribute(table, elements,
        (el) => `The group of ${el.symbol} is`,
        (el) => `Group ${el.group}`
      )

    case "element_period":
      return displayElementAttribute(table, elements,
        (el) => `The period of ${el.symbol} is`,
        (el) => `Period ${el.period}`
      )

    case "element_state":
      return displayElementAttribute(table, elements,
        (el) => `The physical state (at r.t.p) of ${el.symbol} is`,
        (el) => `${el.state}`
      )

    case "element_mp":
      return displayElementAttribute(table, elements,
        (el) => `The melting point of ${el.symbol} is`,
        (el) => el.melt ? getTemperatureByConfig(el.melt, config.preferredTemperatureUnit) : "Unknown"
      )

    case "element_bp":
      return displayElementAttribute(table, elements,
        (el) => `The boiling point of ${el.symbol} is`,
        (el) => el.boil ? getTemperatureByConfig(el.boil, config.preferredTemperatureUnit) : "Unknown"
      )
    
    case "element_appearance":
      return displayElementAttribute(table, elements,
        (el) => `The appearance of ${el.symbol} is`,
        (el) => el.appearance || "Unknown"
      )

    case "element_electronaffinity":
      return displayElementAttribute(table, elements,
        (el) => `The electron affinity of ${el.symbol} is`,
        (el) => `${el.electron_affinity.toFixed(2)} kJ/mol`
      )

    case "electronegativity":
      return displayElementAttribute(table, elements, 
        (el) => `The electronegativity of ${el.symbol} is`,
        (el) => `${el.electronegativity_pauling}`
      )

    case "empirical_formula": {
      const element = elements[0];
      const empiricalComposition = getEmpiricalFormula(element.composition);
      const empiricalFormula = constructMolecularFormula(table, empiricalComposition);

      if (!empiricalFormula) return null;

      return {
        action: `The empirical formula of ${element.raw} is`,
        result: empiricalFormula
      }
    }

    case "bond_electronegativity": {
      const element1 = table[getNthElement(elements, 0)!.id]!;
      const element2 = table[getNthElement(elements, 1)!.id]!;

      if (element1.type !== "element" || element2.type !== "element") return null;

      const enDiff = Math.abs(element1.electronegativity_pauling - element2.electronegativity_pauling);
      const towards = element1.electronegativity_pauling > element2.electronegativity_pauling ? element1 : element2;
      const isEqual = enDiff <= 1e-5;
      const suffix = !isEqual ? ` (towards ${towards.symbol})` : "";

      return {
        action: `The E.N difference in ${element1.symbol}-${element2.symbol} bond is`,
        result: `${enDiff.toFixed(2)}${suffix}`
      }
    } 

    case "unknown":
      return {result: "Waiting for something to happen?", action: "Your search was too vague. Please try again."}
    default:
      return {result: "Oops, we have messed up somewhere.", action: `Unsupported operation "${intent.type}"`}
  }
}

function arraySum(a: number[]) {
  let s = 0;

  for (const n of a) {
    if (typeof n !== "number") continue;
    s += n;
  }

  return s;
}

function parseElement(word: string, validate?: (symbolOrName: string) => string | null): ParsedElement|null {
  /// Strict check, since anything above 4 characters is either invalid or an element name.
  /// Note: We don't have any compound names so we don't care if that may exist.
  const id = validate?.(word);

  return id ? {raw: word, type: "molecule", composition: [{type: "element", components: [{id, count: 1}], atomGroupCount: 1}]} : null
}

export function parseCompound(
  word: string,
  validate?: (symbolOrName: string) => string | null
): ParsedElement | null {
  if (!validate) return null;

  word = word.replace(/\s/g, "");
  if (!word || !/^[A-Za-z0-9()]+$/.test(word)) return null;
  
  // First check if the word itself can be an element.
  // Before checking for compounds. This matches words like "Ca", "calcium" and others.
  const potentialElement = parseElement(word, validate);
  if (potentialElement) return potentialElement;

  let i = 0;

  function parse(): ElementCompositionComponent[] | null {
    const result: ElementCompositionComponent[] = [];

    while (i < word.length && word[i] !== ')') {
      if (word[i] === '(') {
        i++; // skip '('
        
        const group = parse();
        if (!group) return null;

        i++; // skip ')'

        let n = '';

        while (i < word.length && isDigit(word[i])) n += word[i++];
        
        const mult = n ? parseInt(n) : 1;

        result.push({
          type: "atom_group",
          components: group.flatMap(entry => 
            entry.type === "atom_group"
              ? entry.components.map((c) => ({id: c.id, count: c.count}))
              : [{id: entry.components[0].id, count: entry.components[0].count}]
          ),
          atomGroupCount: mult
        })

        continue;
      }

      if (/[A-Z]/.test(word[i])) {
        let symbol = word[i++];
        while (i < word.length && /[a-z]/.test(word[i])) symbol += word[i++];

        let n = '';
        while (i < word.length && isDigit(word[i])) n += word[i++];
        const count = n ? parseInt(n) : 1;

        const el = validate!(symbol);
        if (!el) return null;

        result.push({
          type: "element",
          components: [{id: el, count}],
          atomGroupCount: 1
        })
        continue;
      }

      return null; // Character which is not alphabetical, numerical or brackets i.e invalid.
    }

    return result;
  }

  const composition = parse();
  console.log(composition)
  if (!composition?.length) return null;

  return {
    type: composition.length === 1 ? "molecule" : "compound",
    composition,
    raw: word
  };
}

export function evaluateUserSearch(rawQuery: string, validate?: (potentialElement: string) => string|null): SearchIntent {
  const words = rawQuery.split(" ");

  const elementMap: ParsedElement[] = [];
  const filteredWords: string[] = [];
  const warnings: SearchWarning[] = [];

  let hasCompounds = false;

  for (const word of words) {
    if (word.length === 0) continue;
    if (SearchStopWords.has(word)) continue;

    const compound = parseCompound(word, validate)

    if (compound) {
      hasCompounds = (hasCompounds || compound.type === "compound");
      elementMap.push(compound);

      continue
    }
    
    const sanitized = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (sanitized.length > 0) filteredWords.push(sanitized);
  }

  const ngrams = new Set<string>();

  for (let n = 1; n <= filteredWords.length; n++) {
    for (let i = 0; i <= filteredWords.length - n; i++) {
      ngrams.add(filteredWords.slice(i, i + n).join(" "));
    }
  }

  const searchScore: Partial<Record<SearchAction, number>> = {};

  for (const entryKey of Object.keys(SearchSchema)) {
    const entry = SearchSchema[entryKey as SearchAction]!;
    let score = 0;
    
    /// Give the longer keywords more priority, and also to match them more greedily than smaller ones.
    const keywords = [...entry.keywords].sort((a, b) => b.length - a.length);
    const matchedTokens = new Set<string>();

    /// Score the current search type by the matches.
    /// The longest the sequence and the more words it has, the more confident we are that the user wants this information.
    for (const keyword of keywords) {
      const tokens = keyword.split(" ");

      /// If our tokens have already been matched by a longer keyword (aka. the reason we sorted in descending length),
      /// then we avoid double-scoring it, by removing tokens we have already counted.
      if (tokens.some((t) => matchedTokens.has(t))) continue;

      if (ngrams.has(keyword)) {
        const letterLength = keyword.length;
        score += 2 * tokens.length + 0.05 * letterLength;

        for (const token of tokens) {
          matchedTokens.add(token)
        }
      }
    }

    if (score === 0) continue;

    // If we have some compound in our search, skip the actions that can't or don't allow compounds.
    if (!entry.params.allowCompounds && hasCompounds) {
      warnings.push({
        kind: "element_only_query",
        name: entryKey
      })
      continue;
    }

    // Skip this entry if the elements are too few.
    if (entry.params.minElementArguments > elementMap.length) {
      warnings.push({
        kind: "argument_mismatch",
        expected: entry.params.minElementArguments,
        received: elementMap.length,
        name: entryKey
      });
      continue;
    }

    searchScore[entryKey as SearchAction] = score;
  }

  const intentMatches = Object.keys(searchScore) as SearchAction[];
  const intentScores = Object.values(searchScore)

  const totalScore = arraySum(intentScores);
  
  /// Sum all of the scores to get an overall confidence probability from 0 to 1.
  /// Sort the arrays in descending search score to have the most confidence intent first.
  const sortedbyConfidence = intentMatches.sort((a, b) => searchScore[b]! - searchScore[a]!).map<SearchIntentEntry>((match) => {
    const score = searchScore[match]!
    
    return {
      type: match,
      confidence: score / totalScore
    }
  });

  /// We can be sure that we matched no valid search intent.
  if (sortedbyConfidence.length === 0) {
    return {
      evaluation: [
        {type: "unknown", confidence: 1}
      ],
      warnings,
      params: {elements: []}
    }
  }

  return {
    evaluation: sortedbyConfidence,
    warnings,
    params: { elements: elementMap }
  }
}