import { EmptyState } from "@/components/empty-state";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-zinc-400 mt-1">Organize your spending</p>
      </div>
      <EmptyState
        title="Categories coming soon"
        description="Category management features are currently under development"
      />
    </div>
  );
}
