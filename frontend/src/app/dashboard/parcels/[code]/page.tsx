import { ParcelDetailScreen } from "@/features/parcels/screens";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <ParcelDetailScreen code={p.code} />
    </Suspense>
  );
}
