"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  lastUploadedAt: string | null;
};

export function CalendarUploadForm({ lastUploadedAt }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a .ics file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".ics")) {
      setError("Only .ics files are supported.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/calendar/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error ?? "Unable to upload calendar.");
        return;
      }

      setSuccess(`Uploaded. ${payload?.blocks ?? 0} busy blocks saved.`);
      setFile(null);
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formattedDate = lastUploadedAt
    ? new Date(lastUploadedAt).toLocaleString()
    : "No calendar on file yet.";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Last upload: {formattedDate}
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
        Upload .ics calendar
        <input
          type="file"
          accept=".ics"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-600">{success}</p>
      ) : null}
      <Button
        type="submit"
        disabled={isUploading}
        className="h-11 rounded-xl bg-primary text-primary-foreground"
      >
        {isUploading ? "Uploading..." : "Upload calendar"}
      </Button>
    </form>
  );
}
