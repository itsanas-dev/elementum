import { APCAcontrast, sRGBtoY } from "apca-w3"
type Colour = {r: number, g: number, b: number};

const TEXT_LIGHT = "#f1f1f1";
const TEXT_DARK = "#141414";

// Source - https://stackoverflow.com/a/5624139
function hexToRgb(hex: string): Colour|null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getContrast(txtY: number, bgY: number): number {
  let c = APCAcontrast(txtY, bgY);

  if (typeof c !== "number") {
    c = Number.parseFloat(c);
  }

  return Math.abs(c)
}

export function getTextColour(hex: string): string {
  const color = hexToRgb(hex);
  
  if (!color) {
    return TEXT_DARK;
  }

  const y = sRGBtoY([color.r, color.g, color.b]);

  const darkContrast = getContrast(0.0, y);
  const lightContrast = getContrast(1.0, y);

  return darkContrast > lightContrast ? TEXT_DARK : TEXT_LIGHT;
}