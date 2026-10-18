import { MessagesScreen } from "@/features/communication/screens";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <MessagesScreen key={p.userId} userId={p.userId} />
    </Suspense>
  );
}
