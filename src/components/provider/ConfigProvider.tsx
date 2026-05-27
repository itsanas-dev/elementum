import { ConfigContext } from "@/provider/ConfigContext";
import type { AppTheme, DensityUnit, TemperatureUnit } from "@/types";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type ProviderProps = {children: ReactNode}

type LocalAppConfig = {
  densityUnit: DensityUnit,
  temperatureUnit: TemperatureUnit,
  appTheme: AppTheme
}

const CONFIG_STORE_NAME = "appConfig"

function defaultConfig(): LocalAppConfig {
  return {
    densityUnit: "g_cm3",
    temperatureUnit: "celsius",
    appTheme: "dark"
  }
}

function saveConfigToLocalStorage(name: string, densityU: DensityUnit, temperatureU: TemperatureUnit, theme: AppTheme) {
  const object: LocalAppConfig = {
    densityUnit: densityU,
    temperatureUnit: temperatureU,
    appTheme: theme
  }

  window.localStorage.setItem(name, JSON.stringify(object));
}

function loadConfigFromLocalStorage(name: string): LocalAppConfig {
  const object = window.localStorage.getItem(name);
  const fallback = defaultConfig()

  if (!object) return fallback;

  try {
    const parsedObject: LocalAppConfig = JSON.parse(object);
    if (typeof parsedObject !== "object") throw Error("Not a valid config object.")

    const densityUnit = parsedObject.densityUnit || fallback.densityUnit;
    const temperatureUnit = parsedObject.temperatureUnit || fallback.temperatureUnit;
    const theme = parsedObject.appTheme || fallback.appTheme;

    return {
      densityUnit,
      temperatureUnit,
      appTheme: theme
    }
  } catch {
    return fallback;
  }
}

export default function ConfigProvider({ children }: ProviderProps) {
  const loadedConfig = useMemo(() => loadConfigFromLocalStorage(CONFIG_STORE_NAME), []);
  const [densityUnit, setDensityUnit] = useState<DensityUnit>(loadedConfig.densityUnit);
  const [tempUnit, setTemperatureUnit] = useState<TemperatureUnit>(loadedConfig.temperatureUnit);
  const [theme, setTheme] = useState<AppTheme>(loadedConfig.appTheme);

  useEffect(() => {
    saveConfigToLocalStorage(CONFIG_STORE_NAME, densityUnit, tempUnit, theme);
  }, [densityUnit, tempUnit, theme])

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