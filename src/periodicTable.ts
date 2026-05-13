import { T_ENTRY_BORDERBOTTOM, T_ENTRY_BORDERRIGHT, type TableEntry } from "./types";

const HALOGEN_COLOUR = "#a46198";
const NOBLE_GAS_COLOUR = "#893fa3";

const CATEGORY_COLOURS: Record<string, string> = {
  "metalloid": "#55b7bb",
  "transition metal": "#caa411",
  "alkali metal": "#c45164",
  "alkaline earth metal": "#cd8028",
  "nonmetal": "#3a7fd5"
}

export function getEntryColour(element: TableEntry) {
  if (element.type === "separation") {
    return "#4e9bb1";
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

export function displayAtomicMass(mass: number) {
  const dpart = mass % 1;

  if (Math.abs(dpart) <= 1e-3) {
    return mass.toFixed(0)
  }

  return mass.toFixed(3);
}

export function shouldDisplayRightBorder(entry: TableEntry) {
  return (entry.showBorders & T_ENTRY_BORDERRIGHT) > 0;
}

export function shouldDisplayBottomBorder(entry: TableEntry) {
  return (entry.showBorders & T_ENTRY_BORDERBOTTOM) > 0;
}