"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type AvailabilityPayload = {
  free: Array<{
    user_id: string;
    display_name: string;
    free_until: string | null;
  }>;
  busy: Array<{
    user_id: string;
    display_name: string;
    busy_until: string;
  }>;
  unknown: Array<{ user_id: string; display_name: string }>;
  checked_time: string | null;
};

type Props = {
  groupId: string;
};

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = ((hours + 11) % 12) + 1;
  const label = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  const value = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return { value, label };
});

export function AvailabilityPanel({ groupId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailabilityPayload | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedTime) {
        params.set("time", selectedTime);
      }
      const url = params.size
        ? `/api/groups/${groupId}/availability?${params.toString()}`
        : `/api/groups/${groupId}/availability`;
      const response = await fetch(url);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor={`availability-time-${groupId}`}>
            Check a time
          </Label>
          <select
            id={`availability-time-${groupId}`}
            className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedTime}
            onChange={(event) => setSelectedTime(event.target.value)}
          >
            <option value="">Right now</option>
            {TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={fetchAvailability}
          disabled={isLoading}
          className="h-11 rounded-xl bg-primary text-primary-foreground"
        >
          {isLoading ? "Checking..." : "Check Availability"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {data ? (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {data.checked_time
              ? `Showing availability for ${data.checked_time}.`
              : "Showing availability right now."}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <h3 className="font-display text-lg">Free</h3>
              <p className="text-sm text-muted-foreground">
                {data.free.length} available
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {data.free.length === 0 ? (
                  <li className="text-muted-foreground">
                    {data.checked_time
                      ? "No one free at that time"
                      : "No one free right now"}
                  </li>
                ) : (
                  data.free.map((member) => (
                    <li key={member.user_id}>
                      {member.display_name}{" "}
                      <span className="text-muted-foreground">
                        (
                        {member.free_until
                          ? `free until ${member.free_until}`
                          : "free all day"}
                        )
                      </span>
                    </li>
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
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick a time and tap the button to check who is free.
        </p>
      )}
    </div>
  );
}
