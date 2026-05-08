
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export function formatPricePHP(price: number): string {
  return `₱${price.toFixed(2)}`;
}


export function formatRating(rating: number, reviewCount: number): string {
  if (reviewCount === 0) {
    return "No reviews yet";
  }
  return `⭐ ${rating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? "s" : ""})`;
}
