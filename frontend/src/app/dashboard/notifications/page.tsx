import { NotificationsScreen } from "@/features/communication/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <NotificationsScreen />
    </Suspense>
  );
}
