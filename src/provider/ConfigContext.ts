import { type AppTheme, type DensityUnit, type TemperatureUnit } from "@/types";
import { createContext } from "react";

function unimplemented() {
  console.log("Unimplemented. Add ConfigProvider.")
}

type ConfigObject = {
  preferredTemperatureUnit: TemperatureUnit,
  preferredDensityUnit: DensityUnit,

  theme: AppTheme;

  setDensityUnit: (unit: DensityUnit) => void,
  setTemperatureUnit: (unit: TemperatureUnit) => void,
  setTheme: (theme: AppTheme) => void
}

export const ConfigContext = createContext<ConfigObject>({
  preferredDensityUnit: "g_cm3",
  preferredTemperatureUnit: "celsius",
  theme: "dark",

  setDensityUnit: unimplemented,
  setTemperatureUnit: unimplemented,
  setTheme: unimplemented
});