import { EmptyState } from "@/components/empty-state";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your preferences</p>
      </div>
      <EmptyState
        title="Settings coming soon"
        description="Settings and preferences features are currently under development"
      />
    </div>
  );
}
