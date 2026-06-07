import { type TableEntry } from "@/lib/types"
import { ElementBlock } from "@/components/ui/ElementBlock";
import SeparatorBlock from "@/components/ui/SeparatorBlock";
import React, { useContext } from "react";
import { AppContext } from "@/provider/PeriodicTableContext";
import { AdaptiveTooltipContext } from "@/provider/AdaptiveTooltipContext";

function PeriodicTableComponent() {
  const { elementTable } = useContext(AppContext);
  const { state, showTooltip } = useContext(AdaptiveTooltipContext);

  function onElementBlockClick(elementId: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (e.button !== 0) return;
    if (state?.elementId === elementId) return;

    const target = e.target as HTMLElement;

    if (state?.trigger === target) return;

    showTooltip(elementId, target);
  }

  if (!elementTable) return null;

  return (
    <>
      <div className="ptable-wrapper">
        <div role="grid" className="ptable">
          {elementTable.order.map((elementId) => {
            const entry: TableEntry|undefined = elementTable[elementId];

            if (!entry) return null;

            switch (entry.type) {
              case "element": {
                return <ElementBlock
                  key={entry.symbol}
                  data-element={elementId}
                  data-selected={(state?.elementId === elementId)}
                  aria-labelledby={state?.elementId === elementId ? `element-info-modal` : undefined}
                  onClick={(e) => onElementBlockClick(elementId, e)}
                  element={entry} 
                />
              }
              case "separation":
                return <SeparatorBlock
                      key={elementId} 
                      separator={entry} 
                    />
            }
          })}
        </div>
      </div>
    </>
  )
}

export const PeriodicTable = React.memo(PeriodicTableComponent);