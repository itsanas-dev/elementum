export function toTitleCase(s: string) {
  let titleCaseS = "";
  const whitespaceSplit = s.split(" ");

  for (const portion of whitespaceSplit) {
    if (portion.length < 1) return;
    titleCaseS += portion.substring(0, 1).toUpperCase() + portion.substring(1)
    titleCaseS += ' '
  }

  return titleCaseS
}

export function displayDecimal(mass: number) {
  const dpart = mass % 1;

  if (Math.abs(dpart) <= 1e-3) {
    return mass.toFixed(1);
  }

  return mass.toFixed(3);
}
