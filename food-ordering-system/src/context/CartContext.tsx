import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FoodItem } from "../types";
import {
  addToCart,
  clearCart as clearBackendCart,
  loadCartItems,
  removeFromCart,
  updateCartQuantity,
} from "../services/cartApi";

type CartItem = FoodItem & {
  quantity: number;
  cartItemId?: string;
};

type CartContextType = {
  items: CartItem[];
  total: number;
  loading: boolean;
  addItem: (item: FoodItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadCartItems()
      .then((loadedItems) => setItems(loadedItems))
      .catch((error) => {
        console.error("Failed to load cart items:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const addItem = (item: FoodItem) => {
    setItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    addToCart(item)
      .then((saved) => {
        setItems((prev) =>
          prev.map((cartItem) =>
            cartItem.id === saved.id ? saved : cartItem
          )
        );
      })
      .catch((error) => {
        console.error("Failed to sync cart add with backend:", error);
      });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity } : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );

    updateCartQuantity(id, quantity)
      .then((updated) => {
        if (!updated) return;
        setItems((prev) =>
          prev.map((cartItem) =>
            cartItem.id === updated.id ? updated : cartItem
          )
        );
      })
      .catch((error) => {
        console.error("Failed to sync cart quantity with backend:", error);
      });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((cartItem) => cartItem.id !== id));
    removeFromCart(id).catch((error) => {
      console.error("Failed to remove cart item from backend:", error);
    });
  };

  const clearCart = () => {
    setItems([]);
    clearBackendCart().catch((error) => {
      console.error("Failed to clear backend cart:", error);
    });
  };

  const value = useMemo(
    () => ({ items, total, loading, addItem, removeItem, updateQuantity, clearCart }),
    [items, total, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
