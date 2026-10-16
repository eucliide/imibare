import { EmptyState } from "@/components/empty-state";

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-zinc-400 mt-1">View and manage your transactions</p>
      </div>
      <EmptyState
        title="Transactions coming soon"
        description="Transaction management features are currently under development"
      />
    </div>
  );
}
