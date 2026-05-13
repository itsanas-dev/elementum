import type { PeriodicTableStruct, TableEntry } from "@/types"
import ElementBlock from "./ElementBlock";
import SeparatorBlock from "./SeparatorBlock";

type PeriodicTableComponentProps = {
  table: PeriodicTableStruct
}

export default function PeriodicTable({table}: PeriodicTableComponentProps) {
  return (
    <div className="ptable-wrapper">
      <div role="grid" className="ptable">
        {table.order.map((elementId) => {
          const entry: TableEntry|undefined = table[elementId];

          if (!entry) return null;

          switch (entry.type) {
            case "element":
              return <ElementBlock key={elementId} element={entry} />
            case "separation":
              return <SeparatorBlock key={elementId} separator={entry} />
          }
        })}
      </div>
    </div>
  )
}