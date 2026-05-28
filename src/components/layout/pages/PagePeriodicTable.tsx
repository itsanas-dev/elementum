import { type TableEntry } from "@/lib/types"
import { ElementBlock } from "@/components/ui/ElementBlock";
import SeparatorBlock from "@/components/ui/SeparatorBlock";
import React, { useContext } from "react";
import { TooltipContext } from "@/provider/TooltipContext";
import { AppContext } from "@/provider/PeriodicTableContext";

function PeriodicTableComponent() {
  const { elementTable } = useContext(AppContext);
  const { setTooltipState, tooltipState } = useContext(TooltipContext);

  function onElementBlockClick(elementId: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (e.button !== 0) return;
    if (tooltipState?.selectedElement === elementId) return;

    const target = e.target as HTMLElement;

    if (tooltipState?.trigger === target) return;
    
    setTooltipState({
      selectedElement: elementId,
      trigger: target,
    });
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
                  data-selected={(tooltipState?.selectedElement === elementId) || undefined}
                  aria-labelledby={tooltipState?.selectedElement === elementId ? `element-info-tooltip` : undefined}
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