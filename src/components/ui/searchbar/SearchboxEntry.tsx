import { evaluateSearchIntent } from "@/lib/search"
import type { ParsedElement, SearchCandidate } from "@/lib/searchTypes"
import type { PhysicalQuantity } from "@/lib/unitConversion"
import { ConfigContext } from "@/provider/ConfigContext"
import { AppContext } from "@/provider/PeriodicTableContext"
import React, { useContext, useMemo, type ReactNode } from "react"

type SearchboxEntryProps = {
  icon: ReactNode,
  intentEntry: SearchCandidate,
  elements: ParsedElement[],
  quantities: Record<string, PhysicalQuantity>
}

export const SearchboxEntry = React.memo(({ icon, quantities, intentEntry, elements }: SearchboxEntryProps) => {
  const { elementTable, groupLookup, periodLookup } = useContext(AppContext);
  const { preferredDensityUnit, preferredTemperatureUnit } = useContext(ConfigContext);
  const evaluation = useMemo(() => evaluateSearchIntent({
    config: {preferredDensityUnit, preferredTemperatureUnit},
    elements,
    intent: intentEntry,
    quantities,
    table: {allElements: elementTable!, groupLookup, periodLookup}
  }), [preferredDensityUnit, preferredTemperatureUnit, elementTable, groupLookup, periodLookup])
  
  if (!evaluation) return null;

  return (
    <button aria-label={`${evaluation.action} ${evaluation.result}`} className="searchbox-entry-wrapper">
      {icon}
      <div className="searchbox-entry" aria-hidden>
        {
          (evaluation.action && evaluation.action.length > 0) && 
          <p className="searchbox-expression text-muted">{evaluation.action}</p>
        }

        {
          (evaluation.result && evaluation.result.length > 0) && 
          <h2 className="searchbox-result">{evaluation.result}</h2>
        }

      </div>
    </button>
  )
})