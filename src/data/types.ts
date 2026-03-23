export type FrequencyType = "daily" | "specific_days" | "as_needed";

export type TimeOfDay = "morning" | "noon" | "evening" | "night";

export type ProfileRelation =
  | "myself"
  | "husband"
  | "wife"
  | "father"
  | "mother"
  | "grandfather"
  | "grandmother"
  | "son"
  | "daughter"
  | "brother"
  | "sister"
  | "other";

export interface FamilyProfile {
  id: string;
  name: string;
  relation: ProfileRelation;
  bloodType?: string;
  age?: number;
  avatarUri?: string;
  color: string; // Accent color for visual distinction
  createdAt: string;
}

export interface TimeSlot {
  label: TimeOfDay;
  time: string; // "08:00" format
}

export interface Medication {
  id: string;
  profileId: string; // Scoped to a family profile
  name: string;
  dosageAmount: number;
  dosageUnit: string;
  form: string;
  category: string;
  frequency: FrequencyType;
  specificDays?: number[];
  timesOfDay: TimeSlot[];
  instructions?: string;
  sideEffects?: string[];
  stockCount?: number;
  refillAlertAt?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type DoseStatus = "pending" | "taken" | "skipped" | "missed";

export interface DoseLog {
  id: string;
  profileId: string; // Scoped to a family profile
  medicationId: string;
  scheduledTime: string;
  status: DoseStatus;
  actionTime?: string;
  notes?: string;
}

export interface UserSettings {
  medicationReminders: boolean;
  refillAlerts: boolean;
  soundVibration: boolean;
  passcodeLock: boolean;
  biometricAuth: boolean;
  unitPreferences: string;
  themeMode: "system" | "light" | "dark";
}

export interface UserProfile {
  name: string;
  bloodType?: string;
  age?: number;
  avatarUri?: string;
  settings: UserSettings;
  isPremium: boolean;
  activeProfileId: string; // Currently selected family profile
}

export interface UpcomingDose {
  medication: Medication;
  timeSlot: TimeSlot;
  scheduledTime: Date;
  status: DoseStatus;
  doseLogId?: string;
}
