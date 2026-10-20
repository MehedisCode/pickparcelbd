import { ReportsScreen } from "@/features/admin/reports";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <ReportsScreen />
    </Suspense>
  );
}
