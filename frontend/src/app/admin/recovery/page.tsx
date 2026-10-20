import { RecoveryScreen } from "@/features/admin/recovery";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <RecoveryScreen />
    </Suspense>
  );
}
