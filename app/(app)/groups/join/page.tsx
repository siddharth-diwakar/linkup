import Link from "next/link";

import { JoinGroupForm } from "@/components/groups/join-group-form";

export default function JoinGroupPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Join Group
        </p>
        <h1 className="font-display text-4xl">Enter a join code</h1>
        <p className="text-base text-muted-foreground">
          Ask a friend for the 6-character code. You will land straight on the
          group page.
        </p>
      </div>
      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <JoinGroupForm />
      </div>
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-primary hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
