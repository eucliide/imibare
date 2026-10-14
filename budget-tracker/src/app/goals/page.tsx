import { EmptyState } from "@/components/empty-state";

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
        <p className="text-zinc-400 mt-1">Track your savings progress</p>
      </div>

      <EmptyState
        icon="target"
        title="Goals coming soon"
        description="Savings goal tracking features are currently under development"
        actionLabel={null}
        actionHref={null}
      />
    </div>
  );
}
