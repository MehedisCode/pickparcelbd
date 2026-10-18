import { LoginScreen } from "@/features/accounts/login";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense fallback={<p className="loading">Loading…</p>}>
      <LoginScreen />
    </Suspense>
  );
}
