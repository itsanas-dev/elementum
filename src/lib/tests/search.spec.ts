import { describe, it, expect } from "vitest";
import { evaluateUserSearch, parseCompound } from "../search";

describe("evaluateUserSearch", () => {
  it.each([
    ["empty string", ""],
    ["gibberish", "lorem ipsum dolor sit amet consectetur"],
    ["no keywords", "there should be no match"],
  ])("should return unknown for %s", (_, query) => {
    const result = evaluateUserSearch(query);

    // TODO: Replace with some enum, since raw strings are fragile.
    expect(result.evaluation).toHaveLength(1);
    expect(result.evaluation[0]).toMatchObject({
      type: "unknown",
      confidence: 1
    })
  });

  it("should match molar mass", () => {
    const result = evaluateUserSearch("molar mass of Ca", (e) => (e === "Ca" ? "calcium" : null));
    
    console.log(result)
    expect(result.evaluation).toHaveLength(1);
    expect(result.evaluation[0]).toMatchObject({
      type: "molar_mass",
      confidence: 1
    })
  });

  it("should ignore stop words", () => {
    const a = evaluateUserSearch("the atomic mass of Ca");
    const b = evaluateUserSearch("atomic mass Ca");
    expect(a).toStrictEqual(b);
  });

  describe("ambiguous queries", () => {
    it("should have lower confidence when query is ambiguous", () => {
      const matchElement = (e: string) => e === "Mg" ? "magnesium" : null;
      
      const specific = evaluateUserSearch("molar mass Mg", matchElement);
      const ambiguous = evaluateUserSearch("Mg molar mass atomic number", matchElement);

      expect(ambiguous.evaluation).toHaveLength(2);
      expect(ambiguous.evaluation[0].type).toBe("atomic_number");
      expect(ambiguous.evaluation[1].type).toBe("molar_mass");
      expect(ambiguous.evaluation[0].confidence + ambiguous.evaluation[1].confidence).toBeCloseTo(1);
      
      expect(specific.evaluation).toHaveLength(1);
      expect(specific.evaluation[0].type).toBe(ambiguous.evaluation[1].type)
      expect(specific.evaluation[0].confidence).toBe(1);
    });

    it("should prefer the longer keyword when multiple match", () => {
      const matchElement = (e: string) => e === "Mg" ? "magnesium" : null;
      const result = evaluateUserSearch("atomic number, density and molar mass of Mg", matchElement);

      expect(result.evaluation).toHaveLength(3)
      expect(result.evaluation[0].type).toBe("atomic_number");
      expect(result.evaluation[1].type).toBe("molar_mass")
      expect(result.evaluation[2].type).toBe("element_density")
    });
  });

  describe("input sanitization", () => {
    // FIXME: It matches non-alphanumeric words, not characters.
    // It should match and remove non-alphanumeric characters.
    
    it("should strip non-alphanumeric characters", () => {
      const clean  = evaluateUserSearch("molar mass");
      const dirty  = evaluateUserSearch("molar mass???");
      expect(clean).toStrictEqual(dirty);
    });

    it("should handle punctuation-only input", () => {
      const result = evaluateUserSearch("???!!!");
      expect(result.params.elements).toHaveLength(0);
      expect(result.evaluation[0]).toMatchObject({
        type: "unknown",
        confidence: 1
      })
    });
  });

  describe("element and compound recognition", () => {
    const matchElement = (e: string) => {
      const elements: Record<string, string> = {
        "Ca": "calcium",
        "Na": "sodium",
        "S":  "sulfur",
        "H":  "hydrogen",
        "O":  "oxygen",
        "Fe": "iron",
        "Mg": "magnesium",
        "N": "nitrogen",
        "Al": "aluminium"
      };
      const ids = Object.values(elements);

      if (ids.includes(e.toLowerCase())) return e;

      return elements[e] ?? null;
    };
    
    describe("single elements", () => {
      it("should recognize a single element symbol", () => {
        const result = parseCompound("Ca", matchElement);
        console.log("CA", result)
        expect(result).not.toBeNull();
        expect(result!.type).toBe("molecule")
        expect(result!.composition).toMatchObject([{
          type: "element",
          components: [{ id: "calcium", count: 1 }],
          count: 1
        }]);
      });

      it("should recognize a two-character symbol", () => {
        const result = parseCompound("Fe", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([{
          type: "element",
          components: [{ id: "iron", count: 1 }]
        }]);
      });

      it("should recognize an element by full name", () => {
        const result = parseCompound("calcium", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([{
          type: "element",
          components: [{ id: "calcium", count: 1 }]
        }]);
      });

      it("should match molecules", () => {
        const result = parseCompound("S8", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([{
          type: "element",
          components: [{ id: "sulfur", count: 8 }]
        }]);
      });

      it.each([
        ["Empty string", ""],
        ["Lowercase symbol", "ca"],
        ["Uppercase symbol", "CA"],
        ["incorrectly-cased symbol", "cA"]
      ])("should be case sensitive. %s should not match.", (_, query) => {
        const result = parseCompound(query, matchElement);
        expect(result).toBeNull();
      });

      it("should return null for an unknown symbol", () => {
        const result = parseCompound("Xx", matchElement);
        expect(result).toBeNull();
      });

      it("should return null for gibberish", () => {
        const result = parseCompound("Xkqz", matchElement);
        expect(result).toBeNull();
      });
    });

    describe("compounds", () => {
      it("should parse a simple two-element compound", () => {
        const result = parseCompound("CaS", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([
          { type: "element", components: [{ id: "calcium", count: 1 }] },
          { type: "element", components: [{ id: "sulfur",  count: 1 }] },
        ]);
      });

      it("should recognize more complicated compounds", () => {
        const result = parseCompound("Na2SO4", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([
          { type: "element", components: [{ id: "sodium",  count: 2 }] },
          { type: "element", components: [{ id: "sulfur",  count: 1 }] },
          { type: "element", components: [{ id: "oxygen",  count: 4 }] },
        ]);
      });

      it("should parse subscripts correctly", () => {
        const result = parseCompound("H2O", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([
          { type: "element", components: [{ id: "hydrogen", count: 2 }] },
          { type: "element", components: [{ id: "oxygen",   count: 1 }] },
        ]);
      });

      it("should match atom groups correctly", () => {
        const result = parseCompound("Ca(OH)2", matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject([
          { type: "element",    components: [{ id: "calcium",  count: 1 }] },
          { type: "atom_group", count: 2, components: [
            { id: "oxygen",   count: 1 },
            { id: "hydrogen", count: 1 },
          ]},
        ]);
      });

      it.each([
        ["Ca(OH)2",  "Ca(OH)2"],
        ["HNO3",     "HNO3"],
        ["Mg(NO3)2", "Mg(NO3)2"],
        ["Al(NO3)3", "Al(NO3)3"],
        ["Al2(OH)6", "Al2(OH)6"],
      ])("should match multiple atom groups correctly, for example %s.", (_, query) => {
        const expected: Record<string, object[]> = {
          "Ca(OH)2": [
            { type: "element",    components: [{ id: "calcium",   count: 1 }] },
            { type: "atom_group", count: 2, components: [{ id: "oxygen", count: 1 }, { id: "hydrogen", count: 1 }] },
          ],
          "HNO3": [
            { type: "element", components: [{ id: "hydrogen", count: 1 }] },
            { type: "element", components: [{ id: "nitrogen", count: 1 }] },
            { type: "element", components: [{ id: "oxygen",   count: 3 }] },
          ],
          "Mg(NO3)2": [
            { type: "element",    components: [{ id: "magnesium", count: 1 }] },
            { type: "atom_group", count: 2, components: [{ id: "nitrogen", count: 1 }, { id: "oxygen", count: 3 }] },
          ],
          "Al(NO3)3": [
            { type: "element",    components: [{ id: "aluminium", count: 1 }] },
            { type: "atom_group", count: 3, components: [{ id: "nitrogen", count: 1 }, { id: "oxygen", count: 3 }] },
          ],
          "Al2(OH)6": [
            { type: "element",    components: [{ id: "aluminium", count: 2 }] },
            { type: "atom_group", count: 6, components: [{ id: "oxygen", count: 1 }, { id: "hydrogen", count: 1 }] },
          ],
        };

        const result = parseCompound(query, matchElement);
        expect(result).not.toBeNull();
        expect(result!.composition).toMatchObject(expected[query]);
      });

      it("should not match full words with element symbols in them.", () => {
        const result = parseCompound("Molar", matchElement);
        expect(result).toBeNull();
      });

      it("should return null if any element in the compound is unrecognized", () => {
        expect(parseCompound("CaXx", matchElement)).toBeNull();
      });

      it("should return null if all elements are unrecognized", () => {
        expect(parseCompound("XxZz", matchElement)).toBeNull();
      });
    });

    describe("edge cases", () => {
      it("should return null with no validate function", () => {
        expect(parseCompound("Ca")).toBeNull();
      });

      it("should return null for a number-only string", () => {
        expect(parseCompound("123", matchElement)).toBeNull();
      });

      it("should not return null for impossible element subscripts like S101, since they are hard to validate.", () => {
        expect(parseCompound("S101", matchElement)).not.toBeNull();
      });

      it("should return null for a lowercase word that is not a name", () => {
        expect(parseCompound("mass", matchElement)).toBeNull();
      });
    });

    describe("integration with evaluateUserSearch", () => {
      it("should include compound elements in params", () => {
        const result = evaluateUserSearch("molar mass CaS", matchElement);
        expect(result.params.elements[0]).toMatchObject({
          composition: [
            { id: "calcium", count: 1 },
            { id: "sulfur",  count: 1 }
          ]
        });
      });

      it("should reject compound for schema entries that disallow them", () => {
        const result = evaluateUserSearch("electronic configuration CaS", matchElement);
        expect(result.evaluation[0].type).toBe("unknown");
      });

      it("should accept compound for schema entries that allow them", () => {
        const result = evaluateUserSearch("molar mass H2O", matchElement);
        expect(result.evaluation[0].type).toBe("molar_mass");
      });
    });
  });
});