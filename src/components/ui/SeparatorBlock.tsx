import { getEntryColour } from "@/lib/periodicTable"
import { ConfigContext } from "@/provider/ConfigContext";
import type { TableSeries } from "@/lib/types"
import { useContext } from "react";

type SeparatorBlockComponentProps = {
  series: TableSeries
}

export default function SeparatorBlock({ series }: SeparatorBlockComponentProps) {
  const {theme} = useContext(ConfigContext);
  const colour = getEntryColour(theme, series);

  return (
    <button 
      role="gridcell" 
      style={{
        borderColor: colour, 
        gridColumn: series.xpos, 
        gridRow: series.ypos
      }}
      data-entry-type="series" 
      className="table-entry"
      data-series={series.name}
      aria-label={`${series.name}, which range from atomic number ${series.range[0]} to ${series.range[1]}.`}
    >
      <span className="separator-range-label" aria-hidden>{`${series.range[0].toFixed(0)} - ${series.range[1].toFixed(0)}`}</span>
      <span className="entry-name" aria-hidden>{series.name}</span>
    </button>
  )
}