'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { ItemCarrito } from '@/lib/types';
import { calcularTotalesCarrito } from '@/lib/types';

const CART_KEY = 'SG_CARRITO_V1';

interface CartContextType {
  items:          ItemCarrito[];
  totalUnidades:  number;
  subtotalSinIVA: number;
  ivaTotal:       number;
  totalConIVA:    number;
  addItem:        (item: ItemCarrito) => void;
  removeItem:     (productoId: string) => void;
  setCantidad:    (productoId: string, cantidad: number) => void;
  clearCart:      () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items,   setItems]   = useState<ItemCarrito[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* localStorage no disponible */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, mounted]);

  const addItem = useCallback((newItem: ItemCarrito) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productoId === newItem.productoId);
      if (idx >= 0) {
        return prev.map((i, n) =>
          n === idx ? { ...i, cantidad: i.cantidad + newItem.cantidad } : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productoId: string) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId));
  }, []);

  const setCantidad = useCallback((productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter(i => i.productoId !== productoId));
    } else {
      setItems(prev =>
        prev.map(i => i.productoId === productoId ? { ...i, cantidad } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totales      = calcularTotalesCarrito(items);
  const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalUnidades,
      ...totales,
      addItem,
      removeItem,
      setCantidad,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
