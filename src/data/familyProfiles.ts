import { generateId } from "../utils/uuid";
import { getItem, setItem, KEYS } from "./storage";
import type { FamilyProfile, ProfileRelation } from "./types";

const PROFILE_COLORS = [
  "#5B8FB9", // logo blue
  "#2E9E5E", // green
  "#8b5cf6", // purple
  "#e11d48", // rose
  "#ea580c", // orange
  "#0891b2", // cyan
  "#4f46e5", // indigo
  "#c026d3", // fuchsia
];

export async function getFamilyProfiles(): Promise<FamilyProfile[]> {
  const profiles = await getItem<FamilyProfile[]>(KEYS.FAMILY_PROFILES);
  return profiles || [];
}

export async function getFamilyProfileById(
  id: string
): Promise<FamilyProfile | null> {
  const profiles = await getFamilyProfiles();
  return profiles.find((p) => p.id === id) || null;
}

export async function addFamilyProfile(
  name: string,
  relation: ProfileRelation,
  extra?: { bloodType?: string; age?: number }
): Promise<FamilyProfile> {
  const profiles = await getFamilyProfiles();
  const colorIndex = profiles.length % PROFILE_COLORS.length;
  const profile: FamilyProfile = {
    id: generateId(),
    name,
    relation,
    bloodType: extra?.bloodType,
    age: extra?.age,
    color: PROFILE_COLORS[colorIndex],
    createdAt: new Date().toISOString(),
  };
  profiles.push(profile);
  await setItem(KEYS.FAMILY_PROFILES, profiles);
  return profile;
}

export async function updateFamilyProfile(
  id: string,
  updates: Partial<Omit<FamilyProfile, "id" | "createdAt">>
): Promise<FamilyProfile | null> {
  const profiles = await getFamilyProfiles();
  const index = profiles.findIndex((p) => p.id === id);
  if (index === -1) return null;
  profiles[index] = { ...profiles[index], ...updates };
  await setItem(KEYS.FAMILY_PROFILES, profiles);
  return profiles[index];
}

export async function deleteFamilyProfile(id: string): Promise<boolean> {
  const profiles = await getFamilyProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  if (filtered.length === profiles.length) return false;
  await setItem(KEYS.FAMILY_PROFILES, filtered);
  return true;
}

/**
 * Ensures at least the "Myself" profile exists.
 * Called on app startup.
 */
export async function ensureDefaultProfile(): Promise<FamilyProfile> {
  const profiles = await getFamilyProfiles();
  if (profiles.length > 0) return profiles[0];
  return addFamilyProfile("Me", "myself");
}
