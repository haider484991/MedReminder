import type { Medication, UpcomingDose, TimeOfDay } from "./types";
import { getDoseLogsForDate } from "./doseLogs";

const TIME_MAP: Record<TimeOfDay, string> = {
  morning: "08:00",
  noon: "12:00",
  evening: "18:00",
  night: "21:00",
};

export function getDefaultTime(label: TimeOfDay): string {
  return TIME_MAP[label];
}

function isDoseScheduledForDay(med: Medication, date: Date): boolean {
  if (!med.isActive) return false;
  if (med.frequency === "daily") return true;
  if (med.frequency === "specific_days" && med.specificDays) {
    const day = date.getDay();
    return med.specificDays.includes(day);
  }
  return false;
}

export async function getUpcomingDoses(
  medications: Medication[],
  date: Date,
  profileId?: string
): Promise<UpcomingDose[]> {
  const logs = await getDoseLogsForDate(date, profileId);
  const doses: UpcomingDose[] = [];
  const dateStr = date.toISOString().split("T")[0];

  for (const med of medications) {
    if (!isDoseScheduledForDay(med, date)) continue;

    for (const timeSlot of med.timesOfDay) {
      const time = timeSlot.time || getDefaultTime(timeSlot.label);
      const scheduledTime = new Date(`${dateStr}T${time}:00`);
      const scheduledTimeStr = scheduledTime.toISOString();

      const existingLog = logs.find(
        (l) =>
          l.medicationId === med.id &&
          l.scheduledTime === scheduledTimeStr
      );

      doses.push({
        medication: med,
        timeSlot,
        scheduledTime,
        status: existingLog?.status || "pending",
        doseLogId: existingLog?.id,
      });
    }
  }

  doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  return doses;
}

export function getDailyProgress(doses: UpcomingDose[]): {
  taken: number;
  total: number;
  percentage: number;
} {
  const total = doses.length;
  const taken = doses.filter((d) => d.status === "taken").length;
  return {
    taken,
    total,
    percentage: total === 0 ? 0 : Math.round((taken / total) * 100),
  };
}
