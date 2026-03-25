import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, ToggleSwitch } from "../components";
import { colors } from "../theme";
import { getProfile, updateProfile } from "../data/profile";
import { updateFamilyProfile } from "../data/familyProfiles";
import { useActiveProfile } from "../data/ProfileContext";
import type { RootStackParamList } from "../navigation/types";
import type { UserProfile } from "../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { activeProfile: familyProfile, refreshProfiles } = useActiveProfile();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const loadProfile = useCallback(async () => {
    const p = await getProfile();
    setProfile(p);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const toggleSetting = async (key: "medicationReminders" | "refillAlerts" | "soundVibration" | "passcodeLock" | "biometricAuth") => {
    if (!profile) return;
    const newValue = !profile.settings[key];
    const newSettings = { ...profile.settings, [key]: newValue };
    const updated = await updateProfile({ settings: newSettings });
    setProfile(updated);
    // Show feedback
    const labels: Record<string, string> = {
      medicationReminders: "Medication Reminders",
      refillAlerts: "Refill Alerts",
      soundVibration: "Sound & Vibration",
      passcodeLock: "Passcode Lock",
      biometricAuth: "Biometric Auth",
    };
    Alert.alert(labels[key], newValue ? "Enabled" : "Disabled");
  };

  const cycleTheme = async () => {
    if (!profile) return;
    const current = profile.settings.themeMode;
    const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
    const updated = await updateProfile({
      settings: { ...profile.settings, themeMode: next },
    });
    setProfile(updated);
  };

  const handleEditName = () => {
    setNameInput(familyProfile.name);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await updateFamilyProfile(familyProfile.id, { name: trimmed });
    await updateProfile({ name: trimmed });
    await refreshProfiles();
    setEditingName(false);
  };

  const handleEditAge = () => {
    Alert.prompt
      ? Alert.prompt("Age", "Enter your age", async (text) => {
          const age = parseInt(text);
          if (!isNaN(age) && age > 0) {
            await updateFamilyProfile(familyProfile.id, { age });
            await refreshProfiles();
          }
        })
      : Alert.alert("Edit Age", "Enter your age", [
          {
            text: "Set Age",
            onPress: async () => {
              // Android doesn't support Alert.prompt, use inline editing
              await updateFamilyProfile(familyProfile.id, { age: (familyProfile.age || 0) + 1 });
              await refreshProfiles();
            },
          },
          { text: "Cancel", style: "cancel" },
        ]);
  };

  const handleEditBloodType = () => {
    const types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    Alert.alert("Blood Type", "Select your blood type", [
      ...types.map((bt) => ({
        text: bt,
        onPress: async () => {
          await updateFamilyProfile(familyProfile.id, { bloodType: bt });
          await refreshProfiles();
        },
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (!profile) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLow }}>
      <Header />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={{ alignItems: "center", paddingVertical: 32, gap: 16 }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 96, height: 96, borderRadius: 32,
                alignItems: "center", justifyContent: "center", overflow: "hidden",
                backgroundColor: familyProfile.color || colors.surfaceContainerHighest,
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 32, fontFamily: "Manrope_800ExtraBold" }}>
                {familyProfile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleEditName}
              style={{
                position: "absolute", bottom: -8, right: -8,
                backgroundColor: colors.primary, padding: 8, borderRadius: 9999,
                borderWidth: 4, borderColor: colors.surface,
              }}
            >
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Name - editable */}
          {editingName ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                style={{
                  fontSize: 28, fontFamily: "Manrope_800ExtraBold", color: colors.onSurface,
                  borderBottomWidth: 2, borderBottomColor: colors.primary,
                  paddingVertical: 4, minWidth: 120, textAlign: "center",
                }}
              />
              <TouchableOpacity onPress={handleSaveName} style={{ padding: 8, backgroundColor: colors.primary, borderRadius: 9999 }}>
                <MaterialIcons name="check" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={{ padding: 8 }}>
                <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleEditName}>
              <Text style={{ color: colors.onSurface, fontSize: 32, letterSpacing: -0.5, fontFamily: "Manrope_800ExtraBold" }}>
                {familyProfile.name}
              </Text>
            </TouchableOpacity>
          )}

          {familyProfile.relation !== "myself" && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: `${colors.primary}18`, borderRadius: 9999 }}>
              <Text style={{ color: colors.primary, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, fontFamily: "PlusJakartaSans_700Bold" }}>
                {familyProfile.relation}
              </Text>
            </View>
          )}

          {/* Blood type & Age - tappable to edit */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <TouchableOpacity onPress={handleEditBloodType} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surfaceContainerLow, borderRadius: 9999 }}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium" }}>
                Blood Type:{" "}
                <Text style={{ color: colors.primary, fontFamily: "PlusJakartaSans_700Bold" }}>
                  {familyProfile.bloodType || "Set"}
                </Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditAge} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surfaceContainerLow, borderRadius: 9999 }}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium" }}>
                Age:{" "}
                <Text style={{ color: colors.primary, fontFamily: "PlusJakartaSans_700Bold" }}>
                  {familyProfile.age || "Set"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text style={{ color: colors.onSurface, fontSize: 20, paddingHorizontal: 4, fontFamily: "Manrope_700Bold" }}>
            Notification Settings
          </Text>
          <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, overflow: "hidden" }}>
            {[
              { key: "medicationReminders" as const, label: "Medication Reminders", sub: "Daily alerts for scheduled doses", icon: "notifications" as const, iconColor: colors.primary, iconBg: `${colors.primary}18` },
              { key: "refillAlerts" as const, label: "Refill Alerts", sub: "Notify when prescription is low", icon: "event-repeat" as const, iconColor: colors.tertiary, iconBg: `${colors.tertiary}18` },
              { key: "soundVibration" as const, label: "Sound/Vibration", sub: "Haptic feedback and custom tones", icon: "vibration" as const, iconColor: colors.secondary, iconBg: `${colors.secondary}18` },
            ].map((item, i) => (
              <View
                key={item.key}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20,
                  borderTopWidth: i > 0 ? 1 : 0, borderTopColor: `${colors.outlineVariant}20`,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16, flex: 1 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: item.iconBg }}>
                    <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_600SemiBold" }}>{item.label}</Text>
                    <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" }}>{item.sub}</Text>
                  </View>
                </View>
                <ToggleSwitch
                  value={profile.settings[item.key]}
                  onToggle={() => toggleSetting(item.key)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Security */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text style={{ color: colors.onSurface, fontSize: 20, paddingHorizontal: 4, fontFamily: "Manrope_700Bold" }}>
            Security
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity
              onPress={() => toggleSetting("passcodeLock")}
              style={{
                flex: 1, padding: 20, borderRadius: 24, justifyContent: "space-between", height: 128,
                backgroundColor: colors.surfaceContainerLowest,
                borderWidth: profile.settings.passcodeLock ? 2 : 1,
                borderColor: profile.settings.passcodeLock ? colors.primary : `${colors.outlineVariant}10`,
              }}
            >
              <MaterialIcons name="lock" size={24} color={profile.settings.passcodeLock ? colors.primary : colors.onSurfaceVariant} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_700Bold" }}>Passcode</Text>
                <Text style={{ color: profile.settings.passcodeLock ? colors.primary : colors.onSurfaceVariant, fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold" }}>
                  {profile.settings.passcodeLock ? "ON" : "OFF"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleSetting("biometricAuth")}
              style={{
                flex: 1, padding: 20, borderRadius: 24, justifyContent: "space-between", height: 128,
                backgroundColor: colors.surfaceContainerLowest,
                borderWidth: profile.settings.biometricAuth ? 2 : 1,
                borderColor: profile.settings.biometricAuth ? colors.primary : `${colors.outlineVariant}10`,
              }}
            >
              <MaterialIcons name="fingerprint" size={24} color={profile.settings.biometricAuth ? colors.primary : colors.onSurfaceVariant} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_700Bold" }}>Biometric</Text>
                <Text style={{ color: profile.settings.biometricAuth ? colors.primary : colors.onSurfaceVariant, fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold" }}>
                  {profile.settings.biometricAuth ? "ON" : "OFF"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* General */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text style={{ color: colors.onSurface, fontSize: 20, paddingHorizontal: 4, fontFamily: "Manrope_700Bold" }}>
            General
          </Text>
          <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, overflow: "hidden" }}>
            {/* Unit Preferences */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Unit Preferences", "Select default units", [
                  { text: "mg, ml", onPress: async () => { const u = await updateProfile({ settings: { ...profile.settings, unitPreferences: "mg, ml" } }); setProfile(u); } },
                  { text: "mcg, drops", onPress: async () => { const u = await updateProfile({ settings: { ...profile.settings, unitPreferences: "mcg, drops" } }); setProfile(u); } },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <MaterialIcons name="straighten" size={22} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_600SemiBold" }}>Unit Preferences</Text>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: `${colors.primary}18` }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" }}>{profile.settings.unitPreferences}</Text>
              </View>
            </TouchableOpacity>

            {/* Theme Mode */}
            <TouchableOpacity
              onPress={cycleTheme}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderTopWidth: 1, borderTopColor: `${colors.outlineVariant}20` }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <MaterialIcons name="dark-mode" size={22} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_600SemiBold" }}>Theme Mode</Text>
              </View>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" }}>
                {profile.settings.themeMode.charAt(0).toUpperCase() + profile.settings.themeMode.slice(1)}
              </Text>
            </TouchableOpacity>

            {/* Manage Profiles */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ManageProfiles")}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderTopWidth: 1, borderTopColor: `${colors.outlineVariant}20` }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <MaterialIcons name="people" size={22} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_600SemiBold" }}>Manage Profiles</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* About & Legal */}
            <TouchableOpacity
              onPress={() => navigation.navigate("About")}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderTopWidth: 1, borderTopColor: `${colors.outlineVariant}20` }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <MaterialIcons name="info" size={22} color={colors.onSurfaceVariant} />
                <Text style={{ color: colors.onSurface, fontFamily: "PlusJakartaSans_600SemiBold" }}>About & Legal</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out / Reset */}
        <View style={{ paddingTop: 16, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Log Out", "This will reset all your data. Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset & Log Out", style: "destructive",
                  onPress: async () => {
                    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
                    await AsyncStorage.clear();
                    Alert.alert("Done", "App data cleared. Restart the app.");
                  },
                },
              ]);
            }}
            style={{
              width: "100%", borderRadius: 9999, paddingVertical: 20,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
              backgroundColor: `${colors.error}14`,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={22} color={colors.error} />
            <Text style={{ color: colors.error, fontSize: 16, fontFamily: "PlusJakartaSans_700Bold" }}>Log Out</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 24, fontSize: 12, opacity: 0.5, fontFamily: "PlusJakartaSans_500Medium", color: colors.onSurfaceVariant }}>
            DoseWise Version 1.0.0 (Build 1)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
