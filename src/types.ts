import type { Vec2 } from "./math";

export type ElementBlock = "s" | "p" | "d" | "f";
export type EntryType = "element" | "separation"

export type PeriodicTableSchema = {
  order: string[]
} & Record<string, TableEntry|undefined>

type BaseEntryProperties = {
  xpos: number,
  ypos: number
}

export type TableElement = BaseEntryProperties & {
  type: "element",
  name: string,
  appearance: string,
  atomic_mass: number,
  boil: number, // Boiling point
  category: string,
  density: number,
  discovered_by: string,
  melt: number,
  molar_heat: number,
  number: number,
  period: number,
  group: number,
  phase: string,
  source: string,
  bohr_model_image: string,
  bohr_model_3d: string,
  summary: string,
  symbol: string,
  wxpos: number,
  wypos: number,
  shells: number[],
  electron_configuration: string,
  electron_configuration_semantic: string,
  electron_affinity: number,
  electronegativity_pauling: number,
  ionization_energies: number[],
  cpk_hex: string,
  image: {
    title: string,
    url: string,
    attribution: string
  },
  block: ElementBlock,
};

export type TableSeparator = BaseEntryProperties & {
  type: "separation",
  range: [number, number],
  name: string,
}

export type TableEntry = | TableElement | TableSeparator

export type TooltipPosition = {
  side: "right" | "left" | "top" | "bottom",
  position: Vec2
}

export type SearchAction = "unknown" |
                           "molar_mass" |
                           "atomic_number" |
                           "element_density" |
                           "electronic_configuration_semantic" |
                           "electronic_configuration_full" |
                           "element_period" |
                           "element_group" |
                           "element_phase"

export type SearchSchemaEntry = {
  type: SearchAction,
  keywords: string[],
  params: {
    elementCount: number, // The minimum number of elements required for this action to be applicable
    isArithmetic: boolean // TODO: This is for arithmetic operations in the searchbox
  },
}

export type SearchIntent = {
  type: SearchAction,
  confidence: number,

  params: {
    elements: TableElement[]
  }
}