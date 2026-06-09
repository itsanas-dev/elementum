import { useEffect, useId, useRef, type JSX } from "react";
import "@/assets/css/toggleGroup.css"
import clsx from "clsx";

export type ToggleGroupConfig = {
  values: string[],
  groupAriaLabel: string,

  labels: Record<string, string>,
  ariaLabels?: Record<string, string>
}

type ToggleGroupProps = Omit<JSX.IntrinsicElements["div"], "children"|"ref"> & {
  config: ToggleGroupConfig,

  selected: string,
  onSelectionChanged: (item: string) => void
}

type ToggleGroupItemProps = Omit<JSX.IntrinsicElements["button"], "children"> & {
  value: string,
  label: string,
  isSelected: boolean,

  setSelected: (value: string) => void
}

export function ToggleGroupItem({ value, label, isSelected, setSelected, className, ...rest }: ToggleGroupItemProps) {
  return (
    <button
      role="radio"
      aria-checked={isSelected}
      data-value={value}
      onClick={() => setSelected(value)}
      className={clsx("toggle-group-item", {'selected': isSelected}, className)}
      {...rest}
    >
      {label}
    </button>
  )
}

export function ToggleGroup({ selected, config, onSelectionChanged, className, ...rest }: ToggleGroupProps) {
  const id = useId();
  const toggleGroupId = `toggle-group-${id}`
  const toggleGroupRef = useRef<HTMLDivElement>(null);

  const currentlySelected = useRef(selected);
  const onSelectionChangedRef = useRef(onSelectionChanged);

  useEffect(() => {
    currentlySelected.current = selected;
    onSelectionChangedRef.current = onSelectionChanged;
  }, [selected, onSelectionChanged])

  useEffect(() => {
    const groupEl = toggleGroupRef.current!;

    function onCycle(e: KeyboardEvent) {
      const target = (e.target as HTMLElement);

      if (!groupEl.contains(target)) {
        return;
      }

      let targetSibling: HTMLElement|null = null;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetSibling = (target.previousElementSibling || groupEl.lastElementChild) as HTMLElement;
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetSibling = (target.nextElementSibling || groupEl.firstElementChild) as HTMLElement;
      }

      if (!targetSibling) return;

      const value = targetSibling.dataset.value;

      if (!value || value === currentlySelected.current) return;

      e.preventDefault();
      onSelectionChangedRef.current(value);
      targetSibling.focus();
    }

    //
    function onFocusIn(e: FocusEvent) {
      const target = e.target as HTMLElement;
      if (!groupEl.contains(target)) return;

      const value = target.dataset.value;

      if (!value || currentlySelected.current === value) return;

      onSelectionChangedRef.current(value);
    }

    groupEl.addEventListener("keydown", onCycle);
    groupEl.addEventListener("focusin", onFocusIn);

    return () => {
      groupEl.removeEventListener("keydown", onCycle);
      groupEl.removeEventListener("focusin", onFocusIn);
    }
  }, [])
  
  return (
    <div
      ref={toggleGroupRef}
      role="radiogroup"
      aria-label={config.groupAriaLabel}
      id={toggleGroupId} 
      className={clsx("toggle-group", className)}
      {...rest}
    >
      {config.values.map((value) => {
        const label = config.labels[value];

        if (!label) {
          console.warn(`No label on value "${value}" for ToggleGroup.`)
          return;
        }

        const ariaLabel = config.ariaLabels ? config.ariaLabels[value] : label;

        return (
          <ToggleGroupItem 
            key={value} 
            title={ariaLabel}
            value={value}
            label={label}
            isSelected={value === selected} 
            setSelected={onSelectionChanged} 
          />
        )
      })}
    </div>
  )
}