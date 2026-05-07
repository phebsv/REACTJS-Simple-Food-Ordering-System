import type { FoodItem } from "../types";

type CartItem = FoodItem & {
  quantity: number;
  cartItemId?: string;
};

const API_URL = "http://localhost:3001";

function getCurrentCustomerId(customerId?: string) {
  if (customerId) return customerId;

  const rawUser = localStorage.getItem("currentUser");
  if (!rawUser) return "";

  try {
    return JSON.parse(rawUser).id || "";
  } catch {
    return "";
  }
}

function mapCartItem(item: any): CartItem {
  return {
    id: String(item.menuId),
    cartItemId: String(item.id),
    name: item.name,
    description: item.description || "",
    price: Number(item.price),
    category: item.category || "",
    image: item.image || "",
    quantity: Number(item.quantity) || 1,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export async function loadCartItems(customerId?: string): Promise<CartItem[]> {
  customerId = getCurrentCustomerId(customerId);
  if (!customerId) return [];

  const items = await request<any[]>(
    `/cart_items?customerId=${encodeURIComponent(customerId)}`,
  );
  return items.map(mapCartItem);
}

export async function addToCart(
  item: FoodItem,
  customerId?: string,
): Promise<CartItem> {
  customerId = getCurrentCustomerId(customerId);
  if (!customerId) return { ...item, quantity: 1 };

  const existing = await request<any[]>(
    `/cart_items?customerId=${encodeURIComponent(customerId)}&menuId=${encodeURIComponent(item.id)}`,
  );

  if (existing[0]) {
    const updated = await request<any>(`/cart_items/${existing[0].id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: Number(existing[0].quantity || 1) + 1 }),
    });
    return mapCartItem(updated);
  }

  const created = await request<any>("/cart_items", {
    method: "POST",
    body: JSON.stringify({
      customerId,
      menuId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || "",
      quantity: 1,
    }),
  });

  return mapCartItem(created);
}

export async function updateCartQuantity(
  menuItemId: string,
  quantity: number,
  customerId?: string,
): Promise<CartItem | null> {
  customerId = getCurrentCustomerId(customerId);
  if (!customerId) return null;

  const existing = await request<any[]>(
    `/cart_items?customerId=${encodeURIComponent(customerId)}&menuId=${encodeURIComponent(menuItemId)}`,
  );

  if (!existing[0]) return null;

  if (quantity <= 0) {
    await removeFromCart(menuItemId, customerId);
    return null;
  }

  const updated = await request<any>(`/cart_items/${existing[0].id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

  return mapCartItem(updated);
}

export async function removeFromCart(
  menuItemId: string,
  customerId?: string,
): Promise<void> {
  customerId = getCurrentCustomerId(customerId);
  if (!customerId) return;

  const existing = await request<any[]>(
    `/cart_items?customerId=${encodeURIComponent(customerId)}&menuId=${encodeURIComponent(menuItemId)}`,
  );

  if (existing[0]) {
    await request(`/cart_items/${existing[0].id}`, { method: "DELETE" });
  }
}

export async function clearCart(customerId?: string): Promise<void> {
  customerId = getCurrentCustomerId(customerId);
  if (!customerId) return;

  const items = await request<any[]>(
    `/cart_items?customerId=${encodeURIComponent(customerId)}`,
  );

  await Promise.all(
    items.map((item) =>
      request(`/cart_items/${item.id}`, { method: "DELETE" }),
    ),
  );
}
