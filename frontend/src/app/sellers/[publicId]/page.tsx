import { publicMetadata } from "@/lib/public-metadata";
import { SellerProfileScreen } from "@/features/accounts/screens";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <SellerProfileScreen publicId={p.publicId} />
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const p = await params;
  return publicMetadata(
    `/profiles/${encodeURIComponent(p.publicId)}`,
    "Seller | PickParcelBD",
  );
}
