import { ProductFormScreen } from "@/features/products/manage";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <ProductFormScreen />
    </Suspense>
  );
}
