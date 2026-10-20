import { AuditsScreen } from "@/features/admin/audits";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <AuditsScreen />
    </Suspense>
  );
}
