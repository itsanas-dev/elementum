import { markupMolecularFormula, markupSubshell } from "@/lib/markup"
import type { MarkupType } from "@/lib/types"
import { AppContext } from "@/provider/PeriodicTableContext"
import { useContext, useEffect, useRef } from "react"

type MarkupRendererProps = {
  textContent: string,
  markupType: MarkupType
}

export default function MarkupRenderer({ textContent, markupType }: MarkupRendererProps) {
  const { elementSymbolLookup } = useContext(AppContext);
  const markupRendererRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const container = markupRendererRef.current!;

    if (container.textContent !== textContent) {
      container.textContent = textContent;
    }

    switch (markupType) {
      case "molecular_formula":
        return markupMolecularFormula(elementSymbolLookup, container);
      case "subshell":
        return markupSubshell(container);
      default:
        break
    }
  }, [textContent, markupType, elementSymbolLookup])

  return (
    <span ref={markupRendererRef}></span>
  )
}