import { MemosScreen } from "@/features/orders/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <MemosScreen />
    </Suspense>
  );
}
