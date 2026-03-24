import React from "react";
import { TouchableOpacity, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "error" | "text";
  style?: ViewStyle;
}

export function PillButton({
  title,
  onPress,
  variant = "primary",
  style,
}: PillButtonProps) {
  if (variant === "text") {
    return (
      <TouchableOpacity onPress={onPress} style={[{ paddingVertical: 16 }, style]}>
        <Text
          style={{ color: colors.onSurfaceVariant, textAlign: "center", fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16 }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === "error") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[{ width: "100%", borderRadius: 9999, paddingVertical: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "rgba(214, 64, 69, 0.08)" }, style]}
        activeOpacity={0.7}
      >
        <Text
          style={{ color: colors.error, fontSize: 16, fontFamily: "PlusJakartaSans_700Bold" }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: "100%", borderRadius: 9999, paddingVertical: 20, alignItems: "center" }}
      >
        <Text
          style={{ color: "#fff", fontSize: 18, fontFamily: "Manrope_700Bold" }}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
