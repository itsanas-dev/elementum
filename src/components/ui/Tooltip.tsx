import type { TooltipPosition, TooltipSide } from "@/lib/types";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import "@/assets/css/tooltip.css"
import { createPortal } from "react-dom";
import { getFocusableElements } from "@/lib/focus";

type TooltipProps = {
  trigger: HTMLElement,
  close: () => void
} & JSX.IntrinsicElements["div"]

type Vec2 = {x: number, y: number}

const SideStyles: Record<TooltipSide, (pos: Vec2) => React.CSSProperties> = {
  left:   ({ x, y }) => ({ right: `${window.innerWidth - x}px`, top:  `${y}px`, transform: "translate(0, -50%)" }),
  right:  ({ x, y }) => ({ left:  `${x}px`, top:  `${y}px`, transform: "translate(0, -50%)" }),
  top:    ({ x, y }) => ({ left:  `${x}px`, top:  `${y}px`, transform: "translate(-50%, -100%)" }),
  bottom: ({ x, y }) => ({ left:  `${x}px`, top:  `${y}px`, transform: "translate(-50%, 0)" }),
};

function vec2(x: number, y: number): Vec2 {
  return {x, y}
}

function getTooltipPosition(element: HTMLElement): TooltipPosition {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const rect = element.getBoundingClientRect();
  const centreX = rect.left + rect.width / 2;
  const centreY = rect.top + rect.height / 2;

  const windowRightBoundary = 0.8 * windowWidth;
  const windowLeftBoundary = 0.2 * windowWidth;
  const windowTopBoundary = 0.275 * windowHeight;
  const windowBottomBoundary = 0.725 * windowHeight;

  const tooltipPaddingPx = 10;

  if (rect.right >= windowRightBoundary) {
    return {
      side: "left",
      position: vec2(
        rect.left - tooltipPaddingPx,
        centreY
      )
    }
  }
  
  if (rect.left <= windowLeftBoundary) {
    return {
      side: "right",
      position: vec2(
        rect.right + tooltipPaddingPx,
        centreY
      )
    }
  }

  if (rect.top <= windowTopBoundary) {
    return {
      side: "bottom",
      position: vec2(centreX, rect.bottom + tooltipPaddingPx)
    }
  }
  
  if (rect.bottom >= windowBottomBoundary) {
    return {
      side: "top",
      position: vec2(centreX, rect.top - tooltipPaddingPx)
    }
  }

  return {
    side: "right",
    position: vec2(rect.right + tooltipPaddingPx, centreY)
  }
}

function TooltipPortal({children, trigger, className, ...rest}: Omit<TooltipProps, "container" | "close">) {
  const [tooltipPos, setTooltipPos] = useState(() => getTooltipPosition(trigger));

  useEffect(() => {
    if (!trigger) return;

    let updatePending = false;

    function updateTooltipAgain() {
      if (updatePending) return;

      updatePending = true;
      
      requestAnimationFrame(() => {
        setTooltipPos(getTooltipPosition(trigger));
        updatePending = false;
      });
    }

    window.addEventListener("scroll", updateTooltipAgain);
    window.addEventListener("resize", updateTooltipAgain);

    return () => {
      window.removeEventListener("scroll", updateTooltipAgain);
      window.removeEventListener("resize", updateTooltipAgain);
    }
  }, [trigger])

  return (
    <div 
      {...rest}
      role="tooltip"
      data-side={tooltipPos.side}
      style={{
        position: "fixed",
        ...SideStyles[tooltipPos.side](tooltipPos.position)
      }}
      className={clsx("card tooltip", className)}
    >
      <div data-focustrap="start" aria-hidden tabIndex={0}></div>
      {children}
      <div data-focustrap="end" aria-hidden tabIndex={0}></div>
    </div>
  )
}

export default function Tooltip(props: Omit<TooltipProps, "ref">) {
  const tooltipPortal = useMemo(() => document.querySelector(`#__tooltip-portal`) as HTMLElement, []);
  const { close, ...propsRest } = props;
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipRef.current) return;
    
    const tooltipElement = tooltipRef.current;
    let focusables = getFocusableElements(tooltipElement);

    function onDomChange() {
      focusables = getFocusableElements(tooltipElement);
    }

    function checkFocus(e: Event) {
      const target = e.target as HTMLElement;

      if (target.dataset.focustrap) {
        e.preventDefault();

        // FIXME: When we focus into the button, we can't seem to reopen it again with Space/Enter, until
        // we move, which is probably because we programmatically .focus() into it. That's kind of dumb,
        // and I don't understand how we can fix it.
        close();   
        requestAnimationFrame(() => propsRest.trigger?.focus());
      }
    }

    focusables[0].focus();

    const observer = new MutationObserver(onDomChange);
    observer.observe(tooltipElement, { childList: true, subtree: true });

    tooltipElement.addEventListener("focusin", checkFocus);

    return () => {
      tooltipElement.removeEventListener("focusin", checkFocus);
      observer.disconnect()
    }

  }, [propsRest.trigger])

  useEffect(() => {
    function hideTooltip(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const target = e.target as HTMLElement;

      if (target.closest(".table-entry")) return;
      if (target.closest(".tooltip")) return;

      close();
    }

    function hideTooltipOnUnfocus(e: FocusEvent) {
      const target = e.target as HTMLElement;

      if (tooltipRef.current?.contains(target)) return;

      close();
    }

    function onKeyPress(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }

    window.addEventListener("pointerup", hideTooltip);
    window.addEventListener("keyup", onKeyPress);
    document.addEventListener("focusin", hideTooltipOnUnfocus)

    return () => {
      window.removeEventListener("pointerup", hideTooltip);
      window.removeEventListener("keyup", onKeyPress);
      document.removeEventListener("focusin", hideTooltipOnUnfocus)
    }
  }, [close])

  return (
    <>
      {createPortal(
        <TooltipPortal {...propsRest} ref={tooltipRef} />,
        tooltipPortal
      )}
    </>
  )
}