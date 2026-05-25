import type { PeriodicTableSchema } from "@/types"
import { createContext } from "react"

export type PeriodicTableProviderObject = {
  elementTable: PeriodicTableSchema|null,

  /// Converts a symbol, group or the period to an id that can be indexed into elementTable.
  elementSymbolLookup: Record<string, string>|null,
  groupLookup: Record<number, string[]>|null,
  periodLookup: Record<number, string[]>|null
}

export const PeriodicTableProvider = createContext<PeriodicTableProviderObject>({
  elementTable: null,
  elementSymbolLookup: null,
  groupLookup: null,
  periodLookup: null
})