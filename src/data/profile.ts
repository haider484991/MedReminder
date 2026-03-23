import { getItem, setItem, KEYS } from "./storage";
import type { UserProfile } from "./types";

const DEFAULT_PROFILE: UserProfile = {
  name: "User",
  settings: {
    medicationReminders: true,
    refillAlerts: true,
    soundVibration: false,
    passcodeLock: false,
    biometricAuth: false,
    unitPreferences: "mg, ml",
    themeMode: "system",
  },
  isPremium: false,
  activeProfileId: "",
};

export async function getProfile(): Promise<UserProfile> {
  const profile = await getItem<UserProfile>(KEYS.PROFILE);
  return profile || DEFAULT_PROFILE;
}

export async function updateProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const current = await getProfile();
  const updated = { ...current, ...updates };
  if (updates.settings) {
    updated.settings = { ...current.settings, ...updates.settings };
  }
  await setItem(KEYS.PROFILE, updated);
  return updated;
}
