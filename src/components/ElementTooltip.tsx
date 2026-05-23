import { displayDecimal } from "@/util/string";
import type { TableElement, TooltipPosition } from "@/types";
import clsx from "clsx";
import type { JSX } from "react";
import { toTitleCase } from "@/util/string";

type TooltipProps = {
  side: TooltipPosition
  element: TableElement
} & JSX.IntrinsicElements["div"]

export default function Tooltip({element, side, className, ...rest}: TooltipProps) {
  const isLeftSide = side.side === "left";

  const positionStyle = isLeftSide
    ? { right: `${Math.floor(window.innerWidth - side.position.x)}px`, top: `${Math.floor(side.position.y)}px` }
    : { left: `${Math.floor(side.position.x)}px`, top: `${Math.floor(side.position.y)}px` };

  return (
    <div 
      role="tooltip"
      data-side={side.side}
      style={positionStyle}
      tabIndex={-1}
      className={clsx("tooltip", className)}
      {...rest}
    >
      <div className="tooltip-header">
        <div className="tooltip-row">
          <h1 className="tooltip-elementsymbol">{element.symbol}</h1>
          <p className="tooltip-header-secondary">{element.name}</p>
        </div>

        <div className="tooltip-row">
          <p className="tooltip-molarmass">{displayDecimal(element.atomic_mass)}</p>
          <p className="tooltip-configuration">{element.electron_configuration_semantic}</p>
        </div>
      </div>
      <p>{element.category.substring(0, 1).toUpperCase() + element.category.substring(1)}</p>

      <div aria-hidden className="tooltip-separator"></div>

      <p>Atomic number: {element.number}</p>
      {element.density && <p>Density: {displayDecimal(element.density)} g/cm<sup>3</sup></p>}

      <div aria-hidden className="tooltip-separator"></div>

      <div className="tooltip-content">
        {element.summary}
      </div>
    </div>
  )
}