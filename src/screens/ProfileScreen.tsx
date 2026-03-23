import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, ToggleSwitch } from "../components";
import { colors } from "../theme";
import { getProfile, updateProfile } from "../data/profile";
import { useActiveProfile } from "../data/ProfileContext";
import type { UserProfile, UserSettings } from "../data/types";

const THEME_OPTIONS = ["System", "Light", "Dark"] as const;

export function ProfileScreen() {
  const { activeProfile: familyProfile } = useActiveProfile();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = useCallback(async () => {
    const p = await getProfile();
    setProfile(p);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const toggleSetting = async (key: keyof UserSettings) => {
    if (!profile) return;
    const updated = await updateProfile({
      settings: { ...profile.settings, [key]: !profile.settings[key] },
    });
    setProfile(updated);
  };

  const cycleTheme = async () => {
    if (!profile) return;
    const current = profile.settings.themeMode;
    const next =
      current === "system" ? "light" : current === "light" ? "dark" : "system";
    const updated = await updateProfile({
      settings: { ...profile.settings, themeMode: next },
    });
    setProfile(updated);
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
                width: 96,
                height: 96,
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: familyProfile?.color || colors.surfaceContainerHighest,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 32,
                  fontFamily: "Manrope_800ExtraBold",
                }}
              >
                {familyProfile
                  ? familyProfile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                  : "?"}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: -8,
                right: -8,
                backgroundColor: colors.primary,
                padding: 8,
                borderRadius: 9999,
                borderWidth: 4,
                borderColor: colors.surface,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: colors.onSurface,
              fontSize: 36,
              letterSpacing: -0.5,
              fontFamily: "Manrope_800ExtraBold",
            }}
          >
            {familyProfile?.name || profile.name}
          </Text>

          {familyProfile && familyProfile.relation !== "myself" && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                backgroundColor: "rgba(0, 88, 188, 0.1)",
                borderRadius: 9999,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontFamily: "PlusJakartaSans_700Bold",
                }}
              >
                {familyProfile.relation}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            {(familyProfile?.bloodType || profile.bloodType) && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: 9999,
                }}
              >
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontSize: 14,
                    fontFamily: "PlusJakartaSans_500Medium",
                  }}
                >
                  Blood Type:{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "PlusJakartaSans_700Bold",
                    }}
                  >
                    {familyProfile?.bloodType || profile.bloodType}
                  </Text>
                </Text>
              </View>
            )}
            {(familyProfile?.age || profile.age) && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: 9999,
                }}
              >
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontSize: 14,
                    fontFamily: "PlusJakartaSans_500Medium",
                  }}
                >
                  Age:{" "}
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "PlusJakartaSans_700Bold",
                    }}
                  >
                    {familyProfile?.age || profile.age}
                  </Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notification Settings */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 20,
              paddingHorizontal: 4,
              fontFamily: "Manrope_700Bold",
            }}
          >
            Notification Settings
          </Text>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {/* Medication Reminders */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 88, 188, 0.1)",
                  }}
                >
                  <MaterialIcons name="notifications" size={22} color={colors.primary} />
                </View>
                <View>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontFamily: "PlusJakartaSans_600SemiBold",
                    }}
                  >
                    Medication Reminders
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 12,
                      fontFamily: "PlusJakartaSans_400Regular",
                    }}
                  >
                    Daily alerts for scheduled doses
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={profile.settings.medicationReminders}
                onToggle={() => toggleSetting("medicationReminders")}
              />
            </View>

            {/* Refill Alerts */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: "rgba(193, 198, 215, 0.1)",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 107, 39, 0.1)",
                  }}
                >
                  <MaterialIcons name="event-repeat" size={22} color={colors.tertiary} />
                </View>
                <View>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontFamily: "PlusJakartaSans_600SemiBold",
                    }}
                  >
                    Refill Alerts
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 12,
                      fontFamily: "PlusJakartaSans_400Regular",
                    }}
                  >
                    Notify when prescription is low
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={profile.settings.refillAlerts}
                onToggle={() => toggleSetting("refillAlerts")}
              />
            </View>

            {/* Sound/Vibration */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: "rgba(193, 198, 215, 0.1)",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(64, 94, 150, 0.1)",
                  }}
                >
                  <MaterialIcons name="vibration" size={22} color={colors.secondary} />
                </View>
                <View>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontFamily: "PlusJakartaSans_600SemiBold",
                    }}
                  >
                    Sound/Vibration
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: 12,
                      fontFamily: "PlusJakartaSans_400Regular",
                    }}
                  >
                    Haptic feedback and custom tones
                  </Text>
                </View>
              </View>
              <ToggleSwitch
                value={profile.settings.soundVibration}
                onToggle={() => toggleSetting("soundVibration")}
              />
            </View>
          </View>
        </View>

        {/* Security */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 20,
              paddingHorizontal: 4,
              fontFamily: "Manrope_700Bold",
            }}
          >
            Security
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 20,
                borderRadius: 24,
                justifyContent: "space-between",
                height: 128,
                backgroundColor: colors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: "rgba(193, 198, 215, 0.05)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <MaterialIcons name="lock" size={24} color={colors.primary} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: "PlusJakartaSans_700Bold",
                  }}
                >
                  Passcode Lock
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                padding: 20,
                borderRadius: 24,
                justifyContent: "space-between",
                height: 128,
                backgroundColor: colors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: "rgba(193, 198, 215, 0.05)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <MaterialIcons name="fingerprint" size={24} color={colors.primary} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: "PlusJakartaSans_700Bold",
                  }}
                >
                  Biometric Auth
                </Text>
                <ToggleSwitch
                  value={profile.settings.biometricAuth}
                  onToggle={() => toggleSetting("biometricAuth")}
                />
              </View>
            </View>
          </View>
        </View>

        {/* General */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 20,
              paddingHorizontal: 4,
              fontFamily: "Manrope_700Bold",
            }}
          >
            General
          </Text>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {/* Unit Preferences */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <MaterialIcons name="straighten" size={22} color={colors.onSurfaceVariant} />
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: "PlusJakartaSans_600SemiBold",
                  }}
                >
                  Unit Preferences
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: "rgba(0, 88, 188, 0.1)",
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 14,
                    fontFamily: "PlusJakartaSans_700Bold",
                  }}
                >
                  {profile.settings.unitPreferences}
                </Text>
              </View>
            </View>

            {/* Theme Mode */}
            <TouchableOpacity
              onPress={cycleTheme}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: "rgba(193, 198, 215, 0.1)",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <MaterialIcons name="dark-mode" size={22} color={colors.onSurfaceVariant} />
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: "PlusJakartaSans_600SemiBold",
                  }}
                >
                  Theme Mode
                </Text>
              </View>
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  fontSize: 14,
                  fontFamily: "PlusJakartaSans_700Bold",
                }}
              >
                {profile.settings.themeMode.charAt(0).toUpperCase() +
                  profile.settings.themeMode.slice(1)}
              </Text>
            </TouchableOpacity>

            {/* Support */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: "rgba(193, 198, 215, 0.1)",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <MaterialIcons name="help" size={22} color={colors.onSurfaceVariant} />
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: "PlusJakartaSans_600SemiBold",
                  }}
                >
                  Support
                </Text>
              </View>
              <MaterialIcons
                name="open-in-new"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out */}
        <View style={{ paddingTop: 16, alignItems: "center" }}>
          <TouchableOpacity
            style={{
              width: "100%",
              borderRadius: 9999,
              paddingVertical: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              backgroundColor: "rgba(186, 26, 26, 0.08)",
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={22} color={colors.error} />
            <Text
              style={{
                color: colors.error,
                fontSize: 16,
                fontFamily: "PlusJakartaSans_700Bold",
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              marginTop: 24,
              fontSize: 12,
              opacity: 0.5,
              fontFamily: "PlusJakartaSans_500Medium",
              color: colors.onSurfaceVariant,
            }}
          >
            Dosely Version 1.0.0 (Build 1)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
