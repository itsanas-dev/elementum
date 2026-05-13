export type ElementBlock = "s" | "p" | "d" | "f";
export type EntryType = "element" | "separation"

export type PeriodicTableStruct = {
  order: string[]
} & Record<string, TableEntry|undefined>

type BorderMask = 0 | 1 | 2 | 3;

export const T_ENTRY_BORDERRIGHT = 0b01;
export const T_ENTRY_BORDERBOTTOM = 0b10;

type BaseEntryProperties = {
  xpos: number,
  ypos: number,

  // If bit 1 is set, right border is shown. If bit 2 is set, bottom border is shown.
  // Otherwise, right and bottom are hidden. Used to avoid overlapping borders.
  // Replace with a good algorithm that can work on any arbitrary table.
  showBorders: BorderMask
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