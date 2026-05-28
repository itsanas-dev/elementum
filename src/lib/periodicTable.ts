import { type AppTheme, type PeriodicTableSchema, type TableEntry } from "@/lib/types";
import { AppThemes } from "./theme";
import type { ElementCompositionComponent, ParsedElement } from "./searchTypes";

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

export function constructMolecularFormula(table: PeriodicTableSchema, groups: ElementCompositionComponent[]) {
  let s = '';
  let i = 0;

  while (i < groups.length) {
    const group = groups[i];

    if (group.type === "atom_group") {
      s += "(";
    }

    for (const atom of group.components) {
      const el = table[atom.id];

      if (!el || el.type !== "element") return null;

      s += `${el.symbol}`;
      if (atom.count > 1) s += atom.count.toFixed(0);
    }

    if (group.type === "atom_group") {
      s += `)${group.atomGroupCount}`;
    }

    i++;
  }

  return s;
}
