import { describe, it, expect } from "vitest";
import { evaluateUserSearch } from "../search";

describe("evaluateUserSearch", () => {
  it.each([
    ["empty string", ""],
    ["gibberish", "lorem ipsum dolor sit amet consectetur"],
    ["no keywords", "there should be no match"],
  ])("should return unknown for %s", (_, query) => {
    const result = evaluateUserSearch(query);

    // TODO: Replace with some enum, since raw strings are fragile.
    expect(result.type).toBe("unknown");
    expect(result.confidence).toBe(1);
  });

  it("should match molar mass", () => {
    const result = evaluateUserSearch("molar mass of Ca");
    expect(result.type).toBe("molar_mass");
  });

  it("should ignore stop words", () => {
    const a = evaluateUserSearch("the atomic mass of Ca");
    const b = evaluateUserSearch("atomic mass Ca");
    expect(a).toStrictEqual(b);
  });

  describe("ambiguous queries", () => {
    it("should have lower confidence when query is ambiguous", () => {
      const specific = evaluateUserSearch("molar mass");
      const ambiguous = evaluateUserSearch("molar mass electronic configuration");

      expect(ambiguous.confidence).toBeLessThan(specific.confidence);
    });

    it("should prefer the longer keyword when multiple match", () => {
      const result = evaluateUserSearch("atomic number and electronic configuration");

      expect(result.type).toBe("electronic_configuration_semantic");
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(1);
    });
  });

  describe("input sanitization", () => {
    // FIXME: It matches non-alphanumeric words, not characters.
    // It should match and remove non-alphanumeric characters.
    
    // it("should strip non-alphanumeric characters", () => {
    //   const clean  = evaluateUserSearch("molar mass");
    //   const dirty  = evaluateUserSearch("molar mass???");
    //   expect(clean).toStrictEqual(dirty);
    // });

    it("should handle punctuation-only input", () => {
      const result = evaluateUserSearch("???!!!");
      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(1);
    });
  });
});