import type { PeriodicTableSchema, TableElement } from "@/types"
import { createContext } from "react"

export type PeriodicTableProviderObject = {
  elementTable: PeriodicTableSchema|null,

  elementSymbolLookup: Record<string, TableElement>|null,
  groupLookup: Record<number, TableElement[]>|null,
  periodLookup: Record<number, TableElement[]>|null
}

export const PeriodicTableProvider = createContext<PeriodicTableProviderObject>({
  elementTable: null,
  elementSymbolLookup: null,
  groupLookup: null,
  periodLookup: null
})