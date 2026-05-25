import type { PeriodicTableSchema } from "@/types"
import { calculateAtomicMass, calculateAtomicNumber, toCelsius } from "./periodicTable"
import { displayDecimal } from "./string"

type ElementCompositionComponent = {
  id: string,
  count: number
}

/// Contains ids to the element entries themselves.
export type ParsedElement = {
  raw: string,
  type: "compound" | "molecule",
  composition: ElementCompositionComponent[]
}

export type SearchAction = "unknown" |
                           "molar_mass" |
                           "atomic_number" |
                           "element_density" |
                           "electronic_configuration_semantic" |
                           "electronic_configuration_full" |
                           "element_period" |
                           "element_group" |
                           "element_phase" |
                           "element_mp" |
                           "element_bp"

export type SearchSchemaEntry = {
  type: SearchAction,
  keywords: string[],
  params: {
    allowCompounds: boolean,
    argumentCount: number // The minimum number of elements required for this action to be applicable
  },
}

export type SearchIntentEntry = {
  type: SearchAction,
  confidence: number,
}

type SearchWarning = | {kind: "unknown_element", token: string}
                     | {kind: "element_only_query", name: string}
                     | {kind: "argument_mismatch", received: number, expected: number, name: string }
                     | {kind: "unsupported_operation", message: string}

export type SearchIntent = {
  evaluation: SearchIntentEntry[],
  warnings?: SearchWarning[],

  params: {
    elements: ParsedElement[]
  }
}

type SearchIntentExpression = {
  action: string,
  result: string
}

// TODO: Change it into a json file or something else for better organization
const SearchSchema: SearchSchemaEntry[] = [
  {
    type: "molar_mass",
    params: {argumentCount: 1, allowCompounds: true},
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
      "A"
    ]
  },

  {
    type: "electronic_configuration_semantic",
    params: {argumentCount: 1, allowCompounds: false},
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
      "configuration",
      "electron configuration",
      "orbital configuration",
      "atomic configuration",
      "electron distribution"
    ],
  },

  {
    type: "electronic_configuration_full",
    params: {argumentCount: 1, allowCompounds: false},
    keywords: [
      "full electronic configuration",
      "electronic configuration", 
      "electronic structure", 
      "electron arrangement",
      "electronic",
      "electron",
      "configuration",
      "electron configuration",
      "full orbital configuration",
      "orbital configuration",
      "full atomic configuration",
      "atomic configuration",
      "electron distribution"
    ],
  },

  {
    type: "element_density",
    params: {argumentCount: 1, allowCompounds: false},
    keywords: ["density", "dense", "heavy"]
  },

  {
    type: "element_group",
    keywords: [
      "group",
      "family",
      "column",
      "valence electron number"
    ],
    params: {argumentCount: 1, allowCompounds: false}
  },

  {
    type: "element_period",
    keywords: [
      "period",
      "principal quantum level",
      "shell number",
      "row" 
    ],
    params: {argumentCount: 1, allowCompounds: false}
  },

  {
    type: "element_phase",
    keywords: [
      "phase",
      "physical state",
      "state",
      "state at rtp",
      "state at room temperature"
    ],
    params: {argumentCount: 1, allowCompounds: false} /// Unfortunately, we don't have physical state info on compounds.
  },
  
  {
    type: "atomic_number",
    keywords: [
      "atomic number",
      "proton number",
      "proton",
      "Z",
      "number",
      "shell electrons"
    ],

    params: {argumentCount: 1, allowCompounds: false}
  },

  {
    type: "element_mp",
    keywords: [
      "melting point", "mp",
      "melting", "melt", 
      "freezing point", "fusion temperature",
      "softening point"
    ],

    params: {argumentCount: 1, allowCompounds: false}
  },

  {
    type: "element_bp",
    keywords: [
      "boil", "bp", "boiling", "boiling point",
      "vaporization", "vapourization", "vapourization point",
      "point of formation of vapour"
    ],
    params: {argumentCount: 1, allowCompounds: false}
  }
] as const

const SearchStopWords = new Set([
  "what", "of", "is", "the", "and", "be", "no",
  "for", "to", "in", "give", "show", "display", "why", "are",
  "were", "was", "there"
]);

