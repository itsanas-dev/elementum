import { type AppTheme, type DensityUnit, type PeriodicTableSchema, type TableEntry, type TemperatureUnit } from "@/types";
import type { Atom, ElementCompositionComponent, ParsedElement } from "./search";
import { AppThemes } from "./theme";
import { displayDecimal } from "./string";

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
    for (const component of element.composition) {
      let groupMass = 0;

      for (const entry of component.components) {
        const element = table[entry.id];

        if (!element || element.type !== "element") return -1;
        
        groupMass += element.atomic_mass * entry.count
      }

      mass += groupMass * component.atomGroupCount
    }
  }

  return mass;
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

  return `${densityDisplay} ${suffix}`
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

// Source - https://stackoverflow.com/a/17445322
// Posted by Yannis, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-27, License - CC BY-SA 3.0
function gcdpair(a: number, b: number) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    if (b > a) {
      const temp = a; 
      a = b; 
      b = temp;
    }

    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}

export function gcd(nums: number[]) {
  return nums.reduce(gcdpair)
}

export function flattenComposition(parsed: ParsedElement): Atom[] {
  const totals = new Map<string, number>();

  for (const group of parsed.composition) {
    for (const atom of group.components) {
      const effectiveCount = atom.count * group.atomGroupCount;
      totals.set(atom.id, (totals.get(atom.id) ?? 0) + effectiveCount);
    }
  }

  return Array.from(totals.entries()).map(([id, count]) => ({ id, count }));
}

export function constructMolecularFormula(table: PeriodicTableSchema, groups: ElementCompositionComponent[]) {
  let s = '';
  let i = 0;

  while (i < groups.length) {
    const group = groups[i];

    if (group.type === "atom_group") {
      s += "("
    }

    for (const atom of group.components) {
      const el = table[atom.id];
      
      if (!el || el.type !== "element") return null;

      s += `${el.symbol}`
      if (atom.count > 1) s += atom.count.toFixed(0)
    }

    if (group.type === "atom_group") {
      s += `)${group.atomGroupCount}`;
    }

    i++;
  }

  return s;
}