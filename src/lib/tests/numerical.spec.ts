import { describe, it, expect } from "vitest";
import { parsePhysicalQuantity } from "@/lib/unitConversion";

describe("parsePhysicalQuantity", () => {
  describe("numeric only", () => {
    it("parses a plain integer", () => {
      expect(parsePhysicalQuantity("42")).toEqual(expect.objectContaining({ converted: 42, quantityType: "scalar" }))
    })

    it("parses a plain decimal", () => {
      expect(parsePhysicalQuantity("3.14")).toEqual(expect.objectContaining({ converted: 3.14, quantityType: "scalar" }))
    })

    it("parses a negative number", () => {
      expect(parsePhysicalQuantity("-5")).toEqual(expect.objectContaining({ converted: -5, quantityType: "scalar" }))
    })

    it("parses a positive signed number", () => {
      expect(parsePhysicalQuantity("+5")).toEqual(expect.objectContaining({ converted: 5, quantityType: "scalar" }))
    })

    it("parses only decimal number.", () => {
      expect(parsePhysicalQuantity(".75")).toEqual(expect.objectContaining({ converted: 0.75, quantityType: "scalar" }))
    })
  });

  describe("numeric edge cases", () => {
    it("returns null for double decimal", () => {
      expect(parsePhysicalQuantity("2.1.3")).toBeNull()
    });

    it("returns null for empty string", () => {
      expect(parsePhysicalQuantity("")).toBeNull()
    });

    it("returns null for non-numeric input with no number", () => {
      expect(parsePhysicalQuantity("abc")).toBeNull()
    });

    it("returns null for NaN-producing input", () => {
      expect(parsePhysicalQuantity("..5")).toBeNull()
    });
  });

  describe("units without prefix", () => {
    it("parses grams symbol", () => {
      expect(parsePhysicalQuantity("5g")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    });

    it("parses mol symbol", () => {
      expect(parsePhysicalQuantity("2mol")).toEqual(expect.objectContaining({ converted: 2, quantityType: "mole" }))
    });

    it("parses litre symbol", () => {
      expect(parsePhysicalQuantity("1l")).toEqual(expect.objectContaining({ converted: expect.closeTo(0.001, 3), quantityType: "volume" }))
    });

    it("parses m3 symbol", () => {
      expect(parsePhysicalQuantity("1m3")).toEqual(expect.objectContaining({ converted: 1, quantityType: "volume" }))
    });
  });

  describe("word-form units", () => {
    it("parses 'gram': 5gram = 5g", () => {
      expect(parsePhysicalQuantity("5gram")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    })
    it("parses 'grams' plural: 5grams = 5g", () => {
      expect(parsePhysicalQuantity("5grams")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    })
    it("parses 'mole': 3mole = 3mol", () => {
      expect(parsePhysicalQuantity("3mole")).toEqual(expect.objectContaining({ converted: 3, quantityType: "mole" }))
    })
    it("parses 'moles' plural: 3moles = 3mol", () => {
      expect(parsePhysicalQuantity("3moles")).toEqual(expect.objectContaining({ converted: 3, quantityType: "mole" }))
    })
    it("parses 'kilogram': 2kilogram = 2000g", () => {
      expect(parsePhysicalQuantity("2kilogram")).toEqual(expect.objectContaining({ converted: 2000, quantityType: "mass" }))
    })
    it("parses 'milligram': 500milligram = 0.5g", () => {
      expect(parsePhysicalQuantity("500milligram")).toEqual(expect.objectContaining({ converted: 0.5, quantityType: "mass" }))
    })
    it("parses 'microgram': 1microgram = 0.000001g", () => {
      expect(parsePhysicalQuantity("1microgram")).toEqual(expect.objectContaining({ converted: 1e-6, quantityType: "mass" }))
    })
    it("parses 'tonne': 1tonne = 1000000g", () => {
      expect(parsePhysicalQuantity("1tonne")).toEqual(expect.objectContaining({ converted: 1e6, quantityType: "mass" }))
    })
    it("parses 'stone': 1stone = 6350.29g", () => {
      expect(parsePhysicalQuantity("1stone")).toEqual(expect.objectContaining({ converted: 6350.29, quantityType: "mass" }))
    })
    it("parses 'pound': 1pound = 453.6g", () => {
      expect(parsePhysicalQuantity("1pound")).toEqual(expect.objectContaining({ converted: 453.6, quantityType: "mass" }))
    })
    it("parses 'ounce': 1ounce = 28.35g", () => {
      expect(parsePhysicalQuantity("1ounce")).toEqual(expect.objectContaining({ converted: 28.35, quantityType: "mass" }))
    })
  });

  describe("units without prefix", () => {
    it("parses grams: 5g = 5g", () => {
      expect(parsePhysicalQuantity("5g")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    })

    it("parses mol: 2mol = 2mol", () => {
      expect(parsePhysicalQuantity("2mol")).toEqual(expect.objectContaining({ converted: 2, quantityType: "mole" }))
    })

    it("parses litre: 1l = 0.001m3", () => {
      expect(parsePhysicalQuantity("1l")).toEqual(expect.objectContaining({ converted: 1e-3, quantityType: "volume" }))
    })

    it("parses m3: 1m3 = 1m3", () => {
      expect(parsePhysicalQuantity("1m3")).toEqual(expect.objectContaining({ converted: 1, quantityType: "volume" }))
    })
  });

  describe("prefixed units", () => {
    it("parses mg: 500mg = 0.5g", () => {
      expect(parsePhysicalQuantity("500mg")).toEqual(expect.objectContaining({ converted: 0.5, quantityType: "mass" }))
    })

    it("parses ug: 1ug = 0.000001g", () => {
      expect(parsePhysicalQuantity("1ug")).toEqual(expect.objectContaining({ converted: 1e-6, quantityType: "mass" }))
    })

    it("parses kg: 2kg = 2000g", () => {
      expect(parsePhysicalQuantity("2kg")).toEqual(expect.objectContaining({ converted: 2000, quantityType: "mass" }))
    })

    it("parses mmol: 10mmol = 0.01mol", () => {
      expect(parsePhysicalQuantity("10mmol")).toEqual(expect.objectContaining({ converted: 0.01, quantityType: "mole" }))
    })

    it("parses nmol: 1nmol = 0.000000001mol", () => {
      expect(parsePhysicalQuantity("1nmol")).toEqual(expect.objectContaining({ converted: 1e-9, quantityType: "mole" }))
    })

    it("parses ml: 200ml = 0.0002m3", () => {
      expect(parsePhysicalQuantity("200ml")).toEqual(expect.objectContaining({ converted: expect.closeTo(0.0002, 4), quantityType: "volume" }))
    })

    it("parses kl: 1kL = 1m3", () => {
      expect(parsePhysicalQuantity("1kL")).toEqual(expect.objectContaining({ converted: 1, quantityType: "volume" }))
    })

    it("parses 1cm3: 1cm3 = 0.000001m3", () => {
      expect(parsePhysicalQuantity("1cm3")).toEqual(expect.objectContaining({ converted: expect.closeTo(1e-6, 6), quantityType: "volume" }))
    })
  });

  describe("fake units", () => {
    it("returns null for unknown unit", () => {
      expect(parsePhysicalQuantity("5xyz")).toBeNull()
    })

    it("returns null for plausible but nonexistent unit", () => {
      expect(parsePhysicalQuantity("5zg")).toBeNull()
    })
  });

    // Invalid prefix usage on units that don't allow prefixes
  describe("invalid prefix usage", () => {
    it("returns null for prefixed word-form gram (mgram)", () => {
      expect(parsePhysicalQuantity("5mgram")).toBeNull()
    })

    it("returns null for prefixed gallon", () => {
      expect(parsePhysicalQuantity("5mgallon")).toBeNull()
    })

    it("returns null for prefixed pint", () => {
      expect(parsePhysicalQuantity("5mpint")).toBeNull()
    })
  });

  describe("casing", () => {
    it("parses 'GRAM' case-insensitively", () => {
      expect(parsePhysicalQuantity("5GRAM")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    })

    it("parses 'Gram' case-insensitively", () => {
      expect(parsePhysicalQuantity("5Gram")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    })

    it("returns null for uppercase MOL (case sensitive symbol)", () => {
      expect(parsePhysicalQuantity("2MOL")).toBeNull()
    });

    it("returns null for uppercase G (no matching unit)", () => {
      expect(parsePhysicalQuantity("5G")).toBeNull()
    })

    it("returns null for lowercase 't' prefix (no matching prefix)", () => {
      expect(parsePhysicalQuantity("5tm3")).toBeNull()
    })

    it("parses lowercase mol correctly", () => {
      expect(parsePhysicalQuantity("2mol")).toEqual(expect.objectContaining({ converted: 2, quantityType: "mole" }))
    });
  });

  describe("prefix casing", () => {
    it("parses m prefix as milli: 5mg = 0.005g", () => {
      expect(parsePhysicalQuantity("5mg")).toEqual(expect.objectContaining({ converted: expect.closeTo(0.005, 3), quantityType: "mass" }))
    })

    it("parses M prefix as mega: 5Mg = 5000000g", () => {
      expect(parsePhysicalQuantity("5Mg")).toEqual(expect.objectContaining({ converted: 5e6, quantityType: "mass" }))
    })

    it("parses k prefix as kilo: 1kg = 1000g", () => {
      expect(parsePhysicalQuantity("1kg")).toEqual(expect.objectContaining({ converted: 1000, quantityType: "mass" }))
    })

    it("parses n prefix as nano: 1nmol = 1e-9mol", () => {
      expect(parsePhysicalQuantity("1nmol")).toEqual(expect.objectContaining({ converted: 1e-9, quantityType: "mole" }))
    })
  });

  describe("spaces", () => {
    it("parses value with single space before unit", () => {
      expect(parsePhysicalQuantity("5 g")).toEqual(expect.objectContaining({ converted: 5, quantityType: "mass" }))
    })

    it("parses value with multiple spaces", () => {
      expect(parsePhysicalQuantity("5   kg")).toEqual(expect.objectContaining({ converted: 5000, quantityType: "mass" }))
    })
    
    it("parses value with no space", () => {
      expect(parsePhysicalQuantity("5kg")).toEqual(expect.objectContaining({ converted: 5000, quantityType: "mass" }))
    })
  })

})