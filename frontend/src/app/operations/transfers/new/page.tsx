import { TransferCreateScreen } from "@/features/transfers/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <TransferCreateScreen />
    </Suspense>
  );
}
