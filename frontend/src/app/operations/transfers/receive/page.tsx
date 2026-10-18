import { TransferReceiveScreen } from "@/features/transfers/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <TransferReceiveScreen />
    </Suspense>
  );
}
