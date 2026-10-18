import { OverviewScreen } from "@/features/dashboard/overview";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <OverviewScreen />
    </Suspense>
  );
}
