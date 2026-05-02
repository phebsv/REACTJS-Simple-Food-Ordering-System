import type { FoodItem } from "../types";

const BASE_URL = "http://localhost:3001";

export type CartItem = FoodItem & {
  quantity: number;
  cartItemId?: string;
};

type CartItemRecord = {
  id: string;
  customerId: string;
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  quantity: number;
};

const getCurrentUserId = (): string | null => {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return user?.id ?? null;
  } catch {
    return null;
  }
};

const recordToCartItem = (record: CartItemRecord): CartItem => ({
  id: record.menuId,
  name: record.name,
  description: record.description,
  price: record.price,
  category: record.category,
  image: record.image,
  quantity: record.quantity,
  cartItemId: record.id,
});

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to connect to backend");
  }
  return res.json();
};

export async function loadCartItems(): Promise<CartItem[]> {
  const customerId = getCurrentUserId();
  if (!customerId) return [];

  const data = await fetchJson(`${BASE_URL}/cart_items?customerId=${encodeURIComponent(customerId)}`) as CartItemRecord[];
  return data.map(recordToCartItem);
}

export async function addToCart(item: FoodItem): Promise<CartItem> {
  const customerId = getCurrentUserId();
  if (!customerId) {
    return { ...item, quantity: 1 };
  }

  const existing = await fetchJson(
    `${BASE_URL}/cart_items?customerId=${encodeURIComponent(customerId)}&menuId=${encodeURIComponent(item.id)}`
  ) as CartItemRecord[];

  if (existing.length > 0) {
    const record = existing[0];
    const updated = await fetchJson(`${BASE_URL}/cart_items/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: record.quantity + 1 }),
    }) as CartItemRecord;
    return recordToCartItem(updated);
  }

  const created = await fetchJson(`${BASE_URL}/cart_items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId,
      menuId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      quantity: 1,
    }),
  }) as CartItemRecord;

  return recordToCartItem(created);
}

export async function updateCartQuantity(itemId: string, quantity: number): Promise<CartItem | null> {
  const customerId = getCurrentUserId();
  if (!customerId) return null;

  const existing = await fetchJson(
    `${BASE_URL}/cart_items?customerId=${encodeURIComponent(customerId)}&menuId=${encodeURIComponent(itemId)}`
  ) as CartItemRecord[];

  if (existing.length === 0) return null;
  const record = existing[0];

  if (quantity <= 0) {
    await fetchJson(`${BASE_URL}/cart_items/${record.id}`, { method: "DELETE" });
    return null;
  }

  const updated = await fetchJson(`${BASE_URL}/cart_items/${record.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  }) as CartItemRecord;

  return recordToCartItem(updated);
}

export async function removeFromCart(itemId: string): Promise<void> {
  const customerId = getCurrentUserId();
  if (!customerId) return;

  const existing = await fetchJson(
    `${BASE_URL}/cart_items?customerId=${encodeURIComponent(customerId)}&menuId=${encodeURIComponent(itemId)}`
  ) as CartItemRecord[];

  if (existing.length === 0) return;
  await fetchJson(`${BASE_URL}/cart_items/${existing[0].id}`, { method: "DELETE" });
}

export async function clearCart(): Promise<void> {
  const customerId = getCurrentUserId();
  if (!customerId) return;

  const items = await fetchJson(`${BASE_URL}/cart_items?customerId=${encodeURIComponent(customerId)}`) as CartItemRecord[];
  await Promise.all(
    items.map((record) => fetchJson(`${BASE_URL}/cart_items/${record.id}`, { method: "DELETE" }))
  );
}
