import { getEntryColour, shouldDisplayBottomBorder, shouldDisplayRightBorder } from "@/util/periodicTable"
import type { TableSeparator } from "@/types"
import clsx from "clsx"

type SeparatorBlockComponentProps = {
  separator: TableSeparator
}

export default function SeparatorBlock({separator}: SeparatorBlockComponentProps) {

  return (
    <button data-entry-type="element-group" role="gridcell" style={{borderColor: getEntryColour(separator), gridColumn: separator.xpos, gridRow: separator.ypos}} className={clsx("table-entry", {"border-right": shouldDisplayRightBorder(separator), "border-bottom": shouldDisplayBottomBorder(separator)})} aria-label={`${separator.name}, which range from atomic number ${separator.range[0]} to ${separator.range[1]}.`}>
      <span className="separator-range-label" aria-hidden>{`${separator.range[0].toFixed(0)} - ${separator.range[1].toFixed(0)}`}</span>
      <span className="entry-name" aria-hidden>{separator.name}</span>
    </button>
  )
}