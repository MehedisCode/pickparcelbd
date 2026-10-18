import { MemoDetailScreen } from "@/features/orders/screens";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <MemoDetailScreen id={p.id} />
    </Suspense>
  );
}
