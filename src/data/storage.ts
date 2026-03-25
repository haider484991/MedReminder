import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  MEDICATIONS: "@dosewise/medications",
  DOSE_LOGS: "@dosewise/dose_logs",
  PROFILE: "@dosewise/profile",
  FAMILY_PROFILES: "@dosewise/family_profiles",
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export { KEYS };
