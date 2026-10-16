import { EmptyState } from "@/components/empty-state";

export default function BudgetsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        <p className="text-zinc-400 mt-1">Manage category budgets</p>
      </div>
      <EmptyState
        title="Budgets coming soon"
        description="Budget management features are currently under development"
      />
    </div>
  );
}
