import { getTextColour } from "@/colour"
import { displayAtomicMass, getEntryColour, shouldDisplayBottomBorder, shouldDisplayRightBorder } from "@/periodicTable"
import type { TableElement } from "@/types"
import clsx from "clsx"
import { type CSSProperties } from "react"

type ElementBlockComponentProps = {
  element: TableElement
}

export default function ElementBlock({element}: ElementBlockComponentProps) {
  const colour = getEntryColour(element);
  const textColour = getTextColour(colour);
  const style = {"--main-color": colour, "--text-color": textColour, gridColumn: element.xpos, gridRow: element.ypos} as CSSProperties;
  
  return (
    <button data-entry-type={element.type} role="gridcell" className={clsx("table-entry", {"border-right": shouldDisplayRightBorder(element), "border-bottom": shouldDisplayBottomBorder(element)})} style={style} aria-label={`${element.name} (${element.symbol}), with atomic number ${element.number.toFixed(0)} and atomic mass ${displayAtomicMass(element.atomic_mass)}`}>
      <span className="element-symbol" aria-hidden>{element.symbol}</span>
      <span className="entry-name" aria-hidden>{element.name}</span>
    
      <span className="label-atomic-number" aria-hidden>{element.number.toFixed(0)}</span>
      <span className="label-atomic-mass" aria-hidden>{displayAtomicMass(element.atomic_mass)}</span>
    </button>
  )
}