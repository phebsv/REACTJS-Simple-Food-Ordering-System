import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { FoodItem } from "../types";

type CartContextType = {
  items: FoodItem[];
  addItem: (item: FoodItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FoodItem[]>([]);

  const addItem = (item: FoodItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  const clearCart = () => setItems([]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearCart }),
    [items]
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
