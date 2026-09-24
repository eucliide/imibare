import { db } from "@/db";
import { playbookSetups } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PlaybookClient } from "./playbook-client";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const setups = await db
    .select()
    .from(playbookSetups)
    .orderBy(desc(playbookSetups.createdAt));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Playbook</h1>
          <p className="mt-2 text-[var(--muted)]">
            {setups.length} {setups.length === 1 ? "setup" : "setups"} on record
          </p>
        </div>

        <PlaybookClient setups={setups} />
      </div>
    </main>
  );
}