import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";
import { useActiveProfile } from "../data/ProfileContext";
import {
  getFamilyProfiles,
  addFamilyProfile,
  deleteFamilyProfile,
} from "../data/familyProfiles";
import type { FamilyProfile, ProfileRelation } from "../data/types";

const RELATIONS: { label: string; value: ProfileRelation; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { label: "Myself", value: "myself", icon: "person" },
  { label: "Husband", value: "husband", icon: "person" },
  { label: "Wife", value: "wife", icon: "person" },
  { label: "Father", value: "father", icon: "elderly" },
  { label: "Mother", value: "mother", icon: "elderly-woman" },
  { label: "Grandfather", value: "grandfather", icon: "elderly" },
  { label: "Grandmother", value: "grandmother", icon: "elderly-woman" },
  { label: "Son", value: "son", icon: "child-care" },
  { label: "Daughter", value: "daughter", icon: "child-care" },
  { label: "Brother", value: "brother", icon: "person" },
  { label: "Sister", value: "sister", icon: "person" },
  { label: "Other", value: "other", icon: "person-add" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ManageProfilesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { refreshProfiles, activeProfile } = useActiveProfile();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedRelation, setSelectedRelation] = useState<ProfileRelation>("other");

  const loadProfiles = useCallback(async () => {
    const p = await getFamilyProfiles();
    setProfiles(p);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [loadProfiles])
  );

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert("Missing Name", "Please enter a name for this profile.");
      return;
    }
    await addFamilyProfile(newName.trim(), selectedRelation);
    await refreshProfiles();
    await loadProfiles();
    setNewName("");
    setSelectedRelation("other");
    setShowAddForm(false);
  };

  const handleDelete = (profile: FamilyProfile) => {
    if (profile.id === activeProfile?.id) {
      Alert.alert(
        "Cannot Delete",
        "You cannot delete the currently active profile. Switch to another profile first."
      );
      return;
    }
    if (profiles.length <= 1) {
      Alert.alert("Cannot Delete", "You must have at least one profile.");
      return;
    }
    Alert.alert(
      "Delete Profile",
      `Delete "${profile.name}"? All their medications and dose history will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteFamilyProfile(profile.id);
            await refreshProfiles();
            await loadProfiles();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={{ width: "100%", backgroundColor: colors.surface, paddingHorizontal: 24, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, borderRadius: 9999 }}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <Text
            style={{ color: colors.primary, fontSize: 24, fontFamily: "Manrope_700Bold" }}
          >
            Dosely
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <View style={{ marginTop: 32, marginBottom: 40 }}>
          <Text
            style={{ color: colors.primary, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "PlusJakartaSans_600SemiBold" }}
          >
            Family Care
          </Text>
          <Text
            style={{ color: colors.onSurface, fontSize: 44, lineHeight: 48, letterSpacing: -0.5, fontFamily: "Manrope_800ExtraBold" }}
          >
            Manage{"\n"}Profiles
          </Text>
          <Text
            style={{ color: colors.onSurfaceVariant, fontSize: 18, marginTop: 16, fontFamily: "PlusJakartaSans_400Regular" }}
          >
            Track medications for your loved ones. Each profile has its own
            medications and reminders.
          </Text>
        </View>

        {/* Existing Profiles */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile?.id;
            const relation = RELATIONS.find((r) => r.value === profile.relation);
            return (
              <View
                key={profile.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  padding: 20,
                  borderRadius: 24,
                  backgroundColor: isActive
                    ? "rgba(0, 88, 188, 0.06)"
                    : colors.surfaceContainerLowest,
                  borderWidth: isActive ? 2 : 0,
                  borderColor: isActive ? colors.primary : "transparent",
                  shadowColor: isActive ? "transparent" : colors.onSurface,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 16,
                  elevation: isActive ? 0 : 1,
                }}
              >
                <View
                  style={{ width: 56, height: 56, borderRadius: 9999, alignItems: "center", justifyContent: "center", backgroundColor: profile.color }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 18, fontFamily: "PlusJakartaSans_700Bold" }}
                  >
                    {getInitials(profile.name)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: colors.onSurface, fontSize: 18, fontFamily: "Manrope_700Bold" }}
                  >
                    {profile.name}
                  </Text>
                  <Text
                    style={{ color: colors.onSurfaceVariant, fontSize: 14, textTransform: "capitalize", fontFamily: "PlusJakartaSans_400Regular" }}
                  >
                    {profile.relation === "myself"
                      ? "My medications"
                      : profile.relation}
                    {profile.age ? ` \u2022 ${profile.age} years` : ""}
                  </Text>
                </View>
                {isActive && (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.primary, borderRadius: 9999 }}>
                    <Text
                      style={{ color: "#fff", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontFamily: "PlusJakartaSans_700Bold" }}
                    >
                      Active
                    </Text>
                  </View>
                )}
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => handleDelete(profile)}
                    style={{ padding: 8 }}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Add New Profile Form */}
        {showAddForm ? (
          <View style={{ backgroundColor: colors.surfaceContainerLow, padding: 32, borderRadius: 24, gap: 24, marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                style={{ width: 32, height: 32, borderRadius: 9999, alignItems: "center", justifyContent: "center" }}
              >
                <MaterialIcons name="person-add" size={18} color="#fff" />
              </LinearGradient>
              <Text
                style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_600SemiBold" }}
              >
                New Profile
              </Text>
            </View>

            {/* Name Input */}
            <View>
              <Text
                style={{ color: colors.onSurfaceVariant, fontSize: 14, marginBottom: 8, marginLeft: 4, fontFamily: "PlusJakartaSans_600SemiBold" }}
              >
                Name
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Grandpa Ali, Mom"
                placeholderTextColor={colors.outlineVariant}
                style={{
                  width: "100%",
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  backgroundColor: colors.surfaceContainerHigh,
                  borderRadius: 16,
                  color: colors.onSurface,
                  fontFamily: "PlusJakartaSans_400Regular",
                  fontSize: 16,
                }}
              />
            </View>

            {/* Relation Selector */}
            <View>
              <Text
                style={{ color: colors.onSurfaceVariant, fontSize: 14, marginBottom: 12, marginLeft: 4, fontFamily: "PlusJakartaSans_600SemiBold" }}
              >
                Relationship
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {RELATIONS.map((rel) => {
                  const isSelected = selectedRelation === rel.value;
                  return (
                    <TouchableOpacity
                      key={rel.value}
                      onPress={() => setSelectedRelation(rel.value)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 9999,
                        backgroundColor: isSelected
                          ? "rgba(0, 88, 188, 0.1)"
                          : colors.surfaceContainerHighest,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected
                          ? colors.primary
                          : "transparent",
                      }}
                    >
                      <MaterialIcons
                        name={rel.icon}
                        size={16}
                        color={
                          isSelected
                            ? colors.primary
                            : colors.onSurfaceVariant
                        }
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "PlusJakartaSans_600SemiBold",
                          color: isSelected
                            ? colors.primary
                            : colors.onSurfaceVariant,
                        }}
                      >
                        {rel.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddForm(false);
                  setNewName("");
                }}
                style={{ flex: 1, paddingVertical: 16, borderRadius: 9999, alignItems: "center", backgroundColor: colors.surfaceContainerHighest }}
              >
                <Text
                  style={{ color: colors.onSurfaceVariant, fontFamily: "PlusJakartaSans_600SemiBold" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={{ flex: 1, borderRadius: 9999, overflow: "hidden" }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  style={{ paddingVertical: 16, alignItems: "center", borderRadius: 9999 }}
                >
                  <Text
                    style={{ color: "#fff", fontFamily: "PlusJakartaSans_700Bold" }}
                  >
                    Add Profile
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 20,
              borderRadius: 24,
              marginBottom: 32,
              borderWidth: 1.5,
              borderColor: colors.primary,
              borderStyle: "dashed",
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={24} color={colors.primary} />
            <Text
              style={{ color: colors.primary, fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold" }}
            >
              Add Family Member
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
