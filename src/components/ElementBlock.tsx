import { getTextColour } from "@/lib/colour"
import { getEntryColour } from "@/lib/periodicTable"
import { displayDecimal } from "@/lib/string"
import { ConfigContext } from "@/provider/ConfigContext"
import type { TableElement } from "@/lib/types"
import clsx from "clsx"
import React, { useContext, type CSSProperties, type JSX, type MouseEvent } from "react"

type ElementBlockComponentProps = Omit<JSX.IntrinsicElements["button"], "onClick"> & {
  element: TableElement,
  onClick?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void,
}

function ElementBlockComponent({ element, onClick, className, ...rest }: ElementBlockComponentProps) {
  const {theme} = useContext(ConfigContext);
  const colour = getEntryColour(theme, element);
  const textColour = getTextColour(colour);
  const style = {"--main-color": colour, "--text-color": textColour, gridColumn: element.xpos, gridRow: element.ypos} as CSSProperties;

  return (
    <>
      <button 
          {...rest}
          data-entry-type={element.type} 
          role="gridcell"
          onClick={(e) => onClick?.(e)}
          className={clsx("table-entry", className)}
          style={style} 
          aria-label={`${element.name} (${element.symbol}), with atomic number ${element.number.toFixed(0)} and atomic mass ${displayDecimal(element.atomic_mass)}`}
        >
        <span className="element-symbol" aria-hidden>{element.symbol}</span>
        <span className="entry-name" aria-hidden>{element.name}</span>
      
        <span className="text-muted label-atomic-number" aria-hidden>{element.number.toFixed(0)}</span>
        <span className="text-muted label-atomic-mass" aria-hidden>{displayDecimal(element.atomic_mass)}</span>
      </button>
    </>
  )
}

export const ElementBlock = React.memo(ElementBlockComponent);