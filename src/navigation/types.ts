import type { Medication } from "../data/types";

export type RootStackParamList = {
  Main: undefined;
  MedicationDetail: { medicationId: string };
  AddMedication: { medication?: Medication };
  ManageProfiles: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Add: undefined;
  Profile: undefined;
};
