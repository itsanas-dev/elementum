import type { Atom, ElementCompositionComponent } from "./searchTypes";

function flattenComposition(composition: ElementCompositionComponent[]): Atom[] {
  const totals = new Map<string, number>();

  for (const group of composition) {
    for (const atom of group.components) {
      const effectiveCount = atom.count * group.atomGroupCount;
      const cumulative = totals.get(atom.id) ?? 0;

      totals.set(atom.id, cumulative + effectiveCount);
    }
  }

  return Array.from(totals.entries()).map(([id, count]) => ({ id, count }));
}

export function getEmpiricalFormula(composition: ElementCompositionComponent[]): ElementCompositionComponent[] {
  const duplicatesFound = hasDuplicates(composition);

  // This ensures that the atom groups themselves don't change.
  // For example, something like Na2(OH)4 (not a real compound but doesnt matter) give Na(OH)2, not NaO2H2.
  if (!duplicatesFound) {
    const coefficients = composition.map((group) => {
      let n = group.atomGroupCount;

      if (group.type === "element") n *= group.components[0].count;

      return n;
    });

    const gcdFactor = gcd(coefficients);

    const empiricalComposition: ElementCompositionComponent[] = composition.map((group) => {
      if (group.type === "element") {
        return {
          type: group.type,
          components: [{ id: group.components[0].id, count: group.components[0].count / gcdFactor }],
          atomGroupCount: 1
        };
      }

      return { ...group, atomGroupCount: group.atomGroupCount / gcdFactor };
    });

    return empiricalComposition;
  }

  // Handles single atoms only, as well as duplicates, which are present in structural formulae.
  // Examples would be organic compound chains. 
  const atoms = flattenComposition(composition);

  const coefficients = atoms.map((a) => {
    return a.count;
  });

  const gcdFactor = gcd(coefficients);

  const empiricalComposition: ElementCompositionComponent[] = atoms.map((a) => {
    return { type: "element", components: [{ id: a.id, count: a.count / gcdFactor }], atomGroupCount: 1 };
  });

  return empiricalComposition;
}

// Source - https://stackoverflow.com/a/17445322
// Posted by Yannis, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-27, License - CC BY-SA 3.0
function gcdpair(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);

  if (b > a) {
    const temp = a;
    a = b;
    b = temp;
  }

  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

export function gcd(nums: number[]) {
  return nums.reduce(gcdpair);
}

export function hasDuplicates(composition: ElementCompositionComponent[]) {
  const elements: Record<string, boolean> = {};

  for (const el of composition) {
    for (const atom of el.components) {
      if (elements[atom.id]) return true;

      elements[atom.id] = true;
    }
  }

  return false;
}

