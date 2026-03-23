import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ScheduleScreen } from "../screens/ScheduleScreen";
import { AddMedicationScreen } from "../screens/AddMedicationScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: {
  name: keyof MainTabParamList;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { name: "Dashboard", label: "Home", icon: "grid-view" },
  { name: "Schedule", label: "Schedule", icon: "calendar-today" },
  { name: "Add", label: "Add", icon: "add-circle" },
  { name: "Profile", label: "Profile", icon: "person" },
];

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + bottomPadding,
          backgroundColor: "rgba(255, 255, 255, 0.97)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          shadowColor: colors.onSurface,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 8,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={
            tab.name === "Dashboard"
              ? DashboardScreen
              : tab.name === "Schedule"
              ? ScheduleScreen
              : tab.name === "Add"
              ? AddMedicationScreen
              : ProfileScreen
          }
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  fontFamily: focused ? "PlusJakartaSans_600SemiBold" : "PlusJakartaSans_500Medium",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: focused ? colors.primary : colors.onSurfaceVariant,
                  marginTop: -2,
                }}
              >
                {tab.label}
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name={tab.icon}
                size={tab.name === "Add" ? 28 : 22}
                color={focused ? colors.primary : colors.onSurfaceVariant}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
