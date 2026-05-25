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
  position: {x: number, y: number}
}
