import type { DensityUnit, TemperatureUnit } from "@/lib/types";
import { displayDecimal } from "./string";

export function toCelsius(tKelvin: number) {
  return tKelvin - 273.15;
}

/// why are american temperature units so weird.
export function toFahrenheit(tKelvin: number) {
  return (tKelvin - 273.15) * 1.8 + 32;
}

export function getDensityByConfig(density_gcm3: number, preferredUnit: DensityUnit) {
  if (preferredUnit === "kg_m3") {
    density_gcm3 *= 1000;
  }

  const densityDisplay = displayDecimal(density_gcm3);
  const suffix = (preferredUnit === "g_cm3" ? "g/cm3" : "kg/m3");

  return `${densityDisplay} ${suffix}`;
}

export function getTemperatureByConfig(tKelvin: number, preferredUnit: TemperatureUnit) {
  let text = `${tKelvin.toFixed(1)} K`;

  if (preferredUnit === "celsius") {
    text += ` (${toCelsius(tKelvin).toFixed(1)} °C)`;
  } else if (preferredUnit === "fahrenheit") {
    text += ` (${toFahrenheit(tKelvin).toFixed(1)} °F)`;
  }

  return text;
}

