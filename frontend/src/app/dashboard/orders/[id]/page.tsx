import { OrderDetailScreen } from "@/features/orders/screens";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <OrderDetailScreen id={p.id} />
    </Suspense>
  );
}
