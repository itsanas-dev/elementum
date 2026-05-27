import { ConfigContext } from "@/provider/ConfigContext";
import type { AppTheme, DensityUnit, TemperatureUnit } from "@/types";
import { useState, type ReactNode } from "react";

type ProviderProps = {children: ReactNode}

export default function ConfigProvider({ children }: ProviderProps) {
  const [densityUnit, setDensityUnit] = useState<DensityUnit>("g_cm3");
  const [tempUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius");
  const [theme, setTheme] = useState<AppTheme>("dark");

  return (
    <ConfigContext.Provider 
      value={{
        preferredDensityUnit: densityUnit,
        preferredTemperatureUnit: tempUnit,
        theme,
        
        setDensityUnit,
        setTemperatureUnit,
        setTheme
      }}
    >
      {children}
    </ConfigContext.Provider>
  )
}