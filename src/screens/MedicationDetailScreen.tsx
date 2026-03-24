import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";
import { getMedicationById, deleteMedication, updateMedication } from "../data/medications";
import { getAdherenceRate } from "../data/doseLogs";
import { getDefaultTime } from "../data/scheduler";
import { formatTime } from "../utils/dates";
import type { RootStackParamList } from "../navigation/types";
import type { Medication } from "../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "MedicationDetail">;
type Route = RouteProp<RootStackParamList, "MedicationDetail">;

export function MedicationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { medicationId } = route.params;

  const [med, setMed] = useState<Medication | null>(null);
  const [adherence, setAdherence] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const medication = await getMedicationById(medicationId);
        setMed(medication);
        const rate = await getAdherenceRate(medicationId);
        setAdherence(rate);
      })();
    }, [medicationId])
  );

  if (!med) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.onSurfaceVariant }}>Loading...</Text>
      </View>
    );
  }

  const nextDoseTime =
    med.timesOfDay.length > 0
      ? formatTime(med.timesOfDay[0].time || getDefaultTime(med.timesOfDay[0].label))
      : "N/A";

  const instructionsList = med.instructions
    ? med.instructions.split("\n").filter((l) => l.trim()).slice(0, 3)
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={{
        width: "100%",
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingBottom: 12,
        paddingTop: insets.top + 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, borderRadius: 9999 }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ color: colors.primary, fontSize: 20, fontFamily: "Manrope_700Bold" }}>
          Dosely
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddMedication", { medication: med })}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 9999,
            backgroundColor: colors.surfaceContainerHigh,
          }}
        >
          <MaterialIcons name="edit" size={14} color={colors.onSurfaceVariant} />
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold" }}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ marginBottom: 32, marginTop: 8 }}>
          <View style={{ width: "100%", aspectRatio: 1.4, borderRadius: 24, overflow: "hidden", backgroundColor: colors.surfaceContainerLow, marginBottom: 24 }}>
            <LinearGradient
              colors={[colors.primaryFixed, colors.surfaceContainerLow]}
              style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
            >
              <MaterialIcons name="medication" size={100} color={colors.primary} />
            </LinearGradient>
          </View>
          <Text style={{ color: colors.onSurface, fontSize: 32, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.5, marginBottom: 4 }}>
            {med.name}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 17, fontFamily: "PlusJakartaSans_400Regular" }}>
            {med.dosageAmount}{med.dosageUnit} {"\u2022"} {med.form}
          </Text>
          {med.stockCount !== undefined && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(91, 143, 185, 0.06)", alignSelf: "flex-start" }}>
              <MaterialIcons name="inventory-2" size={16} color={colors.primary} />
              <Text style={{ color: colors.onSurface, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" }}>
                {med.stockCount} pills left
              </Text>
            </View>
          )}
        </View>

        {/* Refill Reminder */}
        <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <View style={{ padding: 10, borderRadius: 16, backgroundColor: med.refillAlertAt ? "rgba(46, 158, 94, 0.1)" : "rgba(91, 143, 185, 0.1)" }}>
            <MaterialIcons
              name={med.refillAlertAt ? "notifications-active" : "notifications-none"}
              size={22}
              color={med.refillAlertAt ? colors.tertiary : colors.primary}
            />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ color: colors.onSurface, fontSize: 15, fontFamily: "Manrope_700Bold" }}>
              Refill Reminder
            </Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" }}>
              {med.refillAlertAt
                ? `Alert when ${med.refillAlertAt} pills remain`
                : "Get notified when stock is low"}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={async () => {
              if (med.refillAlertAt) {
                // Turn off alert
                await updateMedication(med.id, { refillAlertAt: undefined });
                setMed({ ...med, refillAlertAt: undefined });
                Alert.alert("Alert Removed", "Refill reminder has been turned off.");
              } else {
                // Turn on alert — ask for threshold
                Alert.alert(
                  "Set Refill Alert",
                  "We'll remind you when your stock is running low.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "At 5 pills",
                      onPress: async () => {
                        await updateMedication(med.id, { refillAlertAt: 5 });
                        setMed({ ...med, refillAlertAt: 5 });
                      },
                    },
                    {
                      text: "At 10 pills",
                      onPress: async () => {
                        await updateMedication(med.id, { refillAlertAt: 10 });
                        setMed({ ...med, refillAlertAt: 10 });
                      },
                    },
                  ]
                );
              }
            }}
          >
            <LinearGradient
              colors={med.refillAlertAt ? [colors.tertiary, colors.tertiaryContainer] : [colors.primary, colors.primaryContainer]}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 9999 }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontFamily: "PlusJakartaSans_700Bold" }}>
                {med.refillAlertAt ? "On" : "Set Alert"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
          <View style={{ flex: 1, borderRadius: 24, padding: 20, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: "rgba(191, 196, 212, 0.1)" }}>
            <MaterialIcons name="check-circle" size={24} color={colors.tertiary} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Adherence</Text>
            <Text style={{ color: colors.onSurface, fontSize: 28, fontFamily: "Manrope_800ExtraBold" }}>{adherence}%</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 24, padding: 20, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: "rgba(191, 196, 212, 0.1)" }}>
            <MaterialIcons name="schedule" size={24} color={colors.secondary} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Next Dose</Text>
            <Text style={{ color: colors.onSurface, fontSize: 28, fontFamily: "Manrope_800ExtraBold" }}>{nextDoseTime}</Text>
          </View>
        </View>

        {/* Instructions */}
        {instructionsList.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <View style={{ width: 6, height: 24, backgroundColor: colors.primary, borderRadius: 9999 }} />
              <Text style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_700Bold" }}>Instructions</Text>
            </View>
            <View style={{ gap: 12 }}>
              {instructionsList.map((inst, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 16, padding: 16, borderRadius: 16, backgroundColor: "rgba(242, 244, 249, 0.5)" }}>
                  <Text style={{ fontSize: 22, fontFamily: "Manrope_800ExtraBold", color: "rgba(91, 143, 185, 0.3)", lineHeight: 26 }}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text style={{ color: colors.onSurface, flex: 1, fontFamily: "PlusJakartaSans_500Medium", lineHeight: 22, fontSize: 14 }}>{inst}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Side Effects */}
        {med.sideEffects && med.sideEffects.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <View style={{ width: 6, height: 24, backgroundColor: colors.error, borderRadius: 9999 }} />
              <Text style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_700Bold" }}>Common Side Effects</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {med.sideEffects.map((effect) => (
                <View key={effect} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surfaceContainerHighest, borderRadius: 9999 }}>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", fontStyle: "italic" }}>{effect}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={{ fontSize: 11, fontFamily: "PlusJakartaSans_600SemiBold", color: colors.onSurfaceVariant, opacity: 0.6, lineHeight: 16, textTransform: "uppercase", letterSpacing: -0.2 }}>
          Disclaimer: This information is for educational purposes. Consult your healthcare professional for personalized medical advice.
        </Text>

        {/* Delete Medication */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Delete Medication",
              `Are you sure you want to delete "${med.name}"? This action cannot be undone.`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await deleteMedication(med.id);
                    navigation.goBack();
                  },
                },
              ]
            );
          }}
          style={{
            marginTop: 40,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 16,
            borderRadius: 9999,
            backgroundColor: "rgba(214, 64, 69, 0.08)",
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={20} color={colors.error} />
          <Text style={{ color: colors.error, fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold" }}>
            Delete Medication
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
