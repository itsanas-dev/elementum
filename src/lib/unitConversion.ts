import { displayDecimal, isNumeric } from "./string"
import type { DensityUnit, TemperatureUnit } from "./types"

export type NumericQuantityType = | "scalar"
                                  | "mass"  
                                  | "mole" 
                                  | "volume"
                                  | "percentage"

type QuantityUnitData = {multiplier: number, allowPrefixes: boolean, caseSensitive: boolean}
type QuantityLookup = Record<string, QuantityUnitData>

export type PhysicalQuantity = {
  raw: string
  converted: number,
  quantityType: NumericQuantityType
}

const unitPrefixes: Record<string, number> = {
  "T": 1e12,
  "G": 1e9,
  "M": 1e6,
  "k": 1e3,
  "da": 10,
  "d": 0.1,
  "c": 0.01,
  "m": 1e-3,
  "u": 1e-6,
  "n": 1e-9,
  "p": 1e-12
}

// Helper function to create unit definitions.
function unit(m: number, options?: Partial<Omit<QuantityUnitData, 'multiplier'>>): QuantityUnitData {
  return {multiplier: m, allowPrefixes: false, caseSensitive: false, ...options}
}

const quantityUnits: Partial<Record<NumericQuantityType, QuantityLookup>> = {
  "mass": {
    // Base quantity is g.
    // Multiplier denotes how much of the base quantity is equal to that conversion.
    // For example, 1 stone -> 6350.29 gram, 1 kilogram -> 1000 grams
    "g": unit(1, { allowPrefixes: true, caseSensitive: true }),
    "gram": unit(1),
    "kilo": unit(1e3),
    "kilogram": unit(1e3),
    "milligram": unit(1e-3),
    "microgram": unit(1e-6),
    "tonne": unit(1e6),

    // What are these units? Also, potential floating-point inaccuracies. Fun.
    "stone": unit(6350.29),
    "pound": unit(453.6),
    "lb": unit(453.6),
    "ounce": unit(28.35),

    "theresNoWayAnyoneWouldFindThisButIfYouDidHi": unit(1234567890, {allowPrefixes: true, caseSensitive: true})
  },

  "mole": {
    // Base unit is mol.
    "mole": unit(1),
    "mol": unit(1, { allowPrefixes: true, caseSensitive: true })
  },

  "volume": {
    // Base unit is m3.
    "m3": unit(1, { allowPrefixes: true, caseSensitive: true }),
    "l": unit(1e-3, { allowPrefixes: true }),
    "liter": unit(1e-3),
    "litre": unit(1e-3),
    "gal": unit(1/219.969),
    "gallon": unit(1/219.969),
    "quart": unit(1/879.9),
    "qt": unit(1/879.9),
    "pint": unit(1/1759.75),
    "pt": unit(1/1759.75),
    "cup": unit(1/3519.51)
  },

  "percentage": {
    "%": unit(0.01, {allowPrefixes: false, caseSensitive: false})
  }
}

function getQuantityMultiplier(unitString: string): {mult: number, name: NumericQuantityType}|null {
  if (unitString.length === 0) return {mult: 1, name: "scalar"};
  
  // Note: Please have no units that end with the letter 's'.
  // Crude check on plurals for words like 'gram', 'pound', 'kilo', since no SI units for our case end with 's'.
  if (unitString.endsWith("s")) {
    unitString = unitString.substring(0, unitString.length - 1);
  }
  
  const prefix = unitString.charAt(0);
  const potentialPrefix = unitPrefixes[prefix]
  const noPrefixQuantity = unitString.substring(1);

  for (const [quantityName, quantityList] of Object.entries(quantityUnits)) {
    for (const [unitPrefix, unit] of Object.entries(quantityList)) {
      const check = (unit.caseSensitive ? unitString : unitString.toLowerCase())

      // If it directly matches a quantity, then return it.
      if (unitPrefix === check) {
        return {mult: unit.multiplier, name: quantityName as NumericQuantityType};
      }

      // Only check prefixes if allowed to by the current unit, and the prefix exists.
      if (!unit.allowPrefixes || !potentialPrefix) continue;

      const quantity = (unit.caseSensitive ? noPrefixQuantity : noPrefixQuantity.toLowerCase());

      if (quantity === unitPrefix) {
        return {mult: unit.multiplier * potentialPrefix, name: quantityName as NumericQuantityType}
      }
    }
  }

  return null;
}

export function convertQuantityTo(amount: number, unit: string) {
  const targetQuantity = getQuantityMultiplier(unit);

  if (!targetQuantity) return null;

  return amount * targetQuantity.mult;
}

export function parsePhysicalQuantity(input: string): PhysicalQuantity|null {
  if (isNumeric(input, true)) {
    const numericalValue = Number.parseFloat(input)
    if (Number.isNaN(numericalValue)) return null;

    return {
      raw: input,
      converted: numericalValue,
      quantityType: "scalar"
    }
  }

  input = input.replaceAll(/\s+/g, "");

  if (input.length === 0) return null;

  let sign = 1;
  let numStart = 0;

  const firstChar = input.charAt(0);

  // Check sign first.
  if (firstChar === "-" || firstChar === "+") {
    sign = (firstChar === "-" ? -1 : 1);
    numStart++;
  }

  let i = numStart;

  while (i < input.length && isNumeric(input.charAt(i), true)) i++;
  
  const numericValue = input.slice(numStart, i);

  if (!isNumeric(numericValue, true)) return null;

  const unit = input.substring(i);
  const parsed = Number.parseFloat(numericValue) * sign;

  // Unnecessary check if the previous few are correct. But we are being thorough.
  if (Number.isNaN(parsed)) return null;

  const quantity = getQuantityMultiplier(unit);

  if (!quantity) return null;

  return {
    raw: input,
    converted: parsed * quantity.mult,
    quantityType: quantity.name
  }
}


export function toCelsius(tKelvin: number) {
  return tKelvin - 273.15;
}

/// why are american temperature units so weird.
export function toFahrenheit(tKelvin: number) {
  return (tKelvin - 273.15) * 1.8 + 32;
}

export function getDensityByConfig(density_gcm3: number, preferredUnit: DensityUnit) {
  if (preferredUnit === "kg_m3") {
    density_gcm3 *= 1000;
  }

  const densityDisplay = displayDecimal(density_gcm3);
  const suffix = (preferredUnit === "g_cm3" ? "g/cm3" : "kg/m3");

  return `${densityDisplay} ${suffix}`;
}

export function getTemperatureByConfig(tKelvin: number, preferredUnit: TemperatureUnit) {
  let text = `${tKelvin.toFixed(1)} K`;

  if (preferredUnit === "celsius") {
    text += ` (${toCelsius(tKelvin).toFixed(1)} °C)`;
  } else if (preferredUnit === "fahrenheit") {
    text += ` (${toFahrenheit(tKelvin).toFixed(1)} °F)`;
  }

  return text;
}