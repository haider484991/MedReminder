import { generateId } from "../utils/uuid";
import { getItem, setItem, KEYS } from "./storage";
import type { DoseLog, DoseStatus } from "./types";

async function getAllDoseLogs(): Promise<DoseLog[]> {
  const logs = await getItem<DoseLog[]>(KEYS.DOSE_LOGS);
  return logs || [];
}

export async function getDoseLogs(profileId?: string): Promise<DoseLog[]> {
  const logs = await getAllDoseLogs();
  if (!profileId) return logs;
  return logs.filter((l) => l.profileId === profileId);
}

export async function getDoseLogsForDate(
  date: Date,
  profileId?: string
): Promise<DoseLog[]> {
  const logs = await getDoseLogs(profileId);
  const dateStr = date.toISOString().split("T")[0];
  return logs.filter((log) => log.scheduledTime.startsWith(dateStr));
}

export async function getDoseLogsForMedication(
  medicationId: string
): Promise<DoseLog[]> {
  const logs = await getAllDoseLogs();
  return logs.filter((log) => log.medicationId === medicationId);
}

export async function logDose(
  profileId: string,
  medicationId: string,
  scheduledTime: string,
  status: DoseStatus
): Promise<DoseLog> {
  const logs = await getAllDoseLogs();
  const existing = logs.find(
    (l) =>
      l.medicationId === medicationId && l.scheduledTime === scheduledTime
  );

  if (existing) {
    existing.status = status;
    existing.actionTime = new Date().toISOString();
    await setItem(KEYS.DOSE_LOGS, logs);
    return existing;
  }

  const log: DoseLog = {
    id: generateId(),
    profileId,
    medicationId,
    scheduledTime,
    status,
    actionTime: new Date().toISOString(),
  };
  logs.push(log);
  await setItem(KEYS.DOSE_LOGS, logs);
  return log;
}

export async function getAdherenceRate(
  medicationId?: string,
  days: number = 30,
  profileId?: string
): Promise<number> {
  const logs = await getDoseLogs(profileId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const relevant = logs.filter((log) => {
    const matchesMed = medicationId
      ? log.medicationId === medicationId
      : true;
    const matchesDate = new Date(log.scheduledTime) >= cutoff;
    return matchesMed && matchesDate;
  });

  if (relevant.length === 0) return 100;
  const taken = relevant.filter((l) => l.status === "taken").length;
  return Math.round((taken / relevant.length) * 100);
}
