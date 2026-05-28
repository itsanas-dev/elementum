export type Atom = {
  id: string,
  count: number
}

export type ElementCompositionComponent = {
  type: "element" | "atom_group",

  components: Atom[],
  atomGroupCount: number
}

/// Contains ids to the element entries themselves.
export type ParsedElement = {
  raw: string,
  type: "compound" | "molecule",
  composition: ElementCompositionComponent[]
}

export type SearchAction = "unknown" |
                           "molar_mass" |
                           "atomic_number" |
                           "element_density" |
                           "electronic_configuration_semantic" |
                           "electronic_configuration_full" |
                           "element_period" |
                           "element_group" |
                           "element_phase" |
                           "element_mp" |
                           "element_bp" |
                           "element_electronaffinity" |
                           "element_appearance" |
                           "electronegativity" |
                           "empirical_formula"

export type SearchSchemaEntry = {
  type: SearchAction,
  keywords: string[],
  params: {
    allowCompounds: boolean,
    minElementArguments: number // The minimum number of elements required for this action to be applicable
  },
}

export type SearchIntentEntry = {
  type: SearchAction,
  confidence: number,
}