import type { Config, MarkupType, PeriodicTableSchema, TableElement } from "@/lib/types"
import { calculateAtomicMass, constructMolecularFormula } from "./periodicTable"
import { getDensityByConfig, getTemperatureByConfig, getUnitMultiplier, type NumericQuantityType, parsePhysicalQuantity, type PhysicalQuantity } from "@/lib/unitConversion"
import { getEmpiricalFormula } from "./empiricalFormula"
import { displayDecimal, displayMoles, isNumeric } from "./string"
import type { FormulaComponent, ParsedElement, SearchAction, SearchCandidate } from "./searchTypes"
import { isStopWord, searchSchema } from "./searchDefinitions"

type SearchWarning = | {kind: "unknown_element", token: string}
                     | {kind: "element_only_query", name: string}
                     | {kind: "argument_mismatch", received: number, expected: number, name: string }
                     | {kind: "unsupported_operation", message: string}
                     | {kind: "quantity_mismatch", required: NumericQuantityType[], searchAction: string}
                     | {kind: "unexpected_quantity", actionName: string}

type PeriodicTableLookup = {
  allElements: PeriodicTableSchema,
  groupLookup: Record<number, string[]>|null,
  periodLookup: Record<number, string[]>|null,
}

// god i'm so sick of naming things, the names aren't even good.
type SearchContext = {
  intent: SearchCandidate,
  table: PeriodicTableLookup,
  elements: ParsedElement[],
  config: Config,
  quantities: Record<string, PhysicalQuantity>
}

type SearchMarkupType = "text" | MarkupType

type SearchResult = {
  action: string,
  result: string,

  markupTypeResult: SearchMarkupType,
  markupTypeAction: SearchMarkupType
}

export type SearchEvaluation = {
  evaluation: SearchCandidate[],
  warnings?: SearchWarning[],

  params: {
    elements: ParsedElement[],
    quantities: PhysicalQuantity[]
  }
}

function wrapResult(options: Partial<SearchResult>): SearchResult {
  return {
    action: "undefined",
    result: "undefined",
    markupTypeAction: "text",
    markupTypeResult: "text",

    ...options
  }
}

function getNthElement(list: ParsedElement[], n: number) {
  if (n >= list.length) return null;

  const el = list[n];

  if (el.type === "compound") return null;
  if (el.composition.length === 0) return null;
  if (el.composition[0].components.length === 0) return null;

  return el.composition[0].components[0]
}

function displayElementAttribute(
  table: PeriodicTableSchema, 
  elements: ParsedElement[], 
  attributeText: (el: TableElement) => string, 
  responseText: (el: TableElement) => string,
  elementIndex: number = 0,
  markupTypeAction?: SearchMarkupType,
  markupTypeResult?: SearchMarkupType
) {
  const el = table[getNthElement(elements, elementIndex)!.id]!;

  if (el.type !== "element") return null

  return wrapResult({
    action: attributeText(el), 
    result: responseText(el), 
    markupTypeAction,
    markupTypeResult
  });
}

