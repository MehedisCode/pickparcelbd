import { CartScreen } from "@/features/marketplace/catalog";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <CartScreen />
    </Suspense>
  );
}
