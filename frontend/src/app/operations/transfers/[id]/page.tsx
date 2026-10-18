import { TransferDetailScreen } from "@/features/transfers/screens";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <TransferDetailScreen id={p.id} />
    </Suspense>
  );
}
