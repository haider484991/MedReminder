import { generateId } from "../utils/uuid";
import { getItem, setItem, KEYS } from "./storage";
import type { Medication } from "./types";

async function getAllMedications(): Promise<Medication[]> {
  const meds = await getItem<Medication[]>(KEYS.MEDICATIONS);
  return meds || [];
}

export async function getMedications(profileId?: string): Promise<Medication[]> {
  const meds = await getAllMedications();
  if (!profileId) return meds;
  return meds.filter((m) => m.profileId === profileId);
}

export async function getMedicationById(
  id: string
): Promise<Medication | null> {
  const meds = await getAllMedications();
  return meds.find((m) => m.id === id) || null;
}

export async function addMedication(
  data: Omit<Medication, "id" | "createdAt" | "updatedAt">
): Promise<Medication> {
  const meds = await getAllMedications();
  const now = new Date().toISOString();
  const med: Medication = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  meds.push(med);
  await setItem(KEYS.MEDICATIONS, meds);
  return med;
}

export async function updateMedication(
  id: string,
  updates: Partial<Omit<Medication, "id" | "createdAt">>
): Promise<Medication | null> {
  const meds = await getAllMedications();
  const index = meds.findIndex((m) => m.id === id);
  if (index === -1) return null;
  meds[index] = {
    ...meds[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await setItem(KEYS.MEDICATIONS, meds);
  return meds[index];
}

export async function deleteMedication(id: string): Promise<boolean> {
  const meds = await getAllMedications();
  const filtered = meds.filter((m) => m.id !== id);
  if (filtered.length === meds.length) return false;
  await setItem(KEYS.MEDICATIONS, filtered);
  return true;
}

export async function decrementStock(id: string): Promise<number | null> {
  const meds = await getAllMedications();
  const index = meds.findIndex((m) => m.id === id);
  if (index === -1 || meds[index].stockCount === undefined) return null;
  meds[index].stockCount = Math.max(0, (meds[index].stockCount || 0) - 1);
  meds[index].updatedAt = new Date().toISOString();
  await setItem(KEYS.MEDICATIONS, meds);
  return meds[index].stockCount!;
}
