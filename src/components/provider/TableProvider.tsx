import { PeriodicTableProvider, type PeriodicTableProviderObject } from "@/provider/PeriodicTableProvider"
import type { PeriodicTableSchema, TableElement } from "@/types"
import { useMemo, type ReactNode } from "react"

type ProviderProps = {
  children: ReactNode,
  elementTable: PeriodicTableSchema|null
}

function createLookup(table: PeriodicTableSchema|null, mapper: (entry: TableElement) => string) {
  if (!table) return null;

  const lookup: Record<string, TableElement> = {};

  for (const key of Object.keys(table)) {
    if (key === "order") continue;

    const element = table[key];

    if (!element || element.type !== "element") continue;

    const lookupKey = mapper(element);
    
    if (!lookupKey) continue;

    lookup[lookupKey] = element;
  }

  return lookup;
}

export default function TableProvider({ elementTable, children }: ProviderProps) {
  const symbolLookup = useMemo<Record<string, TableElement>|null>(() => createLookup(elementTable, (entry) => {
    return entry.symbol;
  }), [elementTable]);

  const groupLookup = useMemo<Record<number, TableElement[]>|null>(() => {
    if (!elementTable) return null;

    const lookup: Record<number, TableElement[]> = {};

    for (const key of Object.keys(elementTable)) {
      if (key === "order") continue;

      const element = elementTable[key];

      if (!element || element.type !== "element") continue;

      const groupKey = Math.floor(element.group);

      if (!lookup[groupKey]) {
        lookup[groupKey] = []
      }

      lookup[groupKey].push(element);
    }

    return lookup;
  }, [elementTable])
  
  const periodLookup = useMemo<Record<number, TableElement[]>|null>(() => {
    if (!elementTable) return null;

    const lookup: Record<number, TableElement[]> = {};

    for (const key of Object.keys(elementTable)) {
      if (key === "order") continue;

      const element = elementTable[key];

      if (!element || element.type !== "element") continue;

      const periodKey = Math.floor(element.period)

      if (!lookup[periodKey]) {
        lookup[periodKey] = []
      }

      lookup[periodKey].push(element);
    }

    return lookup;
  }, [elementTable])
  
  const providerObject: PeriodicTableProviderObject = useMemo(() => ({
    elementTable,

    elementSymbolLookup: symbolLookup,
    groupLookup,
    periodLookup
  }), [elementTable, symbolLookup, groupLookup, periodLookup])
  
  return (
    <PeriodicTableProvider.Provider value={providerObject}>
      {children}
    </PeriodicTableProvider.Provider>
  )
}