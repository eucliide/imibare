"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/empty-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <EmptyState
          title="Something went wrong"
          description="We couldn't load this page. Try again — if it keeps happening, the error has been logged."
          action={{ label: "Try again", onClick: reset }}
        />
      </div>
    </div>
  );
}
