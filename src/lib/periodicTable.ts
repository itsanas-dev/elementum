import { type PeriodicTableSchema, type TableEntry } from "@/types";
import type { ParsedElement } from "./search";

const HALOGEN_COLOUR = "#be61af";
const NOBLE_GAS_COLOUR = "#a452c2";

const CATEGORY_COLOURS: Record<string, string> = {
  "metalloid": "#55b7bb",
  "transition metal": "#caa411",
  "alkali metal": "#c45164",
  "alkaline earth metal": "#cd8028",
  "nonmetal": "#3a7fd5"
}

export function getEntryColour(element: TableEntry) {
  if (element.type === "separation") {
    return "#8cb8c6";
  }

  if (element.group === 17) return HALOGEN_COLOUR;
  if (element.group === 18) return NOBLE_GAS_COLOUR;

  if (element.category.includes("post-transition metal")) {
    return "#93ad37";
  }

  for (const entry of Object.keys(CATEGORY_COLOURS)) {
    if (element.category.includes(entry)) {
      return CATEGORY_COLOURS[entry]
    }
  }

  return "#FFF";
}

export function calculateAtomicMass(table: PeriodicTableSchema, parsed: ParsedElement[]) {
  let mass = 0;

  for (const element of parsed) {
    for (const el of element.composition) {
      const entry = table[el.id];

      if (!entry || entry.type !== "element") break;

      mass += entry.atomic_mass * el.count;
    }
  }

  return mass;
}

export function calculateAtomicNumber(table: PeriodicTableSchema, parsed: ParsedElement[]) {
  let number = 0;

  for (const element of parsed) {
    for (const el of element.composition) {
      const entry = table[el.id];

      if (!entry || entry.type !== "element") break;

      number += entry.number * el.count;
    }
  }

  return number;
}

export function toCelsius(tKelvin: number) {
  return tKelvin - 273.15;
}

/// why are american temperature units so weird.
export function toFahrenheit(tKelvin: number) {
  return (tKelvin - 273.15) * 1.8 + 32;
}