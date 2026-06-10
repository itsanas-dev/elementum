import { getTextColour } from "@/lib/colour"
import { getEntryColour } from "@/lib/periodicTable"
import { displayDecimal } from "@/lib/string"
import { ConfigContext } from "@/provider/ConfigContext"
import clsx from "clsx"
import React, { useContext, useMemo, type CSSProperties, type JSX, type MouseEvent } from "react"
import { AdaptiveTooltipContext } from "@/provider/AdaptiveTooltipContext"
import { AppContext } from "@/provider/PeriodicTableContext"

type ElementBlockComponentProps = Omit<JSX.IntrinsicElements["button"], "onClick"> & {
  elementId: string,
  onClick?: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void,
}

function ElementBlockComponent({ elementId, onClick, className, ...rest }: ElementBlockComponentProps) {
  const {theme} = useContext(ConfigContext);
  const { state } = useContext(AdaptiveTooltipContext);
  const { elementTable } = useContext(AppContext);
  const element = elementTable?.elements[elementId];
  const [colour, textColour] = useMemo(() => {
    if (!element) return [];

    const c = getEntryColour(theme, element);
    return [c, getTextColour(c)];
  }, [theme, element]);
  
  const style = element ? ({"--main-color": colour, "--text-color": textColour, gridColumn: element.xpos, gridRow: element.ypos} as CSSProperties) : null;

  if (!element) return null;

  return (
    <>
      <button 
          {...rest}
          role="gridcell"
          data-entry-type={element.type}
          data-selected={(state?.elementId === elementId)}
          data-element={elementId}
          aria-labelledby={state?.elementId === elementId ? `element-info-modal` : undefined}
          onClick={(e) => onClick?.(e)}
          className={clsx("table-entry", className)}
          style={style!} 
          aria-label={`${element.name} (${element.symbol}), with atomic number ${element.number.toFixed(0)} and atomic mass ${displayDecimal(element.atomic_mass)}`}
        >
        <span className="element-symbol" aria-hidden>{element.symbol}</span>
        <span className="entry-name" aria-hidden>{element.name}</span>
      
        <span className="label-atomic-number" aria-hidden>{element.number.toFixed(0)}</span>
        <span className="label-atomic-mass" aria-hidden>{displayDecimal(element.atomic_mass)}</span>
      </button>
    </>
  )
}

export const ElementBlock = React.memo(ElementBlockComponent);