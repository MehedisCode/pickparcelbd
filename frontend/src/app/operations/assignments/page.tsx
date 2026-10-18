import { ParcelListScreen } from "@/features/parcels/screens";
import { Suspense } from "react";
import { BatchPickup } from "@/features/parcels/batch-pickup";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <>
        <ParcelListScreen mode="operations" view="assigned" />
        <div style={{ height: 24 }} />
        <BatchPickup />
      </>
    </Suspense>
  );
}
