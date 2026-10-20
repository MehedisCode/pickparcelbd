import { MemberReportScreen } from "@/features/admin/people";
import { Suspense } from "react";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  return (
    <Suspense>
      <MemberReportScreen id={p.id} />
    </Suspense>
  );
}
