import { Suspense } from "react";
import { ParcelListScreen } from "@/features/parcels/screens";
export default function Page() {
  return (
    <Suspense>
      <ParcelListScreen mode="operations" view="available" />
    </Suspense>
  );
}
