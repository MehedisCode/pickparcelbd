import { ParcelLabel } from "@/features/parcels/label";
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const p = await params;
  return <ParcelLabel code={p.code} />;
}
