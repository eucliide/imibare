import { EmptyState } from "@/components/empty-state";

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <p className="text-zinc-400 mt-1">Manage your financial accounts</p>
      </div>

      <EmptyState
        icon="wallet"
        title="Accounts coming soon"
        description="Account management features are currently under development"

      />
    </div>
  );
}
