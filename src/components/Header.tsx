import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import { ProfileSwitcher } from "./ProfileSwitcher";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoImage = require("../../assets/icon.png");

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image
            source={logoImage}
            style={{ width: 32, height: 32, borderRadius: 8 }}
            resizeMode="contain"
          />
          <Text style={{ color: colors.primary, fontSize: 24, fontFamily: "Manrope_700Bold" }}>
            DoseWise
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
