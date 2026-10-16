import { EmptyState } from "@/components/empty-state";

export default function BillsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recurring Bills</h1>
        <p className="text-zinc-400 mt-1">Manage your recurring payments</p>
      </div>

      <EmptyState
        icon="receipt"
        title="Bills coming soon"
        description="Recurring bill management features are currently under development"
        actionLabel={null}
        actionHref={null}
      />
    </div>
  );
}
