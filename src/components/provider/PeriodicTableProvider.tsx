import { PeriodicTableContext, type PeriodicTableContextObject } from "@/provider/PeriodicTableContext"
import type { PeriodicTableSchema, TableElement } from "@/types"
import { useMemo, type ReactNode } from "react"

type ProviderProps = {
  children: ReactNode,
  elementTable: PeriodicTableSchema|null
}

function createLookup(table: PeriodicTableSchema|null, mapper: (entry: TableElement) => string) {
  if (!table) return null;

  const lookup: Record<string, string> = {};

  for (const key of Object.keys(table)) {
    if (key === "order") continue;

    const element = table[key];

    if (!element || element.type !== "element") continue;

    const lookupKey = mapper(element);
    
    if (!lookupKey) continue;

    lookup[lookupKey] = key;
  }

  return lookup;
}

export default function PeriodicTableProvider({ elementTable, children }: ProviderProps) {
  const symbolLookup = useMemo<Record<string, string>|null>(() => createLookup(elementTable, (entry) => {
    return entry.symbol;
  }), [elementTable]);

  const groupLookup = useMemo<Record<number, string[]>|null>(() => {
    if (!elementTable) return null;

    const lookup: Record<number, string[]> = {};

    for (const key of Object.keys(elementTable)) {
      if (key === "order") continue;

      const element = elementTable[key];

      if (!element || element.type !== "element") continue;

      const groupKey = Math.floor(element.group);

      if (!lookup[groupKey]) {
        lookup[groupKey] = []
      }

      lookup[groupKey].push(key);
    }

    return lookup;
  }, [elementTable])
  
  const periodLookup = useMemo<Record<number, string[]>|null>(() => {
    if (!elementTable) return null;

    const lookup: Record<number, string[]> = {};

    for (const key of Object.keys(elementTable)) {
      if (key === "order") continue;

      const element = elementTable[key];

      if (!element || element.type !== "element") continue;

      const periodKey = Math.floor(element.period)

      if (!lookup[periodKey]) {
        lookup[periodKey] = []
      }

      lookup[periodKey].push(key);
    }

    return lookup;
  }, [elementTable])
  
  const providerObject: PeriodicTableContextObject = useMemo(() => ({
    elementTable,

    elementSymbolLookup: symbolLookup,
    groupLookup,
    periodLookup
  }), [elementTable, symbolLookup, groupLookup, periodLookup])
  
  return (
    <PeriodicTableContext.Provider value={providerObject}>
      {children}
    </PeriodicTableContext.Provider>
  )
}