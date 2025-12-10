// context/CartContext.tsx
import { CartItem, CartState } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  clearCart: () => void;
  isItemInCart: (
    id: string
  ) =>
    | { quantity: number; id: string; size: string; color: string }
    | undefined;
  updateQuantity: (
    id: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return ctx;
};

interface CartProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "@cart_items";

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    isLoading: true,
  });

  const loadStoredCart = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        setCartState({ items, isLoading: false });
      } else {
        setCartState({ items: [], isLoading: false });
      }
    } catch (error) {
      console.error("Error loading stored cart:", error);
      setCartState({ items: [], isLoading: false });
    }
  }, []);

  useEffect(() => {
    loadStoredCart();
  }, [loadStoredCart]);

  const persist = async (items: CartItem[]) => {
    setCartState({ items, isLoading: false });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const isItemInCart = (id: string) => {
    return cartState.items.find((i) => i.id === id)?.[0];
  };

  const addToCart = (
    item: Omit<CartItem, "quantity">,
    quantity: number = 1
  ) => {
    setCartState((prev) => {
      const existingIndex = prev.items.findIndex(
        (i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
      );

      let updated: CartItem[];

      if (existingIndex !== -1) {
        updated = prev.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [...prev.items, { ...item, quantity }];
      }

      // persist side‑effect
      persist(updated);
      return { ...prev, items: updated };
    });
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCartState((prev) => {
      const updated = prev.items.filter(
        (i) => !(i.id === id && i.size === size && i.color === color)
      );
      persist(updated);
      return { ...prev, items: updated };
    });
  };

  const clearCart = () => {
    persist([]);
  };

  const updateQuantity = (
    id: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    setCartState((prev) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = prev.items.filter(
          (i) => !(i.id === id && i.size === size && i.color === color)
        );
      } else {
        updated = prev.items.map((i) =>
          i.id === id && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        );
      }
      persist(updated);
      return { ...prev, items: updated };
    });
  };

  const getCartTotal = () =>
    cartState.items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

  const getCartCount = () =>
    cartState.items.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        ...cartState,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        isItemInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
