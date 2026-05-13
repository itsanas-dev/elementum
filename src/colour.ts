type Colour = {r: number, g: number, b: number};

const TEXT_COLOUR_DARK = "#f1f1f1";
const TEXT_COLOUR_LIGHT = "#141414";

// Source - https://stackoverflow.com/a/5624139
function hexToRgb(hex: string): Colour|null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// I did not write this, I have no idea what magic is going on here.
// I have no idea what the magic numbers are, but this is for gamma-correction.
function linearize(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.065) / 1.055, 2.4);
}

export function getTextColour(hex: string): string {
  const color = hexToRgb(hex);

  if (!color) {
    return TEXT_COLOUR_LIGHT;
  }

  const luminance = (0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b));
  return luminance > 0.325 ? TEXT_COLOUR_LIGHT : TEXT_COLOUR_DARK;
}