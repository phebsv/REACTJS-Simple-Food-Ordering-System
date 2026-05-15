import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, formatPricePHP, formatRating } from "../utils/textHelpers";

describe("Text Helpers", () => {
  describe("decodeHtmlEntities", () => {
    it("decodes HTML entities", () => {
      const result = decodeHtmlEntities("&lt;div&gt;test&lt;/div&gt;");
      expect(result).toBe("<div>test</div>");
    });

    it("handles ampersand", () => {
      const result = decodeHtmlEntities("A &amp; B");
      expect(result).toBe("A & B");
    });

    it("handles quotes", () => {
      const result = decodeHtmlEntities("&quot;Hello&quot;");
      expect(result).toBe('"Hello"');
    });

    it("handles empty string", () => {
      const result = decodeHtmlEntities("");
      expect(result).toBe("");
    });
  });

  describe("formatPricePHP", () => {
    it("formats price with PHP currency", () => {
      const result = formatPricePHP(100);
      expect(result).toBe("₱100.00");
    });

    it("formats decimal prices", () => {
      const result = formatPricePHP(99.99);
      expect(result).toBe("₱99.99");
    });

    it("formats zero", () => {
      const result = formatPricePHP(0);
      expect(result).toBe("₱0.00");
    });

    it("formats large numbers", () => {
      const result = formatPricePHP(1234.56);
      expect(result).toBe("₱1234.56");
    });

    it("handles rounding to 2 decimals", () => {
      const result = formatPricePHP(99.999);
      expect(result).toBe("₱100.00");
    });
  });

  describe("formatRating", () => {
    it("formats rating with review count", () => {
      const result = formatRating(4.5, 10);
      expect(result).toBe("Rating 4.5 (10 reviews)");
    });

    it("returns no reviews message when count is zero", () => {
      const result = formatRating(0, 0);
      expect(result).toBe("No reviews yet");
    });

    it("uses singular review for count of 1", () => {
      const result = formatRating(5, 1);
      expect(result).toBe("Rating 5.0 (1 review)");
    });

    it("formats decimal ratings", () => {
      const result = formatRating(3.7, 5);
      expect(result).toBe("Rating 3.7 (5 reviews)");
    });

    it("handles high review counts", () => {
      const result = formatRating(4.8, 100);
      expect(result).toBe("Rating 4.8 (100 reviews)");
    });
  });
});
