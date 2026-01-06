import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-4xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            LinkUp
          </p>
          <h1 className="font-display text-4xl md:text-5xl">
            Choose a new password.
          </h1>
          <p className="text-base text-muted-foreground">
            You will return to the dashboard once your password is updated.
          </p>
        </div>
        <div className="w-full">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
