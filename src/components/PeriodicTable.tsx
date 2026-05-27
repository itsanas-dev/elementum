import {type PeriodicTableSchema, type TableEntry } from "@/types"
import { ElementBlock } from "./ElementBlock";
import SeparatorBlock from "./SeparatorBlock";
import React, { useContext } from "react";
import { TooltipContext } from "@/provider/TooltipContext";

type PeriodicTableComponentProps = {
  table: PeriodicTableSchema
}

function PeriodicTableComponent({table}: PeriodicTableComponentProps) {  
  const { setTooltipState, tooltipState } = useContext(TooltipContext);

  function showTooltip(elementId: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (e.button !== 0) return;
    if (tooltipState?.selectedElement === elementId) return;

    const target = e.target as HTMLElement;

    if (tooltipState?.trigger === target) return;
    
    setTooltipState({
      selectedElement: elementId,
      trigger: target,
    });
  }

  return (
    <>
      <div className="ptable-wrapper">
        <div role="grid" className="ptable">
          {table.order.map((elementId) => {
            const entry: TableEntry|undefined = table[elementId];

            if (!entry) return null;

            switch (entry.type) {
              case "element": {
                return <ElementBlock
                  key={entry.symbol}
                  data-element={elementId}
                  aria-labelledby={tooltipState?.selectedElement === elementId ? `element-info-tooltip` : undefined}
                  onClick={(e) => showTooltip(elementId, e)}
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