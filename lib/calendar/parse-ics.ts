import * as ical from "node-ical";

export type BusyBlockInput = {
  weekday: number;
  start_time: string;
  end_time: string;
};

type ParsedEvent = {
  type?: string;
  start?: Date;
  end?: Date;
  datetype?: string;
  rrule?: {
    options?: {
      byweekday?: Array<{ weekday?: number }> | { weekday?: number } | number;
    };
  };
};

const WEEKDAY_MIN = 1;
const WEEKDAY_MAX = 5;

function formatTime(value: Date): string {
  const hours = value.getHours().toString().padStart(2, "0");
  const minutes = value.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
}

function extractWeekdays(event: ParsedEvent): number[] {
  const byweekday = event.rrule?.options?.byweekday;

  if (byweekday !== undefined) {
    const weekdays = Array.isArray(byweekday) ? byweekday : [byweekday];
    const normalized = new Set<number>();

    for (const entry of weekdays) {
      const weekday =
        typeof entry === "number" ? entry : entry?.weekday ?? null;

      if (typeof weekday === "number") {
        normalized.add(weekday + 1);
      }
    }

    if (normalized.size > 0) {
      return Array.from(normalized);
    }
  }

  if (event.start instanceof Date) {
    const jsWeekday = event.start.getDay();
    if (jsWeekday === 0) {
      return [7];
    }
    return [jsWeekday];
  }

  return [];
}

export function parseIcsToBusyBlocks(icsText: string): BusyBlockInput[] {
  const parsed = ical.parseICS(icsText) as Record<string, ParsedEvent>;
  const blocks: BusyBlockInput[] = [];

  for (const entry of Object.values(parsed)) {
    if (!entry || entry.type !== "VEVENT") {
      continue;
    }

    if (!(entry.start instanceof Date) || !(entry.end instanceof Date)) {
      continue;
    }

    if (entry.datetype === "date") {
      continue;
    }

    if (entry.end <= entry.start) {
      continue;
    }

    const weekdays = extractWeekdays(entry);
    if (weekdays.length === 0) {
      continue;
    }

    const startTime = formatTime(entry.start);
    const endTime = formatTime(entry.end);

    for (const weekday of weekdays) {
      if (weekday < WEEKDAY_MIN || weekday > WEEKDAY_MAX) {
        continue;
      }

      blocks.push({
        weekday,
        start_time: startTime,
        end_time: endTime,
      });
    }
  }

  return blocks;
}
