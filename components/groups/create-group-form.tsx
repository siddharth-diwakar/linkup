"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error ?? "Unable to create group.");
        return;
      }

      const groupId = payload?.group?.id;
      if (groupId) {
        router.push(`/groups/${groupId}`);
        router.refresh();
      } else {
        setError("Group created, but missing group id.");
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
          Group name
        </label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Weekend run club"
          className="mt-2"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 rounded-xl bg-primary text-primary-foreground"
      >
        {isSubmitting ? "Creating..." : "Create group"}
      </Button>
    </form>
  );
}
