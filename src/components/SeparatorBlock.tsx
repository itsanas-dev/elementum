import { getEntryColour } from "@/lib/periodicTable"
import { ConfigContext } from "@/provider/ConfigContext";
import type { TableSeparator } from "@/types"
import { useContext } from "react";

type SeparatorBlockComponentProps = {
  separator: TableSeparator
}

export default function SeparatorBlock({separator}: SeparatorBlockComponentProps) {
  const {theme} = useContext(ConfigContext);
  const colour = getEntryColour(theme, separator);

  return (
    <button 
      data-entry-type="element-group" 
      role="gridcell" 
      style={{borderColor: colour, gridColumn: separator.xpos, gridRow: separator.ypos}} 
      className="table-entry" 
      aria-label={`${separator.name}, which range from atomic number ${separator.range[0]} to ${separator.range[1]}.`}
    >
      <span className="separator-range-label" aria-hidden>{`${separator.range[0].toFixed(0)} - ${separator.range[1].toFixed(0)}`}</span>
      <span className="entry-name" aria-hidden>{separator.name}</span>
    </button>
  )
}