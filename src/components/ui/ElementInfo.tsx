import { getDensityByConfig, getTemperatureByConfig } from "@/lib/unitConversion"
import { displayDecimal } from "@/lib/string"
import { ConfigContext } from "@/provider/ConfigContext"
import type { TableElement } from "@/lib/types"
import { useContext, type KeyboardEvent } from "react"
import "@/assets/css/elementModal.css"
import { ExternalLink } from "lucide-react"

type Props = {
  element: TableElement
}

function titleFirstWordOnly(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.substring(1)}`
}

export default function ElementInfo({ element }: Props) {
  const { preferredDensityUnit, preferredTemperatureUnit } = useContext(ConfigContext);
  const densityDisplay = element.density ? getDensityByConfig(element.density, preferredDensityUnit) : "Unknown";
  const meltDisplay = element.melt ? getTemperatureByConfig(element.melt, preferredTemperatureUnit) : "Unknown";
  const boilDisplay = element.boil ? getTemperatureByConfig(element.boil, preferredTemperatureUnit) : "Unknown"

  function allowCopy(e: KeyboardEvent<HTMLElement>) {
    const target = (e.target as HTMLElement);

    if (e.key.toLowerCase() === "c" && e.ctrlKey) {
      const textContent = target.textContent;
      
      e.preventDefault();
      navigator.clipboard.writeText(textContent);
    }
  }

  return (
    <>
      <div aria-describedby="elementinfo-copyhint" className="elementinfo-header">
        <p id="elementinfo-copyhint" className="sr-only">
          Press Ctrl+C on any value to copy it
        </p>
        <div className="elementinfo-row">
          <h1 tabIndex={0} onKeyDown={allowCopy} className="elementinfo-symbol">{element.symbol}</h1>
          <p tabIndex={0} onKeyDown={allowCopy} className="elementinfo-secondary">{element.name}</p>
        </div>

        <div className="elementinfo-row">
          <p tabIndex={0} onKeyDown={allowCopy} className="elementinfo-molarmass">{displayDecimal(element.atomic_mass)} g/mol</p>
        </div>
      </div>
      <p tabIndex={0} onKeyDown={allowCopy}>{titleFirstWordOnly(element.category)}</p>
      <strong tabIndex={0} onKeyDown={allowCopy}>{element.electron_configuration_semantic}</strong>

      <div aria-hidden className="elementinfo-separator"></div>

      <p>Atomic number: <strong tabIndex={0} onKeyDown={allowCopy}>{element.number}</strong></p>
      <p>Density: <strong tabIndex={0} onKeyDown={allowCopy}>{densityDisplay}</strong></p>
      <p>Melting point: <strong tabIndex={0} onKeyDown={allowCopy}>{meltDisplay}</strong></p>
      <p>Boiling point: <strong tabIndex={0} onKeyDown={allowCopy}>{boilDisplay}</strong></p>
      <p>Appearance: <strong tabIndex={0} onKeyDown={allowCopy}>{element.appearance || "Unknown"}</strong></p>
      
      {
      element.electronegativity_pauling &&
        <p>Electronegativity: <strong tabIndex={0} onKeyDown={allowCopy}>{element.electronegativity_pauling}</strong></p>
      }

      <div aria-hidden className="elementinfo-separator"></div>

      <div tabIndex={0} onKeyDown={allowCopy} className="elementinfo-summary">
        {element.summary}
      </div>

      <a target="_blank" className="elementinfo-link" href={element.source}>
        <ExternalLink width={14} height={14} />
        Source: Wikipedia
      </a>
    </>
  )
}