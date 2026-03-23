import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import type { UpcomingDose } from "../data/types";
import { formatTime } from "../utils/dates";

interface DoseCardProps {
  dose: UpcomingDose;
  onTake: () => void;
  onSkip: () => void;
  onPress: () => void;
}

const FORM_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Tablet: "medication",
  Capsule: "medication",
  Pill: "circle",
  Softgel: "water-drop",
  Liquid: "water-drop",
  default: "medication",
};

export function DoseCard({ dose, onTake, onSkip, onPress }: DoseCardProps) {
  const { medication, timeSlot, status } = dose;
  const isTaken = status === "taken";
  const isSkipped = status === "skipped";
  const time = timeSlot.time || "08:00";
  const iconName = FORM_ICONS[medication.form] || FORM_ICONS.default;

  if (isTaken) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          padding: 20,
          borderRadius: 24,
          backgroundColor: "rgba(0, 135, 51, 0.1)",
        }}
      >
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.tertiaryContainer, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcons name="check-circle" size={28} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.tertiary, fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>
            {formatTime(time)}
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 18, fontFamily: "Manrope_700Bold", opacity: 0.6, textDecorationLine: "line-through" }}>
            {medication.name}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium" }}>
            {medication.dosageAmount}{medication.dosageUnit} {"\u2022"} {medication.form}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, backgroundColor: "rgba(0, 135, 51, 0.2)" }}>
          <Text style={{ color: colors.tertiary, fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 1.5 }}>
            Taken
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        padding: 20,
        borderRadius: 24,
        backgroundColor: colors.surfaceContainerLowest,
        shadowColor: colors.onSurface,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 32,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isSkipped ? colors.surfaceContainerHighest : colors.primaryFixed,
        }}
      >
        <MaterialIcons name={iconName} size={28} color={isSkipped ? colors.onSurfaceVariant : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>
          {formatTime(time)}
        </Text>
        <Text
          style={{
            color: colors.onSurface,
            fontSize: 18,
            fontFamily: "Manrope_700Bold",
            opacity: isSkipped ? 0.5 : 1,
            textDecorationLine: isSkipped ? "line-through" : "none",
          }}
        >
          {medication.name}
        </Text>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium" }}>
          {medication.dosageAmount}{medication.dosageUnit} {"\u2022"} 1 {medication.form}
        </Text>
      </View>
      {!isSkipped && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={onSkip}
            style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: colors.surfaceContainerHigh, alignItems: "center", justifyContent: "center" }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onTake}
            style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
