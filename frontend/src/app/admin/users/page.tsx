import { AdminPeopleScreen } from "@/features/admin/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <AdminPeopleScreen />
    </Suspense>
  );
}
