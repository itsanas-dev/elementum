import type { AdaptiveTooltipState } from "@/lib/types"
import { createContext } from "react"

function unimplemented() {
  console.log("Unimplemented. Add AdaptiveTooltipContext.")
}

type AdaptiveTooltipContextObject = {
  state: AdaptiveTooltipState|null,

  showTooltip: (elementId: string, trigger: HTMLElement|null) => void,
  hideTooltip: () => void
}

export const AdaptiveTooltipContext = createContext<AdaptiveTooltipContextObject>({
  state: null,
  showTooltip: unimplemented,
  hideTooltip: unimplemented
})