import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import { ProfileSwitcher } from "./ProfileSwitcher";

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  hideProfileSwitcher?: boolean;
}

export function Header({ showBack, onBack, rightElement, hideProfileSwitcher }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: colors.surface,
        paddingHorizontal: 24,
        paddingBottom: 12,
        paddingTop: insets.top + 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={{ padding: 8, borderRadius: 9999 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
        {/* Logo: Pill icon + text */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <MaterialIcons name="favorite" size={16} color="#fff" />
          </View>
          <Text style={{ color: colors.primary, fontSize: 24, fontFamily: "Manrope_700Bold" }}>
            Dosely
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {rightElement}
        {!hideProfileSwitcher && <ProfileSwitcher />}
      </View>
    </View>
  );
}
