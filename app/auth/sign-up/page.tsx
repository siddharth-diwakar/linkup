import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            LinkUp
          </p>
          <h1 className="font-display text-4xl md:text-5xl">
            Start sharing availability in minutes.
          </h1>
          <p className="text-base text-muted-foreground">
            Create a group, upload your calendar, and instantly check who can
            hang out right now.
          </p>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
              Weekly classes only, Monday through Friday.
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
              Re-upload anytime to refresh your schedule.
            </div>
          </div>
        </div>
        <div className="w-full">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
