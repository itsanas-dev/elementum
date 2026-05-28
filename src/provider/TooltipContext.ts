import type { TooltipState } from "@/lib/types"
import { createContext, type RefObject, type SetStateAction } from "react"


export type TooltipObject = {
  tooltipState: TooltipState|null,
  setTooltipState: React.Dispatch<SetStateAction<TooltipState|null>>,

  currentTooltipRef: RefObject<HTMLDivElement|null>|null,
}

export const TooltipContext = createContext<TooltipObject>({
  tooltipState: null,
  setTooltipState: () => console.log(`Add TooltipProvider, it's not present.`),

  currentTooltipRef: null
})