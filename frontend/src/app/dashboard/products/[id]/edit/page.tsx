import { ProductFormScreen } from "@/features/products/manage";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <ProductFormScreen id={p.id} />
    </Suspense>
  );
}
