export function displayDecimal(mass: number) {
  const dpart = mass % 1;

  if (Math.abs(dpart) <= 1e-3) {
    return mass.toFixed(1);
  }

  return mass.toFixed(3);
}
