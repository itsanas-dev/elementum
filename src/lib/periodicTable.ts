import { type AppTheme, type PeriodicTableSchema, type TableEntry } from "@/types";
import type { ParsedElement } from "./search";
import { AppThemes } from "./theme";

export function getEntryColour(theme: AppTheme, element: TableEntry) {
  const themeDef = AppThemes[theme] ?? AppThemes["dark"];

  if (element.type === "separation") {
    return themeDef.seriesBlock;
  }

  if (element.group === 1) return themeDef.alkaliMetal;
  if (element.group === 2) return themeDef.alkaliEarth;
  if (element.group === 17) return themeDef.halogen;
  if (element.group === 18) return themeDef.nobleGas;
  if (element.category === "transition metal") return themeDef.transitionMetal;
  if (element.category === "metalloid") return themeDef.metalloid;
  if (element.category.includes("nonmetal")) return themeDef.nonMetal;
  if (element.category.includes("post-transition metal")) return themeDef.postTransitionMetal;

  return themeDef.unknown;
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