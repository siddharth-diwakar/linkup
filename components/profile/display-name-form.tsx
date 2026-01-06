"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialName: string;
};

export function DisplayNameForm({ initialName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Display name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError("Unable to load account.");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: trimmed })
        .eq("id", userData.user.id);

      if (updateError) {
        setError("Unable to update profile.");
        return;
      }

      setSuccess("Saved.");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-foreground">
          Display name
        </label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your name"
          className="mt-2"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-600">{success}</p>
      ) : null}
      <Button
        type="submit"
        disabled={isSaving}
        className="h-11 rounded-xl bg-primary text-primary-foreground"
      >
        {isSaving ? "Saving..." : "Update name"}
      </Button>
    </form>
  );
}
