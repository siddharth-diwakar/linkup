import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.claims.sub)
    .maybeSingle();

  const displayName = profile?.display_name?.trim() || "Friend";

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
        </div>
        <nav className="relative z-10 w-full border-b border-border/70 bg-background/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="font-display text-2xl tracking-tight"
              >
                LinkUp
              </Link>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="text-foreground/80 transition hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-foreground/80 transition hover:text-foreground"
                >
                  Profile
                </Link>
                <Link
                  href="/groups/join"
                  className="text-foreground/80 transition hover:text-foreground"
                >
                  Join Group
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Hey {displayName}
              </span>
              <LogoutButton
                variant="outline"
                size="sm"
                className="border-foreground/20 bg-background/60"
              />
            </div>
          </div>
        </nav>
        <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
