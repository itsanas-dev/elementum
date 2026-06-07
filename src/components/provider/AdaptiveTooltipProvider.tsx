import { type TableElement, type AdaptiveTooltipState } from "@/lib/types"
import { useContext, useMemo, useState, type ReactNode } from "react"
import ElementInfo from "@/components/ui/ElementInfo"
import { AppContext } from "@/provider/PeriodicTableContext"
import useMediaQuery from "@/hooks/useMediaQuery"
import Modal from "@/components/ui/modal/Modal"
import Tooltip from "@/components/ui/Tooltip"
import { AdaptiveTooltipContext } from "@/provider/AdaptiveTooltipContext"

const TOOLTIP_PORTAL_ID = "__tooltip-portal";

function AdaptivePopover({state, close}: {state: AdaptiveTooltipState, close: () => void}) {
  const {elementTable} = useContext(AppContext);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const element = elementTable![state.elementId] as TableElement;
  const tooltipPortal = useMemo(() => document.querySelector(`#${TOOLTIP_PORTAL_ID}`) as HTMLElement, []);

  return (
    <>
      {isMobile ?
        <Modal container={tooltipPortal} open={true} closeModal={close}>
          <ElementInfo element={element} />
        </Modal>
        :
        <Tooltip container={tooltipPortal} close={close} trigger={state.trigger!}>
          <ElementInfo element={element} />
        </Tooltip>
      }
    </>
  )
}

export default function AdaptiveTooltipProvider({children}: {children: ReactNode}) {
  const [state, updateState] = useState<AdaptiveTooltipState>({
    show: false,
    elementId: "",
    trigger: null
  });

  function show(id: string, trigger: HTMLElement|null) {
    updateState((m) => ({...m, elementId: id, show: true, trigger}))
  }

  function close() {
    updateState((s) => ({...s!, show: false, elementId: ""}));
  }

  return (
    <AdaptiveTooltipContext.Provider value={{state, showTooltip: show, hideTooltip: close}}>
      {(state.show && state.elementId.length > 0)
        && <AdaptivePopover state={state} close={close} />
      }
      
      <div id={TOOLTIP_PORTAL_ID}></div>
      {children}
    </AdaptiveTooltipContext.Provider>
  )
}