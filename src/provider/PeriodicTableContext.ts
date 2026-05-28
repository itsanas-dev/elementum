import type { PeriodicTableSchema } from "@/lib/types"
import { createContext } from "react"

export type AppContextObject = {
  elementTable: PeriodicTableSchema|null,

  /// Converts a symbol, group or the period to an id that can be indexed into elementTable.
  elementSymbolLookup: Record<string, string>|null,
  groupLookup: Record<number, string[]>|null,
  periodLookup: Record<number, string[]>|null
}

export const AppContext = createContext<AppContextObject>({
  elementTable: null,
  
  elementSymbolLookup: null,
  groupLookup: null,
  periodLookup: null
})