// Type-checking here is sparse because we can be reasonably sure that the elements do exist for the
// action we are performing since it's filtered out in the search algorithm.
// Also, this code is very disgusting, maybe refactor it sometime.
export function evaluateSearchIntent(
  searchContent: SearchContext
): SearchResult|null {
  const {table, quantities, intent, elements, config} = searchContent;
  const { allElements: allElementsTable, groupLookup, periodLookup } = table;

  switch (intent.type) {
    case "atomic_number": 
      return displayElementAttribute(allElementsTable, elements, 
        (el) => `The atomic number of ${el.symbol} is`,
        (el) => el.number.toFixed(0)
      )

    case "molar_mass": {
      const molarMass = calculateAtomicMass(allElementsTable, elements[0]);

      return wrapResult({
        action: `The atomic mass of ${elements[0].raw} is`,
        result: `${displayDecimal(molarMass)} g/mol`,

        markupTypeAction: "molecular_formula"
      })
    }
      
    case "element_density":
      return displayElementAttribute(allElementsTable, elements, 
        (el) => `The density of ${el.symbol} is`,
        (el) => el.density ? getDensityByConfig(el.density, config.preferredDensityUnit) : "Unknown"
      );

    case "electronic_configuration_semantic":
    case "electronic_configuration_full": 
      return displayElementAttribute(allElementsTable, elements, 
        (el) => `The ${intent.type === "electronic_configuration_full" ? "full" : "semantic"} electronic configuration of ${el.symbol} is`,
        (el) => (intent.type === "electronic_configuration_full") ? el.electron_configuration : el.electron_configuration_semantic,
        0,
        "text",
        "subshell"
      )

    case "element_group":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The group of ${el.symbol} is`,
        (el) => `Group ${el.group}`
      )

    case "element_period":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The period of ${el.symbol} is`,
        (el) => `Period ${el.period}`
      )

    case "element_state":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The physical state (at r.t.p) of ${el.symbol} is`,
        (el) => `${el.state}`
      )

    case "element_mp":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The melting point of ${el.symbol} is`,
        (el) => el.melt ? getTemperatureByConfig(el.melt, config.preferredTemperatureUnit) : "Unknown"
      )

    case "element_bp":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The boiling point of ${el.symbol} is`,
        (el) => el.boil ? getTemperatureByConfig(el.boil, config.preferredTemperatureUnit) : "Unknown"
      )
    
    case "element_appearance":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The appearance of ${el.symbol} is`,
        (el) => el.appearance || "Unknown"
      )

    case "element_electronaffinity":
      return displayElementAttribute(allElementsTable, elements,
        (el) => `The electron affinity of ${el.symbol} is`,
        (el) => `${el.electron_affinity.toFixed(2)} kJ/mol`
      )

    case "electronegativity":
      return displayElementAttribute(allElementsTable, elements, 
        (el) => `The electronegativity of ${el.symbol} is`,
        (el) => `${el.electronegativity_pauling}`
      )

    case "empirical_formula": {
      const element = elements[0];
      const empiricalComposition = getEmpiricalFormula(element.composition);
      const empiricalFormula = constructMolecularFormula(allElementsTable, empiricalComposition);

      if (!empiricalFormula) return null;

      return wrapResult({
        action: `The empirical formula of ${element.raw} is`,
        result: empiricalFormula,

        markupTypeResult: "molecular_formula",
        markupTypeAction: "molecular_formula"
      });
    }

    case "bond_electronegativity": {
      const element1 = allElementsTable[getNthElement(elements, 0)!.id]!;
      const element2 = allElementsTable[getNthElement(elements, 1)!.id]!;

      if (element1.type !== "element" || element2.type !== "element") return null;

      const enDiff = Math.abs(element1.electronegativity_pauling - element2.electronegativity_pauling);
      const towards = element1.electronegativity_pauling > element2.electronegativity_pauling ? element1 : element2;
      const isEqual = enDiff <= 1e-5;
      const suffix = !isEqual ? ` (towards ${towards.symbol})` : "";

      return wrapResult({
        action: `The E.N difference in ${element1.symbol}-${element2.symbol} bond is`,
        result: `${enDiff.toFixed(2)}${suffix}`
      });
    }

    // Beware of 'floating point precision'. Fuck floating-points.
    // TODO: Add warning of floating-point imprecision in these two actions.
    case "mass_in_moles": {
      const substance = elements[0];
      const moleCount = quantities.compoundMoles.converted;
      const molarMass = calculateAtomicMass(allElementsTable, substance);

      const mass = molarMass * moleCount;

      return wrapResult({
        action: `The mass of ${quantities.compoundMoles.raw} of ${substance.raw} is`,
        result: `${displayDecimal(mass)} g`,
        
        markupTypeAction: "molecular_formula"
      });
    }

    case "moles_in_mass": {
      const substance = elements[0];
      const molarMass = calculateAtomicMass(allElementsTable, substance);

      // Evil 'floating point imprecision' hack fix.
      const moles = parseFloat((quantities.compoundMass.converted / molarMass).toPrecision(10));
      
      return wrapResult({
        action: `The moles in ${quantities.compoundMass.raw} of ${substance.raw} is`,
        result: `${displayMoles(moles)} mol`,
        markupTypeAction: "molecular_formula"
      })
    }

    case "elements_in_group": {
      const group = quantities.group.converted;

      if (!groupLookup) return null;
      if (!Number.isInteger(group) || (group < 1 || group > 18)) return null;

      const elements = groupLookup[group];

      if (!elements) return null;

      const elementsBySymbol = elements.map((id) => {
        const el = allElementsTable[id]!;

        if (el.type !== "element") return "ignore this";

        return el.symbol;
      })

      return wrapResult({
        action: `The elements in group ${group.toFixed(0)} are`,
        result: `${elementsBySymbol.join(",  ")}`
      })
    }

    case "elements_in_period": {
      const period = quantities.period.converted;

      if (!periodLookup) return null;
      if (!Number.isInteger(period) || (period < 1 || period > 8)) return null;

      const elements = periodLookup[period];

      if (!elements) return null;

      const elementsBySymbol = elements.map((id) => {
        const el = allElementsTable[id]!;

        if (el.type !== "element") return "ignore this";

        return el.symbol;
      })

      return wrapResult({
        action: `The elements in period ${period.toFixed(0)} are`,
        result: `${elementsBySymbol.join(",  ")}`
      })
    }

    case "unknown":
      return wrapResult({result: "Waiting for something to happen?", action: "We couldn't understand your search. Please try again."})
    default:
      return wrapResult({result: "Oops, we have messed up somewhere.", action: `Unsupported operation "${intent.type}"`});
  }
}

