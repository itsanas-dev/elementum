import { getDensityByConfig, getTemperatureByConfig } from "@/lib/periodicTable"
import { displayDecimal } from "@/lib/string"
import { ConfigContext } from "@/provider/ConfigContext"
import type { TableElement } from "@/types"
import { useContext } from "react"

type Props = {
  element: TableElement
}

export default function ElementInfo({ element }: Props) {
  const { preferredDensityUnit, preferredTemperatureUnit } = useContext(ConfigContext);
  const densityDisplay = element.density ? getDensityByConfig(element.density, preferredDensityUnit) : "Unknown";
  const meltDisplay = element.melt ? getTemperatureByConfig(element.melt, preferredTemperatureUnit) : "Unknown";
  const boilDisplay = element.boil ? getTemperatureByConfig(element.boil, preferredTemperatureUnit) : "Unknown"

  return (
    <>
      <div className="tooltip-header">
        <div className="tooltip-row">
          <h1 className="tooltip-elementsymbol">{element.symbol}</h1>
          <p className="tooltip-header-secondary">{element.name}</p>
        </div>

        <div className="tooltip-row">
          <p className="tooltip-molarmass">{displayDecimal(element.atomic_mass)} g/mol</p>
          <p className="tooltip-configuration">{element.electron_configuration_semantic}</p>
        </div>
      </div>
      <p>{element.category.substring(0, 1).toUpperCase() + element.category.substring(1)}</p>

      <div aria-hidden className="tooltip-separator"></div>

      <p>Atomic number: <strong>{element.number}</strong></p>
      <p>Density: <strong>{densityDisplay}</strong></p>
      <p>Melting point: <strong>{meltDisplay}</strong></p>
      <p>Boiling point: <strong>{boilDisplay}</strong></p>

      <div aria-hidden className="tooltip-separator"></div>

      <div className="tooltip-content">
        {element.summary}
      </div>
    </>
  )
}