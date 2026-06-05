export function displayDecimal(mass: number, decimals: number = 3, epsilon: number = 1e-3) {
  const dpart = mass % 1;

  if (Math.abs(dpart) <= epsilon) {
    return mass.toFixed(1);
  }

  return mass.toFixed(decimals);
}

export function displayMoles(moles: number, epsilon: number = 1e-9) {
  const dpart = moles % 1;

  if (Math.abs(dpart) <= epsilon) {
    return moles.toFixed(1);
  }

  if (moles < 0.01) return moles.toFixed(5);
  if (moles < 0.1) return moles.toFixed(4);
  return moles.toFixed(3);
}

export function isNumeric(s: string, allowDecimals: boolean = false) {
  if (s.length === 0) return false;

  let decimal = false;

  for (let i = 0; i < s.length; i++) {
    const n = s.charCodeAt(i);

    if (allowDecimals && n === '.'.charCodeAt(0)) {
      if (decimal) return false;
      
      decimal = true;
      continue
    }
    
    if (n < '0'.charCodeAt(0) || n > '9'.charCodeAt(0)) return false;
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