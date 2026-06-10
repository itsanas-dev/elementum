import type { NumericQuantityType } from "@/lib/unitConversion"

export type Atom = {
  id: string,
  count: number
}

export type FormulaComponent = {
  type: "element" | "atom_group",

  components: Atom[],
  atomGroupCount: number
}

/// Contains ids to the element entries themselves.
export type ParsedElement = {
  raw: string,
  type: "compound" | "molecule",
  composition: FormulaComponent[]
}

export type SearchAction = "unknown" |
                           "molar_mass" |
                           "atomic_number" |
                           "element_density" |
                           "electronic_configuration_semantic" |
                           "electronic_configuration_full" |
                           "element_period" |
                           "element_group" |
                           "element_state" |
                           "element_mp" |
                           "element_bp" |
                           "element_electronaffinity" |
                           "element_appearance" |
                           "electronegativity" |
                           "empirical_formula" |
                           "bond_electronegativity" |
                           "mass_in_moles" |
                           "moles_in_mass" |
                           "elements_in_group" |
                           "elements_in_period"

export type SearchSchemaEntry = {
  keywords: string[],
  params: {
    allowCompounds: boolean,
    minElementArguments: number, // The minimum number of elements required for this action to be applicable if 'needsExactElementArguments' is not set.
    needsExactElementArguments?: boolean,
    quantityArguments?: Record<string, NumericQuantityType|NumericQuantityType[]>|undefined
  },
}

export type SearchCandidate = {
  type: SearchAction,
  confidence: number,
}