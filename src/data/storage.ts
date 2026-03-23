import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  MEDICATIONS: "@dosely/medications",
  DOSE_LOGS: "@dosely/dose_logs",
  PROFILE: "@dosely/profile",
  FAMILY_PROFILES: "@dosely/family_profiles",
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
