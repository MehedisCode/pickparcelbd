import { publicMetadata } from "@/lib/public-metadata";
import { ProductDetailScreen } from "@/features/marketplace/catalog";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <ProductDetailScreen id={p.id} />
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return publicMetadata(
    `/products/${encodeURIComponent(p.id)}`,
    "Product | PickParcelBD",
  );
}
