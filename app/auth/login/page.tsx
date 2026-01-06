import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            LinkUp
          </p>
          <h1 className="font-display text-4xl md:text-5xl">
            Hangouts without the scheduling spiral.
          </h1>
          <p className="text-base text-muted-foreground">
            Upload your weekday calendar, join a group, and see who is free now.
            No long-term planning, just quick answers.
          </p>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
              Single timezone, instant results.
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
              We only store busy blocks. No class details.
            </div>
          </div>
        </div>
        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