export function getIntendedArgumentCount(intentType: SearchAction) {
  const entry = SearchSchema.find((i) => i.type === intentType);

  if (!entry) return -1;

  return entry.params.argumentCount;
}

// Type-checking here is sparse because we can be reasonably sure that the elements do exist for the
// action we are performing since it's filtered out in the search algorithm.
// Also, this code is very disgusting, maybe refactor it sometime.
export function getSearchExpression(table: PeriodicTableSchema, intent: SearchIntentEntry, elements: ParsedElement[]): SearchIntentExpression|null {
  switch (intent.type) {
    case "atomic_number": {
      const el = table[elements[0].composition[0].id]!;

      if (!el || el.type !== "element") return null;

      return {
        action: `The atomic number of ${el.symbol} is`,
        result: `${calculateAtomicNumber(table, elements).toFixed(0)}`
      }
    }

    case "molar_mass":
      return {
        action: `The atomic mass of ${elements[0].raw} is`,
        result: `${displayDecimal(calculateAtomicMass(table, elements))} g/mol`
      }
      
    case "element_density": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null

      const result = el.density ? `${displayDecimal(el.density)} g/cm3` : "Unknown"

      return {action: `The density of ${el.symbol} is`, result}
    }

    case "electronic_configuration_semantic":
    case "electronic_configuration_full": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null;

      const configuration = intent.type === "electronic_configuration_semantic" ? el.electron_configuration_semantic : el.electron_configuration
      return {action: `The electronic configuration of ${el.symbol} is`, result: configuration}
    }

    case "element_group": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null;
      
      return {action: `The group of ${el.symbol} is`, result: `Group ${el.group}`}
    }

    case "element_period": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null;

      return {action: `The period of ${el.symbol} is`, result: `Period ${el.period}`}
    }

    case "element_phase": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null;

      return {action: `The physical state (at r.t.p) of ${el.symbol} is`, result: el.phase}
    }

    // F for americans
    // TODO: add support for freedom units at some point, preferably from a config.
    case "element_mp": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null;

      const result = el.melt ? `${el.melt.toFixed(1)} K (${toCelsius(el.melt).toFixed(1)} °C)` : "Unknown"

      return {
        action: `The melting point of ${el.symbol} is`, 
        result
      }
    }

    case "element_bp": {
      const el = table[elements[0].composition[0].id]!;

      if (el.type === "separation") return null;

      const result = el.boil ? `${el.boil.toFixed(1)} K (${toCelsius(el.boil).toFixed(1)} °C)` : "Unknown"

      return {
        action: `The boiling point of ${el.symbol} is`, 
        result
      }
    }

    case "unknown":
      return {result: "Waiting for something to happen?", action: "Your search was too vague."}
    default:
      return {action: "Oops", result: `Unsupported operation "${intent.type}"`}
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

  return id ? {raw: word, type: "molecule", composition: [{id, count: 1}]} : null
}

export function parseCompound(word: string, validate?: (symbolOrName: string) => string | null): ParsedElement|null {  
  if (!validate) return null;

  const potentialElement = parseElement(word, validate);

  if (potentialElement) return potentialElement;
  
  // Strict symbol length check. Something like "Mo" in "Molar" shouldn't match.
  if (word.length > 3 && !/^([A-Z][a-z]?\d*)+$/.test(word)) return null;
  
  const tokens = word.match(/[A-Z][a-z]?\d*/g);

  if (!tokens) return null;

  const composition: ElementCompositionComponent[] = [];
  
  for (const token of tokens) {
    const symbol = token.replace(/\d+/g, "");
    const count = parseInt(token.match(/\d+/)?.[0] ?? "1");

    const element = validate(symbol);

    if (!element) return null;

    composition.push({id: element, count})
  }

  if (composition.length === 0) return null;

  return {
    raw: word,
    type: composition.length === 1 ? "molecule" : "compound",
    composition
  }
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
      hasCompounds = compound.type === "compound";
      elementMap.push(compound);

      continue;
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

  for (const entry of SearchSchema) {
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
        name: entry.type
      })
      continue;
    }

    // Skip this entry if the elements are too few.
    if (entry.params.argumentCount > elementMap.length) {
      warnings.push({
        kind: "argument_mismatch",
        expected: entry.params.argumentCount,
        received: elementMap.length,
        name: entry.type
      });
      continue;
    }

    searchScore[entry.type] = score;
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