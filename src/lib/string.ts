export function displayDecimal(mass: number) {
  const dpart = mass % 1;

  if (Math.abs(dpart) <= 1e-3) {
    return mass.toFixed(1);
  }

  return mass.toFixed(3);
}

export function isDigit(s: string) {
  if (s.length === 0) return false;

  for (let i = 0; i < s.length; i++) {
    const n = s.charCodeAt(i);
    if (n <= 47 || n >= 58) return false;
  }

  return true;
}

export function isUppercase(char: string) {
  const n = char.charCodeAt(0);

  return (n > 64 && n < 91)
}

export function isAlphabetical(s: string) {
  if (s.length === 0) return false;

  for (let i = 0; i < s.length; i++) {
    const n = s.charCodeAt(i);

    if (n > 64 && n < 91) continue;
    if (n > 96 && n < 123) continue;

    return false;
  }

  return true;
}

export function reverse(s: string) {
  let s_reversed = '';

  for (let i = 0; i < s.length; i++) {
    s_reversed += s[s.length - (i + 1)]
  }

  return s_reversed;
}