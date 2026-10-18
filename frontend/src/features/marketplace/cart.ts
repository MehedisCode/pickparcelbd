"use client";
import { useMemo, useSyncExternalStore } from "react";
export type CartItem = {
  product_id: number;
  quantity: number;
  name: string;
  price: string;
  image_url: string | null;
  seller_name: string;
  seller_id?: number;
};
let memory = "[]";
function snapshot() {
  try {
    return localStorage.getItem(key) || memory;
  } catch {
    return memory;
  }
}
const key = "pickparcel.cart.v1";
const subscribe = (fn: () => void) => {
  window.addEventListener("storage", fn);
  window.addEventListener("pickparcel:cart", fn);
  return () => {
    window.removeEventListener("storage", fn);
    window.removeEventListener("pickparcel:cart", fn);
  };
};
export function useCart() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const items = useMemo<CartItem[]>(() => {
    try {
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows)) return [];
      return rows.filter(
        (item) =>
          item &&
          Number.isInteger(item.product_id) &&
          item.product_id > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 99 &&
          typeof item.name === "string" &&
          typeof item.seller_name === "string" &&
          /^\d+(\.\d{1,2})?$/.test(String(item.price)),
      );
    } catch {
      return [];
    }
  }, [raw]);
  const save = (rows: CartItem[]) => {
    memory = JSON.stringify(rows);
    try {
      localStorage.setItem(key, memory);
    } catch {}
    window.dispatchEvent(new Event("pickparcel:cart"));
  };
  return {
    items,
    add: (item: CartItem) => {
      const old = items.find((i) => i.product_id === item.product_id);
      save(
        old
          ? items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) }
                : i,
            )
          : [...items, item],
      );
    },
    quantity: (id: number, n: number) =>
      save(
        items.map((i) =>
          i.product_id === id
            ? { ...i, quantity: Math.max(1, Math.min(99, n)) }
            : i,
        ),
      ),
    remove: (id: number) => save(items.filter((i) => i.product_id !== id)),
    clear: () => save([]),
  };
}
