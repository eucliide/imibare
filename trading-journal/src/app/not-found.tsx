import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <EmptyState
          title="Page not found"
          description="This page doesn't exist or has been moved."
          action={{ label: "Back to Dashboard", href: "/dashboard" }}
        />
      </div>
    </div>
  );
}
