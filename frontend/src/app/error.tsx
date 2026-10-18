"use client";
import { ErrorState } from "@/components/ui";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="public-container">
      <ErrorState
        message="An unexpected error occurred. Please try loading this page again."
        retry={reset}
      />
    </main>
  );
}
