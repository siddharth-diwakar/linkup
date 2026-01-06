import { CalendarUploadForm } from "@/components/profile/calendar-upload-form";
import { DisplayNameForm } from "@/components/profile/display-name-form";
import { ensureProfileRow } from "@/lib/profiles/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub ?? null;

  if (userId) {
    await ensureProfileRow(userId);
  }

  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const { data: upload } = userId
    ? await supabase
        .from("calendar_uploads")
        .select("uploaded_at")
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Profile
        </p>
        <h1 className="font-display text-4xl md:text-5xl">
          Your availability, simplified.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Update your display name and upload your class calendar. We only store
          weekday busy blocks.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl">Display name</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is what your friends will see.
          </p>
          <div className="mt-6">
            <DisplayNameForm initialName={profile?.display_name ?? ""} />
          </div>
        </section>
        <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl">Calendar upload</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a single .ics file. Re-uploads replace your existing blocks.
          </p>
          <div className="mt-6">
            <CalendarUploadForm
              lastUploadedAt={upload?.uploaded_at ?? null}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