export function getQuantitiesRequiredForEntry(intentType: SearchAction): Record<string, NumericQuantityType|NumericQuantityType[]>|null {
  if (intentType === "unknown") return null;

  const entry = searchSchema[intentType];

  return entry?.params.quantityArguments || null;
}

export function getIntendedArgumentCount(intentType: SearchAction) {
  if (intentType === "unknown") return -1;

  const entry = searchSchema[intentType];

  if (!entry) return -1;

  return entry.params.minElementArguments;
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

export function buildQuantityRecord(
  quantities: PhysicalQuantity[],
  requiredQuantityArguments: Record<string, NumericQuantityType|NumericQuantityType[]>
): Record<string, PhysicalQuantity> {
  const record: Record<string, PhysicalQuantity> = {};
  const usedIndices = new Set<number>();

  for (const [argName, expected] of Object.entries(requiredQuantityArguments)) {
    const acceptedTypes = Array.isArray(expected) ? expected : [expected];

    const match = quantities.findIndex((q, index) => !usedIndices.has(index) && acceptedTypes.includes(q.quantityType));

    record[argName] = quantities[match];
    usedIndices.add(match);
  }

  return record;
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

  function parse(): FormulaComponent[] | null {
    const result: FormulaComponent[] = [];

    while (i < word.length && word[i] !== ')') {
      if (word[i] === '(') {
        i++; // skip '('
        
        const group = parse();
        if (!group) return null;

        i++; // skip ')'

        let n = '';

        while (i < word.length && isNumeric(word[i])) n += word[i++];
        
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
        while (i < word.length && isNumeric(word[i])) n += word[i++];
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
  if (!composition?.length) return null;

  return {
    type: composition.length === 1 ? "molecule" : "compound",
    composition,
    raw: word
  };
}

export function evaluateUserSearch(rawQuery: string, validate?: (potentialElement: string) => string|null): SearchEvaluation {
  const words = rawQuery.trim().split(/\s+/g)

  const elementMap: ParsedElement[] = [];
  const filteredWords: string[] = [];
  const warnings: SearchWarning[] = [];
  const quantities = [];

  let hasCompounds = false;
  let i = 0;

  while (i < words.length) {
    const word = words[i++]

    if (word.length === 0) continue;
    if (isStopWord(word)) continue;
  
    // Evaluate compounds and elements if they are valid.
    const compound = parseCompound(word, validate)
  
    if (compound) {
      hasCompounds = (hasCompounds || compound.type === "compound");
      elementMap.push(compound);
  
      continue
    }
  
    // Evaluate any numerical values and units.
    if (isNumeric(word.charAt(0), true)) {
      const parsedQuantity = parsePhysicalQuantity(word);
  
      if (parsedQuantity) {
        // We could have added a space between the numeric value and the unit
        // Crude check for this case by checking the next word and if its a unit, we apply multiplier and change type.
        if (parsedQuantity.quantityType === "scalar" && i + 1 < words.length) {
          const potentialUnit = words[i];

          if (!isNumeric(potentialUnit.charAt(0), true)) {
            const unitMult = getUnitMultiplier(potentialUnit);
  
            if (unitMult) {
              i++;
  
              parsedQuantity.quantityType = unitMult.name;
              parsedQuantity.converted *= unitMult.mult;
              parsedQuantity.raw += `${potentialUnit}`
            }
          }

        }

        quantities.push(parsedQuantity);
        continue;
      }
    }
    
    const sanitized = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (sanitized.length > 0) filteredWords.push(sanitized);
  }

  const quantitiesSet = new Set(quantities.map((q) => q.quantityType));

  const ngrams = new Set<string>();

  for (let n = 1; n <= filteredWords.length; n++) {
    for (let i = 0; i <= filteredWords.length - n; i++) {
      ngrams.add(filteredWords.slice(i, i + n).join(" "));
    }
  }

  const searchScore: Partial<Record<SearchAction, number>> = {};

  for (const [entryKey, searchEntry] of Object.entries(searchSchema)) {
    let score = 0;
    
    /// Give the longer keywords more priority, and also to match them more greedily than smaller ones.
    const keywords = [...searchEntry.keywords].sort((a, b) => b.length - a.length);
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
        score += 2 * tokens.length + 0.1 * letterLength;

        for (const token of tokens) {
          matchedTokens.add(token)
        }
      }
    }

    if (score === 0) continue;

    if (searchEntry.params.quantityArguments) {
      const argumentSet = new Set<NumericQuantityType>(Object.values(searchEntry.params.quantityArguments).flat())

      if (searchEntry.params.quantityArguments && !argumentSet.isSubsetOf(quantitiesSet)) {
        // I'm not looping over the list to get the exact arguments missing, too much work
        warnings.push({kind: "quantity_mismatch", required: Array.from<NumericQuantityType>(argumentSet), searchAction: entryKey})
        continue;
      }
    } else if (quantitiesSet.size > 0) {
      // Unlike elements, we aren't lenient with the number or presence of numerical values
      // in non-numeric search queries because words can overlap.
      warnings.push({kind: "unexpected_quantity", actionName: entryKey})
      continue;
    }

    // If we have some compound in our search, skip the actions that can't or don't allow compounds.
    if (!searchEntry.params.allowCompounds && hasCompounds) {
      warnings.push({
        kind: "element_only_query",
        name: entryKey
      })
      continue;
    }

    // Skip this entry if the elements are too few, or if we don't have exact numbers when we need exact numbers.
    if (
      (!searchEntry.params.needsExactElementArguments && searchEntry.params.minElementArguments > elementMap.length) ||
      (searchEntry.params.needsExactElementArguments && searchEntry.params.minElementArguments !== elementMap.length)
    ) {
      warnings.push({
        kind: "argument_mismatch",
        expected: searchEntry.params.minElementArguments,
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
  const sortedbyConfidence = intentMatches.sort((a, b) => searchScore[b]! - searchScore[a]!).map<SearchCandidate>((match) => {
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
      params: {elements: [], quantities}
    }
  }

  return {
    evaluation: sortedbyConfidence,
    warnings,
    params: { elements: elementMap, quantities }
  }
}

