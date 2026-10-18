import { TrackingScreen } from "@/features/accounts/public-pages";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const q = await searchParams;
  return <TrackingScreen initialCode={q.code || ""} />;
}
