import { TooltipContext } from "@/provider/TooltipContext"
import { type TableElement, type TooltipPosition, type TooltipState } from "@/types"
import { useContext, useEffect, useRef, useState, type JSX, type ReactNode } from "react"
import ElementInfo from "../ElementInfo"
import { PeriodicTableContext } from "@/provider/PeriodicTableContext"
import "@/assets/css/tooltip.css"
import clsx from "clsx"

type Props = {
  children: ReactNode
}

type TooltipProps = {
  trigger: HTMLElement
} & JSX.IntrinsicElements["div"]

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

function Tooltip({children, trigger, className, ...rest}: TooltipProps) {
  const side = getTooltipPosition(trigger);
  const isLeftSide = side.side === "left";

  const positionStyle = isLeftSide
    ? { right: `${Math.floor(window.innerWidth - side.position.x)}px`, top: `${Math.floor(side.position.y)}px` }
    : { left: `${Math.floor(side.position.x)}px`, top: `${Math.floor(side.position.y)}px` };

  return (
    <div 
      {...rest}
      role="tooltip"
      data-side={side.side}
      style={positionStyle}
      className={clsx("tooltip", className)}
    >
      {children}
    </div>
  )
}

export default function TooltipProvider({ children }: Props) {
  const {elementTable} = useContext(PeriodicTableContext)
  const tooltipPortal = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipState, setTooltipState] = useState<TooltipState|null>(null);


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

      if (tooltipRef.current?.contains(target)) return;

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

  return (
    <TooltipContext.Provider 
      value={{
        currentTooltipRef: tooltipRef, 
        tooltipState: tooltipState, 
        setTooltipState,
      }}
    >
      <div ref={tooltipPortal} id="portal--tooltip">
        {(elementTable && tooltipState && tooltipState.trigger && tooltipState.selectedElement !== "" && elementTable[tooltipState.selectedElement]) && 
          <Tooltip id="element-info-tooltip" ref={tooltipRef} trigger={tooltipState.trigger}>
            <ElementInfo element={elementTable[tooltipState.selectedElement] as TableElement} />
          </Tooltip>
        }
      </div>
      {children}
    </TooltipContext.Provider>
  )
}