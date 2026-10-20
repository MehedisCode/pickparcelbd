import { FinanceScreen } from "@/features/admin/finance";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <FinanceScreen />
    </Suspense>
  );
}
