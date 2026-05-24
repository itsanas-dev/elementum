import type { SearchAction, SearchIntent, SearchSchemaEntry, TableElement } from "@/types";

// export const SearchIntentType: Record<string, SearchAction> = {
//   MolarMass: "molar_mass",
//   AtomicNumber: "atomic_number",
//   ElectronicConfigurationFull: "electronic_configuration_full",
//   ElectronicConfigurationSemantic: "electronic_configuration_semantic",
//   Density: "element_density",
//   Group: "element_group",
//   Period: "element_period",
//   Phase: "element_phase",
//   Unknown: "unknown"
// } as const;

// TODO: Change it into a json file or something else for better organization
const SearchSchema: SearchSchemaEntry[] = [
  {
    type: "molar_mass",
    params: {elementCount: 1, isArithmetic: false},
    keywords: [
      "atomic mass",
      "molar mass", 
      "relative mass", 
      "nucleon number", 
      "relative molecular mass", 
      "relative formula mass", 
      "atomic weight"
    ]
  },

  {
    type: "electronic_configuration_semantic",
    params: {elementCount: 1, isArithmetic: false},
    keywords: [
      "electronic configuration", 
      "electronic structure", 
      "electron arrangement",
      "electron configuration",
      "orbital configuration",
      "atomic configuration",
      "electron distribution"
    ],
  },

  {
    type: "electronic_configuration_full",
    params: {elementCount: 1, isArithmetic: false},
    keywords: [
      "todo_electronic_configuration"
    ],
  },

  {
    type: "element_density",
    params: {elementCount: 1, isArithmetic: false},
    keywords: ["density"]
  },

  {
    type: "element_group",
    keywords: [
      "group",
      "family",
      "column",
      "valence electron number"
    ],
    params: {elementCount: 1, isArithmetic: false}
  },

  {
    type: "element_period",
    keywords: [
      "period",
      "principal quantum level",
      "shell number",
      "row" 
    ],
    params: {elementCount: 1, isArithmetic: false}
  },

  {
    type: "element_phase",
    keywords: [
      "phase",
      "physical state",
      "state at rtp",
      "state at r.t.p",
      "state at room temperature"
    ],
    params: {isArithmetic: false, elementCount: 1}
  },
  
  {
    type: "atomic_number",
    keywords: [
      "atomic number",
      "proton number",
      "proton"
    ],

    params: {elementCount: 1, isArithmetic: false}
  }
] as const

const SearchStopWords = new Set([
  "what", "of", "is", "the", "and", "be", "no",
  "for", "to", "in", "give", "show", "display", "why", "are",
  "were", "was", "there"
])

// Source - https://stackoverflow.com/a/25352300
// License - CC BY-SA 3.0
function isAlphaNumeric(str: string) {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    
    if (code > 47 && code < 58) continue;  // Numeric   (0-9)
    if (code > 64 && code < 91) continue;  // Uppercase (A-Z)
    if (code > 96 && code < 123) continue; // Lowercase (a-z)
  }
  return true;
};

export function arraySum(a: number[]) {
  let s = 0;

  for (const n of a) {
    s += n;
  }

  return s;
}

export function evaluateUserSearch(rawQuery: string): SearchIntent {
  rawQuery = rawQuery.toLowerCase();

  const searchScore: Record<string, number> = {};
  const words = rawQuery.split(" ");

  const filteredWords = words.filter((word) => {
    if (word.length === 0) return false;
    if (SearchStopWords.has(word)) return false;
    if (!isAlphaNumeric(word)) return false;

    return true;
  });

  const ngrams = new Set<string>();

  for (let n = 1; n <= filteredWords.length; n++) {
    for (let i = 0; i <= filteredWords.length - n; i++) {
      ngrams.add(filteredWords.slice(i, i + n).join(" "));
    }
  }

  console.log(filteredWords, ngrams)

  const elements: TableElement[] = [];

  let highestScore: number = 0;
  let mostProbableAction: SearchAction = "unknown";

  for (const entry of SearchSchema) {
    const keywords = entry.keywords;
    let score = 0;

    for (const keyword of keywords) {
      if (ngrams.has(keyword)) {
        const wordLength = keyword.split(" ").length;
        const letterLength = keyword.length;
        score += 2 * wordLength + 0.05 * letterLength;
      }
    }

    searchScore[entry.type] = score;

    if (score > highestScore) {
      mostProbableAction = entry.type;
      highestScore = score;
    }
  }

  console.log(`"${rawQuery}": ${mostProbableAction} @ ${highestScore}`)
  
  if (highestScore <= 0) {
    return {
      type: "unknown",
      confidence: 1,
      params: {elements: []}
    }
  }

  const totalScore = arraySum(Object.values(searchScore));
  const confidence = highestScore / totalScore;

  return {
    type: mostProbableAction,
    confidence,
    params: { elements }
  }
}