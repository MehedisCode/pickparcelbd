import { StartMemoScreen } from "@/features/orders/start-memo";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ seller?: string }>;
}) {
  const q = await searchParams;
  return <StartMemoScreen seller={q.seller || ""} />;
}
