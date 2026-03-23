import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../theme";
import { useActiveProfile } from "../data/ProfileContext";
import type { FamilyProfile, ProfileRelation } from "../data/types";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RELATION_ICONS: Record<ProfileRelation, keyof typeof MaterialIcons.glyphMap> = {
  myself: "person",
  husband: "person",
  wife: "person",
  father: "elderly",
  mother: "elderly-woman",
  grandfather: "elderly",
  grandmother: "elderly-woman",
  son: "child-care",
  daughter: "child-care",
  brother: "person",
  sister: "person",
  other: "person-add",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileSwitcher() {
  const navigation = useNavigation<Nav>();
  const { activeProfile, allProfiles, switchProfile } = useActiveProfile();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = async (profile: FamilyProfile) => {
    await switchProfile(profile.id);
    setModalVisible(false);
  };

  return (
    <>
      {/* Trigger: Avatar with dropdown indicator */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        activeOpacity={0.7}
      >
        <View
          style={{ width: 40, height: 40, borderRadius: 9999, alignItems: "center", justifyContent: "center", backgroundColor: activeProfile.color }}
        >
          <Text
            style={{ color: "#fff", fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" }}
          >
            {getInitials(activeProfile.name)}
          </Text>
        </View>
        {allProfiles.length > 1 && (
          <MaterialIcons
            name="arrow-drop-down"
            size={20}
            color={colors.onSurfaceVariant}
          />
        )}
      </TouchableOpacity>

      {/* Profile Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={{ backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
            onPress={() => {}} // prevent close when tapping content
          >
            {/* Handle bar */}
            <View style={{ width: 40, height: 4, backgroundColor: colors.outlineVariant, borderRadius: 9999, alignSelf: "center", marginBottom: 24, opacity: 0.4 }} />

            <Text
              style={{ color: colors.onSurface, fontSize: 20, marginBottom: 24, fontFamily: "Manrope_700Bold" }}
            >
              Switch Profile
            </Text>

            <ScrollView
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
            >
              {allProfiles.map((profile) => {
                const isActive = profile.id === activeProfile.id;
                const icon = RELATION_ICONS[profile.relation] || "person";
                return (
                  <TouchableOpacity
                    key={profile.id}
                    onPress={() => handleSelect(profile)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      padding: 16,
                      borderRadius: 16,
                      marginBottom: 8,
                      backgroundColor: isActive
                        ? "rgba(0, 88, 188, 0.08)"
                        : "transparent",
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{ width: 48, height: 48, borderRadius: 9999, alignItems: "center", justifyContent: "center", backgroundColor: profile.color }}
                    >
                      <Text
                        style={{ color: "#fff", fontSize: 16, fontFamily: "PlusJakartaSans_700Bold" }}
                      >
                        {getInitials(profile.name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: colors.onSurface, fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold" }}
                      >
                        {profile.name}
                      </Text>
                      <Text
                        style={{ color: colors.onSurfaceVariant, fontSize: 12, textTransform: "capitalize", fontFamily: "PlusJakartaSans_400Regular" }}
                      >
                        {profile.relation === "myself"
                          ? "My medications"
                          : profile.relation}
                      </Text>
                    </View>
                    {isActive && (
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Add / Manage Profiles */}
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ManageProfiles");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                padding: 16,
                marginTop: 16,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: colors.primary,
                borderStyle: "dashed",
              }}
              activeOpacity={0.7}
            >
              <View
                style={{ width: 48, height: 48, borderRadius: 9999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 88, 188, 0.1)" }}
              >
                <MaterialIcons name="group-add" size={24} color={colors.primary} />
              </View>
              <View>
                <Text
                  style={{ color: colors.primary, fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold" }}
                >
                  Manage Profiles
                </Text>
                <Text
                  style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" }}
                >
                  Add family members or edit profiles
                </Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
