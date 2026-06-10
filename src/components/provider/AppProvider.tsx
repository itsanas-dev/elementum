import { AppContext, type AppContextObject } from "@/provider/PeriodicTableContext"
import type { PeriodicTableSchema, TableElement } from "@/lib/types"
import { useMemo, type ReactNode } from "react"

type ProviderProps = {
  children: ReactNode,
  elementTable: PeriodicTableSchema|null,
}

function createLookup(table: PeriodicTableSchema|null, mapper: (entry: TableElement) => string) {
  const lookup: Record<string, string> = {};
  
  if (!table) return lookup;

  for (const [key, element] of Object.entries(table.elements)) {
    if (!element) continue;
    
    const lookupKey = mapper(element);
    
    if (!lookupKey) continue;

    lookup[lookupKey] = key;
  }

  return lookup;
}

function createLookupGroup(table: PeriodicTableSchema|null, keyFn: (entry: TableElement) => string): Record<string, string[]> {
  const lookup: Record<string, string[]> = {};
  
  if (!table) return lookup;

  for (const [key, element] of Object.entries(table.elements)) {
    if (!element) continue;

    const groupKey = keyFn(element);

    if (!lookup[groupKey]) {
      lookup[groupKey] = []
    }

    lookup[groupKey].push(key);
  }

  return lookup;
}

export default function AppProvider({ elementTable, children }: ProviderProps) {
  const symbolLookup = useMemo<Record<string, string>>(() => createLookup(elementTable, (entry) => {
    return entry.symbol;
  }), [elementTable]);

  const groupLookup = useMemo<Record<string, string[]>>(
    () => createLookupGroup(elementTable, (el) => `group_${el.group.toFixed(0)}`)
  , [elementTable]);

  const periodLookup = useMemo(
  () => createLookupGroup(elementTable, 
    (el) => `period_${el.period.toFixed(0)}`
  ), [elementTable])

  const providerObject: AppContextObject = useMemo(() => ({
    elementTable,

    elementSymbolLookup: symbolLookup,
    groupLookup,
    periodLookup
  }), [elementTable, symbolLookup, groupLookup, periodLookup])
  
  return (
    <AppContext.Provider value={providerObject}>
      {children}
    </AppContext.Provider>
  )
}