import { FollowingScreen } from "@/features/accounts/screens";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <FollowingScreen />
    </Suspense>
  );
}
