import {type PeriodicTableSchema, type TableElement, type TableEntry, type TooltipPosition } from "@/types"
import { ElementBlock } from "./ElementBlock";
import SeparatorBlock from "./SeparatorBlock";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Tooltip from "./ElementTooltip";

type PeriodicTableComponentProps = {
  table: PeriodicTableSchema
}

type TooltipState = {
  clickedElement: string,
  position: TooltipPosition
}

function vec2(x: number, y: number) {
  return {x, y}
}

function getTooltipPosition(element: HTMLElement): TooltipPosition {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const rect = element.getBoundingClientRect();
  const centreX = rect.left + rect.width / 2;
  const centreY = rect.top + rect.height / 2;

  const windowRightBoundary = 0.8 * windowWidth;
  const windowLeftBoundary = 0.2 * windowWidth;
  const windowTopBoundary = 0.275 * windowHeight;
  const windowBottomBoundary = 0.725 * windowHeight;

  const tooltipPaddingPx = 10;

  if (rect.right >= windowRightBoundary) {
    return {
      side: "left",
      position: vec2(
        rect.left - tooltipPaddingPx,
        centreY
      )
    }
  }
  
  if (rect.left <= windowLeftBoundary) {
    return {
      side: "right",
      position: vec2(
        rect.right + tooltipPaddingPx,
        centreY
      )
    }
  }

  if (rect.top <= windowTopBoundary) {
    return {
      side: "bottom",
      position: vec2(centreX, rect.bottom + tooltipPaddingPx)
    }
  }
  
  if (rect.bottom >= windowBottomBoundary) {
    return {
      side: "top",
      position: vec2(centreX, rect.top - tooltipPaddingPx)
    }
  }

  return {
    side: "right",
    position: vec2(rect.right + tooltipPaddingPx, centreY)
  }
}

export default function PeriodicTable({table}: PeriodicTableComponentProps) {  
  const tooltipPortal = useMemo(() => (document.querySelector("#portal--tooltip") as HTMLElement), [])
  const [tooltipState, setTooltipState] = useState<TooltipState|null>(null);
  const currentTooltipRef = useRef<HTMLDivElement>(null);
  const id = useId();

  function showTooltip(elementId: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (e.button !== 0) return;
    if (tooltipState?.clickedElement === elementId) return;

    const target = e.target as HTMLElement;
    
    setTooltipState({
      clickedElement: elementId,
      position: getTooltipPosition(target)
    });
  }

  useEffect(() => {
    function hideTooltip(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const target = e.target as HTMLElement;

      if (target.closest(".table-entry")) return;
      if (target.closest(".tooltip")) return;

      setTooltipState(null);
    }

    function hideTooltipOnUnfocus(e: FocusEvent) {
      const target = e.target as HTMLElement;

      if (currentTooltipRef.current?.contains(target)) return;

      setTooltipState(null);
    }

    function onKeyPress(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setTooltipState(null);
      }
    }

    window.addEventListener("pointerup", hideTooltip);
    window.addEventListener("keyup", onKeyPress);
    document.addEventListener("focusin", hideTooltipOnUnfocus)

    return () => {
      window.removeEventListener("pointerup", hideTooltip);
      window.removeEventListener("keyup", onKeyPress);
      document.removeEventListener("focusin", hideTooltipOnUnfocus)
    }
  }, [])

  useEffect(() => {
    if (currentTooltipRef.current) {
      currentTooltipRef.current.focus()
    }
  }, [tooltipState])

  return (
    <>
      {
        (tooltipState !== null) &&
        createPortal(
          <Tooltip
            id={`tooltip-${id}`}
            ref={currentTooltipRef}
            element={table[tooltipState.clickedElement] as TableElement}
            side={tooltipState.position}
          />,
          tooltipPortal
        )
      }
      <div className="ptable-wrapper">
        <div role="grid" className="ptable">
          {table.order.map((elementId) => {
            const entry: TableEntry|undefined = table[elementId];

            if (!entry) return null;

            switch (entry.type) {
              case "element": {
                return <ElementBlock
                  key={entry.symbol}
                  aria-labelledby={tooltipState?.clickedElement === elementId ? `tooltip-${id}` : undefined}
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