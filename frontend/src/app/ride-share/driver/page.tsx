import { RideScreen } from "@/features/rides/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <RideScreen driver />
    </Suspense>
  );
}
