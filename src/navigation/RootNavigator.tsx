import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainTabs } from "./MainTabs";
import { MedicationDetailScreen } from "../screens/MedicationDetailScreen";
import { AddMedicationScreen } from "../screens/AddMedicationScreen";
import { ManageProfilesScreen } from "../screens/ManageProfilesScreen";
import { AboutScreen } from "../screens/AboutScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="MedicationDetail"
        component={MedicationDetailScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ManageProfiles"
        component={ManageProfilesScreen}
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}
