import { type AppTheme, type SubshellType, type PeriodicTableSchema, type TableSeries, type TableElement } from "@/lib/types";
import { AppThemes } from "@/lib/theme";
import type { FormulaComponent, ParsedElement } from "@/lib/searchTypes";

const maxElectrons: Record<SubshellType, number> = {
  s: 2,
  p: 6,
  d: 10,
  f: 14
};

export function getElectronsInSubshell(subshell: SubshellType) {
  return maxElectrons[subshell] ?? -1;
}

export function getEntryColour(theme: AppTheme, element: TableElement|TableSeries) {
  const themeDef = AppThemes[theme] ?? AppThemes["dark"];

  if (element.type === "series") {
    return themeDef.seriesBlock;
  }

  if (element.group === 1 && element.symbol !== "H") return themeDef.alkaliMetal;
  if (element.group === 2) return themeDef.alkaliEarth;
  if (element.group === 17) return themeDef.halogen;
  if (element.group === 18) return themeDef.nobleGas;
  if (element.category.includes("transition metal")) return themeDef.transitionMetal;
  if (element.category.includes("metalloid")) return themeDef.metalloid;
  if (element.category.includes("nonmetal")) return themeDef.nonMetal;
  if (element.category.includes("post-transition metal")) return themeDef.postTransitionMetal;
  if (element.category === "lanthanide") return themeDef.lanthanides;
  if (element.category === "actinide") return themeDef.actinides;

  return themeDef.unknown;
}

export function calculateAtomicMass(table: PeriodicTableSchema, parsed: ParsedElement) {
  let mass = 0;

  for (const component of parsed.composition) {
    let groupMass = 0;

    for (const entry of component.components) {
      const element = table.elements[entry.id];

      if (!element || element.type !== "element") return -1;
      
      groupMass += element.atomic_mass * entry.count
    }

    mass += groupMass * component.atomGroupCount
  }

  return mass;
}

export function constructMolecularFormula(table: PeriodicTableSchema, groups: FormulaComponent[]) {
  let s = '';
  let i = 0;

  while (i < groups.length) {
    const group = groups[i];

    if (group.type === "atom_group") {
      s += "(";
    }

    for (const atom of group.components) {
      const el = table.elements[atom.id];

      if (!el || el.type !== "element") return null;

      s += `${el.symbol}`;
      if (atom.count > 1) s += atom.count.toFixed(0);
    }

    if (group.type === "atom_group") {
      s += `)`;
      if (group.atomGroupCount > 1) s += group.atomGroupCount.toFixed(0);
    }

    i++;
  }

  return s;
}
