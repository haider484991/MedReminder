import React from "react";
import { TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
}

export function ToggleSwitch({ value, onToggle }: ToggleSwitchProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(!value)}
      style={{
        width: 48,
        height: 24,
        borderRadius: 9999,
        justifyContent: "center",
        paddingHorizontal: 4,
        backgroundColor: value
          ? colors.primary
          : colors.surfaceContainerHighest,
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 9999,
          backgroundColor: "#fff",
          alignSelf: value ? "flex-end" : "flex-start",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </TouchableOpacity>
  );
}
