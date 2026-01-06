"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type AvailabilityPayload = {
  free: Array<{ user_id: string; display_name: string }>;
  busy: Array<{
    user_id: string;
    display_name: string;
    busy_until: string;
  }>;
  unknown: Array<{ user_id: string; display_name: string }>;
};

type Props = {
  groupId: string;
};

export function AvailabilityPanel({ groupId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailabilityPayload | null>(null);

  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/availability`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error ?? "Unable to check availability.");
        return;
      }

      setData(payload);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={fetchAvailability}
        disabled={isLoading}
        className="h-11 rounded-xl bg-primary text-primary-foreground"
      >
        {isLoading ? "Checking..." : "Check Availability"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {data ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
            <h3 className="font-display text-lg">Free Now</h3>
            <p className="text-sm text-muted-foreground">
              {data.free.length} available
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.free.length === 0 ? (
                <li className="text-muted-foreground">No one free right now</li>
              ) : (
                data.free.map((member) => (
                  <li key={member.user_id}>{member.display_name}</li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
            <h3 className="font-display text-lg">Busy</h3>
            <p className="text-sm text-muted-foreground">
              {data.busy.length} in class
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.busy.length === 0 ? (
                <li className="text-muted-foreground">No active blocks</li>
              ) : (
                data.busy.map((member) => (
                  <li key={member.user_id}>
                    {member.display_name}{" "}
                    <span className="text-muted-foreground">
                      (busy until {member.busy_until})
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
            <h3 className="font-display text-lg">Unknown</h3>
            <p className="text-sm text-muted-foreground">
              {data.unknown.length} missing a calendar
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {data.unknown.length === 0 ? (
                <li className="text-muted-foreground">Everyone shared</li>
              ) : (
                data.unknown.map((member) => (
                  <li key={member.user_id}>{member.display_name}</li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Tap the button to check who is free right now.
        </p>
      )}
    </div>
  );
}
