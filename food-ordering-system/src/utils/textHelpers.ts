// src/utils/textHelpers.ts
// Helper functions for text display formatting

/**
 * Decodes HTML entities in text (e.g., &amp; → &, &quot; → ")
 */
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Formats price to Philippine Peso (₱)
 */
export function formatPricePHP(price: number): string {
  return `₱${price.toFixed(2)}`;
}

/**
 * Formats rating display text
 * Example: 4.5 stars with 12 reviews → "⭐ 4.5 (12 reviews)"
 */
export function formatRating(rating: number, reviewCount: number): string {
  if (reviewCount === 0) {
    return "No reviews yet";
  }
  return `⭐ ${rating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? "s" : ""})`;
}
