import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FoodItem } from "../types";
import { useAuth } from "./AuthContext";
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
const CART_SYNC_KEY = "cartSync";

const broadcastCartUpdate = (customerId?: string) => {
  if (!customerId) return;
  try {
    localStorage.setItem(
      CART_SYNC_KEY,
      JSON.stringify({ customerId, at: Date.now() }),
    );
  } catch {
    // Ignore storage errors
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { customer } = useAuth();

  useEffect(() => {
    if (!customer?.id) {
      setItems([]);
      return;
    }

    setLoading(true);
    loadCartItems(customer.id)
      .then((loadedItems) => setItems(loadedItems))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customer?.id]);

  useEffect(() => {
    if (!customer?.id) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CART_SYNC_KEY || !event.newValue) return;
      try {
        const payload = JSON.parse(event.newValue) as {
          customerId?: string;
        };
        if (payload.customerId !== customer.id) return;
      } catch {
        return;
      }

      setLoading(true);
      loadCartItems(customer.id)
        .then((loadedItems) => setItems(loadedItems))
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [customer?.id]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const addItem = (item: FoodItem) => {
    setItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    broadcastCartUpdate(customer?.id);

    addToCart(item, customer?.id)
      .then((saved) => {
        setItems((prev) =>
          prev.map((cartItem) => (cartItem.id === saved.id ? saved : cartItem)),
        );
      })
      .catch(() => {});
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity } : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
    broadcastCartUpdate(customer?.id);

    updateCartQuantity(id, quantity, customer?.id)
      .then((updated) => {
        if (!updated) return;
        setItems((prev) =>
          prev.map((cartItem) =>
            cartItem.id === updated.id ? updated : cartItem,
          ),
        );
      })
      .catch(() => {});
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((cartItem) => cartItem.id !== id));
    broadcastCartUpdate(customer?.id);
    removeFromCart(id, customer?.id).catch(() => {});
  };

  const clearCart = () => {
    setItems([]);
    broadcastCartUpdate(customer?.id);
    clearBackendCart(customer?.id).catch(() => {});
  };

  const value = useMemo(
    () => ({
      items,
      total,
      loading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, total, loading, customer?.id],
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
