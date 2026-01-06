"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinGroupForm() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinCode.trim()) {
      setError("Join code is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ join_code: joinCode }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error ?? "Unable to join group.");
        return;
      }

      const groupId = payload?.group?.id;
      if (groupId) {
        router.push(`/groups/${groupId}`);
        router.refresh();
      } else {
        setError("Joined, but missing group id.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-foreground">
          Join code
        </label>
        <Input
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
          placeholder="6-character code"
          className="mt-2 uppercase tracking-[0.2em]"
          maxLength={6}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 rounded-xl bg-primary text-primary-foreground"
      >
        {isSubmitting ? "Joining..." : "Join group"}
      </Button>
    </form>
  );
}
