import { ParcelListScreen } from "@/features/parcels/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <ParcelListScreen mode="operations" view="custody" />
    </Suspense>
  );
}
