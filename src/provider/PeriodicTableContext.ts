import type { PeriodicTableSchema } from "@/lib/types"
import { createContext } from "react"

export type AppContextObject = {
  elementTable: PeriodicTableSchema|null,

  /// Converts a symbol, group or the period to an id that can be indexed into elementTable.
  elementSymbolLookup: Record<string, string>,
  groupLookup: Record<string, string[]>,
  periodLookup: Record<string, string[]>
}

export const AppContext = createContext<AppContextObject>({
  elementTable: null,
  
  elementSymbolLookup: {},
  groupLookup: {},
  periodLookup: {}
})