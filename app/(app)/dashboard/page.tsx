import Link from "next/link";

import { CreateGroupForm } from "@/components/groups/create-group-form";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("id,name,join_code,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-10">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-foreground md:text-5xl">
          See who is free right now.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Drop your calendar once. Create a group or join with a code, then
          check who can hang out this minute.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Your groups</h2>
            <Link
              href="/groups/join"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Join a group
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {groups && groups.length > 0 ? (
              groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40"
                >
                  <div>
                    <p className="text-lg font-semibold">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Code {group.join_code}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    Open
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-6 text-sm text-muted-foreground">
                No groups yet. Create one to get started.
              </div>
            )}
          </div>
        </section>
        <aside className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl">Create a group</h2>
          
          <div className="mt-6">
            <CreateGroupForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
