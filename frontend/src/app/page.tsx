import { SocialFeedScreen } from "@/features/marketplace/feed/screen";
import { Suspense } from "react";
import { redirect } from "next/navigation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const value = (key: string) =>
    typeof q[key] === "string" ? (q[key] as string) : undefined;
  if (value("product")) redirect(`/products/${Number(value("product"))}`);
  if (value("cash_memo_id"))
    redirect(`/dashboard/cash-memos/${Number(value("cash_memo_id"))}`);
  if (value("cash_memo"))
    redirect(
      `/dashboard/cash-memos/new?seller=${encodeURIComponent(value("cash_memo")!)}`,
    );
  if (!value("seller") && value("id"))
    redirect(`/sellers/${encodeURIComponent(value("id")!)}`);
  if (value("seller"))
    redirect(`/sellers/${encodeURIComponent(value("seller")!)}`);
  if (value("tracking"))
    redirect(`/tracking?code=${encodeURIComponent(value("tracking")!)}`);
  const sections: Record<string, string> = {
    "my-products": "/dashboard/products",
    "my-parcels": "/dashboard/parcels",
    "my-orders": "/dashboard/orders",
    "pickparcel-orders": "/operations/requests",
    "rider-parcels": "/operations/assignments",
    "pickparcel-transfers": "/operations/transfers",
    following: "/dashboard/following",
    news: "/dashboard/news",
    products: "/dashboard/products",
    parcels: "/dashboard/parcels",
    orders: "/dashboard/orders",
    messages: "/dashboard/messages",
    wallet: "/dashboard/wallet",
    profile: "/dashboard/settings",
  };
  if (value("section") && sections[value("section")!])
    redirect(sections[value("section")!]);
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <SocialFeedScreen initialSearch={value("search") || ""} />
    </Suspense>
  );
}
