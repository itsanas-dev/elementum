import Modal from "@/components/ui/modal/Modal";
import ModalContent from "@/components/ui/modal/ModalContent";
import ModalHeader from "@/components/ui/modal/ModalHeader";
import ModalTitle from "@/components/ui/modal/ModalTitle";
import { ToggleGroup, type ToggleGroupConfig } from "@/components/ui/settings/ToggleGroup";
import type { DensityUnit, TemperatureUnit } from "@/lib/types";
import { ConfigContext } from "@/provider/ConfigContext";
import { useContext, type ReactNode } from "react";

type ConfigFieldProps = {
  id: string,
  label: string,
  desc?: string,
  children: ReactNode
}

const temperatureToggleGroup: ToggleGroupConfig = {
  values: ["celsius", "fahrenheit", "kelvin"],
  groupAriaLabel: "Temperature unit preference",
  labels: {
    "celsius": "°C",
    "fahrenheit": "°F",
    "kelvin": "K"
  },

  ariaLabels: {
    "celsius": "Celsius",
    "fahrenheit": "Fahrenheit",
    "kelvin": "Kelvin"
  }
}

const densityToggleGroup: ToggleGroupConfig = {
  groupAriaLabel: "Density unit preference",
  values: ["g_cm3", "kg_m3"],
  
  labels: {
    "g_cm3": "g/cm3",
    "kg_m3": "kg/m3"
  },

  ariaLabels: {
    "g_cm3": "grams per cubic centimetre",
    "kg_m3": "kilograms per cubic metre"
  }
}

function ConfigField({ label, desc, id, children }: ConfigFieldProps) {
  return (
    <div className="config-field">
      <div className="config-info">
        <label className="config-label" htmlFor={id}>{label}</label>
        {desc && <p className="config-desc">{desc}</p>}
      </div>

      <div className="config-control">
        {children}
      </div>
    </div>
  )
}

export default function SettingsModal({ show, close }: {show: boolean, close: () => void}) {
  const { preferredTemperatureUnit, preferredDensityUnit, setTemperatureUnit, setDensityUnit } = useContext(ConfigContext);

  function updateDensityToggle(target: string) {
    console.log(`DENSITY`, target);
    setDensityUnit(target as DensityUnit)
  }
  
  function updateTemperatureToggle(target: string) {
    console.log(`temp`, target);
    setTemperatureUnit(target as TemperatureUnit)
  }

  return (
    <Modal open={show} closeModal={close}>
      <ModalHeader>
        <ModalTitle>Settings</ModalTitle>
      </ModalHeader>

      <ModalContent>
        <ConfigField 
          id="temperature-toggle" 
          label="Temperature unit"
        >
          <ToggleGroup
            id="temperature-toggle"
            config={temperatureToggleGroup}
            onSelectionChanged={updateTemperatureToggle} 
            selected={preferredTemperatureUnit}
          />
        </ConfigField>
      </ModalContent>

      <ModalContent>
        <ConfigField 
          id="density-toggle" 
          label="Density unit"
        >
          <ToggleGroup
            id="density-toggle"
            config={densityToggleGroup}
            onSelectionChanged={updateDensityToggle} 
            selected={preferredDensityUnit}
          />
        </ConfigField>
      </ModalContent>
    </Modal>
  )
}