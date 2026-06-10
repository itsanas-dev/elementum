import type { SearchWarning } from "@/lib/search"
import { AlertTriangle } from "lucide-react"

type SearchboxWarningProps = {
  warning: SearchWarning
}

function plural(word: string, n: number) {
  return (n === 1 ? word : (word + 's'))
}

const warnings: { [K in SearchWarning["kind"] ]: (w: Extract<SearchWarning, { kind: K }>) => string } = {
  "argument_mismatch": (w) => `Expected ${w.expected} ${plural("element", w.expected)}, got ${w.received} ${plural("element", w.received)}.`,
  "element_only_query": (_) => `Compounds are not allowed, only elements.`,
  "quantity_mismatch": (w) => `Mismatch of physical quantities (expected ${w.required} quantities)`,
  "unexpected_quantity": (_) => `Unexpected physical quantity encountered.`,
  "unknown_element": (w) => `Unknown element "${w.token}"`
}

function getWarningMessage<K extends SearchWarning["kind"]>(w: Extract<SearchWarning, { kind: K }>) {
  return warnings[w.kind](w);
}

export default function SearchboxWarning({ warning }: SearchboxWarningProps) {
  return (
    <div className="searchbox-warning">
      <AlertTriangle className="icon-noshrink" size={14} />
      <p>{warning.actionId}: {getWarningMessage(warning)}</p>
    </div>
  )
}