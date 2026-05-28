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
  state: string,
  source: string,
  summary: string,
  symbol: string,
  shells: number[],
  electron_configuration: string,
  electron_configuration_semantic: string,
  electron_affinity: number,
  electronegativity_pauling: number,
  ionization_energies: number[],
  block: ElementBlock,
};

export type TableSeparator = BaseEntryProperties & {
  type: "separation",
  range: [number, number],
  name: string,
}

export type TableEntry = | TableElement | TableSeparator

export type TooltipState = {
  selectedElement: string,
  trigger: HTMLElement|null
}

export type TooltipPosition = {
  side: "right" | "left" | "top" | "bottom",
  position: {x: number, y: number}
}

export type AppTheme = "dark" | "light";
export type TemperatureUnit = "celsius" | "kelvin" | "fahrenheit"
export type DensityUnit = "g_cm3" | "kg_m3"

export type Config = {
  preferredDensityUnit: DensityUnit,
  preferredTemperatureUnit: TemperatureUnit
}

export type NavigationPageId = "page_undefined" | "page_table" | "page_searchhelp" | "page_about"