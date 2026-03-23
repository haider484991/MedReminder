import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Header, PillButton } from "../components";
import { colors } from "../theme";
import { addMedication, updateMedication } from "../data/medications";
import { useActiveProfile } from "../data/ProfileContext";
import type { RootStackParamList } from "../navigation/types";
import type { FrequencyType, TimeOfDay, TimeSlot } from "../data/types";
import { getDefaultTime } from "../data/scheduler";
import { formatTime } from "../utils/dates";

type Nav = NativeStackNavigationProp<RootStackParamList, "AddMedication">;
type Route = RouteProp<RootStackParamList, "AddMedication">;

const UNITS = ["mg", "ml", "mcg", "pills", "drops"];
const TIME_OPTIONS: { label: TimeOfDay; icon: keyof typeof MaterialIcons.glyphMap; display: string }[] = [
  { label: "morning", icon: "wb-sunny", display: "Morning" },
  { label: "noon", icon: "light-mode", display: "Noon" },
  { label: "evening", icon: "wb-twilight", display: "Evening" },
  { label: "night", icon: "bedtime", display: "Night" },
];

export function AddMedicationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { activeProfile } = useActiveProfile();
  const existingMed = route.params?.medication;
  const isEditing = !!existingMed;

  const [name, setName] = useState(existingMed?.name || "");
  const [dosageAmount, setDosageAmount] = useState(existingMed?.dosageAmount?.toString() || "");
  const [dosageUnit, setDosageUnit] = useState(existingMed?.dosageUnit || "mg");
  const [frequency, setFrequency] = useState<FrequencyType>(existingMed?.frequency || "daily");
  const [selectedTimes, setSelectedTimes] = useState<TimeOfDay[]>(
    existingMed?.timesOfDay?.map((t) => t.label) || []
  );
  const [customTimes, setCustomTimes] = useState<Record<TimeOfDay, string>>(
    (existingMed?.timesOfDay?.reduce((acc, t) => ({ ...acc, [t.label]: t.time }), {} as Record<TimeOfDay, string>) || {}) as Record<TimeOfDay, string>
  );
  const [form, setForm] = useState(existingMed?.form || "Tablet");
  const [stockCount, setStockCount] = useState(existingMed?.stockCount?.toString() || "");
  const [selectedDays, setSelectedDays] = useState<number[]>(existingMed?.specificDays || []);
  const [instructions, setInstructions] = useState(existingMed?.instructions || "");
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [formPickerOpen, setFormPickerOpen] = useState(false);
  const [editingTime, setEditingTime] = useState<TimeOfDay | null>(null);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: TimeOfDay) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes((prev) => prev.filter((t) => t !== time));
      setEditingTime(null);
    } else {
      setSelectedTimes((prev) => [...prev, time]);
      if (!customTimes[time]) {
        setCustomTimes((prev) => ({ ...prev, [time]: getDefaultTime(time) }));
      }
    }
  };

  const updateCustomTime = (slot: TimeOfDay, value: string) => {
    // Allow typing HH:MM format
    let cleaned = value.replace(/[^0-9:]/g, "");
    if (cleaned.length === 2 && !cleaned.includes(":")) {
      cleaned = cleaned + ":";
    }
    if (cleaned.length > 5) cleaned = cleaned.slice(0, 5);
    setCustomTimes((prev) => ({ ...prev, [slot]: cleaned }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a medication name.");
      return;
    }
    if (!dosageAmount.trim()) {
      Alert.alert("Missing Dosage", "Please enter a dosage amount.");
      return;
    }
    if (selectedTimes.length === 0) {
      Alert.alert("Missing Time", "Please select at least one time of day.");
      return;
    }

    const timesOfDay: TimeSlot[] = selectedTimes.map((label) => ({
      label,
      time: customTimes[label] || getDefaultTime(label),
    }));

    const medData = {
      profileId: activeProfile.id,
      name: name.trim(),
      dosageAmount: parseFloat(dosageAmount),
      dosageUnit,
      form,
      category: "",
      frequency,
      specificDays: frequency === "specific_days" ? selectedDays : undefined,
      timesOfDay,
      instructions: instructions.trim() || undefined,
      stockCount: stockCount ? parseInt(stockCount) : undefined,
      refillAlertAt: stockCount ? 5 : undefined,
      isActive: true,
    };

    if (isEditing && existingMed) {
      await updateMedication(existingMed.id, medData);
    } else {
      await addMedication(medData);
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLow }}>
      <Header showBack onBack={() => navigation.goBack()} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Headline */}
        <View style={{ marginBottom: 48, marginTop: 24 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            {isEditing ? "Edit Entry" : "New Entry"}
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 40, fontFamily: "Manrope_800ExtraBold", lineHeight: 44, letterSpacing: -0.5 }}>
            {isEditing ? "Edit your\nmedication" : "Add your\nmedication"}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 18, fontFamily: "PlusJakartaSans_400Regular", marginTop: 16 }}>
            Let's set up your restorative routine with precision and care.
          </Text>
        </View>

        {/* Step 1: Identification */}
        <View style={{ backgroundColor: colors.surfaceContainerLow, padding: 28, borderRadius: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={{ width: 32, height: 32, borderRadius: 9999, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" }}>1</Text>
            </LinearGradient>
            <Text style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_600SemiBold" }}>Identification</Text>
          </View>

          <View style={{ gap: 20 }}>
            {/* Med Name */}
            <View>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 8, marginLeft: 4 }}>
                Medication Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Vitamin D3, Lipitor"
                placeholderTextColor={colors.outlineVariant}
                style={{ width: "100%", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: colors.onSurface }}
              />
            </View>

            {/* Dosage + Unit */}
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 8, marginLeft: 4 }}>
                  Dosage Amount
                </Text>
                <TextInput
                  value={dosageAmount}
                  onChangeText={setDosageAmount}
                  placeholder="50"
                  keyboardType="numeric"
                  placeholderTextColor={colors.outlineVariant}
                  style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: colors.onSurface }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 8, marginLeft: 4 }}>
                  Unit
                </Text>
                <TouchableOpacity
                  onPress={() => setUnitPickerOpen(!unitPickerOpen)}
                  style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: colors.onSurface }}>{dosageUnit}</Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                {unitPickerOpen && (
                  <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, marginTop: 8, overflow: "hidden", elevation: 4 }}>
                    {UNITS.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        onPress={() => { setDosageUnit(unit); setUnitPickerOpen(false); }}
                        style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: unit === dosageUnit ? colors.primaryFixed : "transparent" }}
                      >
                        <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 16, color: colors.onSurface }}>{unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {/* Form Type */}
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 8, marginLeft: 4 }}>
                  Form
                </Text>
                <TouchableOpacity
                  onPress={() => setFormPickerOpen(!formPickerOpen)}
                  style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: colors.onSurface }}>{form}</Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                {formPickerOpen && (
                  <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, marginTop: 8, overflow: "hidden", elevation: 4 }}>
                    {["Tablet", "Capsule", "Softgel", "Liquid", "Drops", "Injection"].map((f) => (
                      <TouchableOpacity
                        key={f}
                        onPress={() => { setForm(f); setFormPickerOpen(false); }}
                        style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: f === form ? colors.primaryFixed : "transparent" }}
                      >
                        <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 16, color: colors.onSurface }}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 8, marginLeft: 4 }}>
                  Stock (pills)
                </Text>
                <TextInput
                  value={stockCount}
                  onChangeText={setStockCount}
                  placeholder="e.g. 30"
                  keyboardType="numeric"
                  placeholderTextColor={colors.outlineVariant}
                  style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: colors.onSurface }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Step 2: Scheduling */}
        <View style={{ backgroundColor: colors.surfaceContainerLow, padding: 28, borderRadius: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={{ width: 32, height: 32, borderRadius: 9999, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" }}>2</Text>
            </LinearGradient>
            <Text style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_600SemiBold" }}>Scheduling</Text>
          </View>

          <View style={{ gap: 24 }}>
            {/* Frequency */}
            <View>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 12, marginLeft: 4 }}>
                Frequency
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {(["daily", "specific_days"] as FrequencyType[]).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFrequency(f)}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 16,
                      borderRadius: 9999,
                      borderWidth: 2,
                      borderColor: frequency === f ? colors.primary : "transparent",
                      backgroundColor: frequency === f ? "rgba(0, 88, 188, 0.05)" : colors.surfaceContainerHighest,
                    }}
                  >
                    <MaterialIcons
                      name={f === "daily" ? "event-repeat" : "calendar-month"}
                      size={20}
                      color={frequency === f ? colors.primary : colors.onSurfaceVariant}
                    />
                    <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", color: frequency === f ? colors.primary : colors.onSurfaceVariant }}>
                      {f === "daily" ? "Daily" : "Specific Days"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Specific Days Selector */}
            {frequency === "specific_days" && (
              <View>
                <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 12, marginLeft: 4 }}>
                  Select Days
                </Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => {
                    const isSelected = selectedDays.includes(index);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleDay(index)}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          borderRadius: 9999,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isSelected ? colors.primary : colors.surfaceContainerHighest,
                        }}
                      >
                        <Text style={{
                          fontSize: 13,
                          fontFamily: "PlusJakartaSans_700Bold",
                          color: isSelected ? "#fff" : colors.onSurfaceVariant,
                        }}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Time of Day */}
            <View>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 12, marginLeft: 4 }}>
                Time of Day
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {TIME_OPTIONS.map((opt) => {
                  const isSelected = selectedTimes.includes(opt.label);
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      onPress={() => toggleTime(opt.label)}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 16,
                        borderRadius: 16,
                        gap: 8,
                        backgroundColor: colors.surfaceContainerLowest,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : "transparent",
                      }}
                    >
                      <MaterialIcons name={opt.icon} size={24} color={isSelected ? colors.primary : colors.secondary} />
                      <Text style={{ fontSize: 9, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 0.5, color: isSelected ? colors.primary : colors.onSurface }} numberOfLines={1}>
                        {opt.display}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom time inputs for selected times */}
              {selectedTimes.length > 0 && (
                <View style={{ marginTop: 16, gap: 12 }}>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", marginLeft: 4 }}>
                    Set exact times (tap to edit)
                  </Text>
                  {selectedTimes.map((slot) => {
                    const timeVal = customTimes[slot] || getDefaultTime(slot);
                    const isEditing = editingTime === slot;
                    return (
                      <View
                        key={slot}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingHorizontal: 20,
                          paddingVertical: 14,
                          backgroundColor: isEditing ? colors.surfaceContainerLowest : colors.surfaceContainerHigh,
                          borderRadius: 16,
                          borderWidth: isEditing ? 2 : 0,
                          borderColor: isEditing ? colors.primary : "transparent",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                          <MaterialIcons
                            name="schedule"
                            size={20}
                            color={colors.primary}
                          />
                          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", color: colors.onSurface, textTransform: "capitalize" }}>
                            {slot}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setEditingTime(isEditing ? null : slot)}
                        >
                          {isEditing ? (
                            <TextInput
                              value={timeVal}
                              onChangeText={(v) => updateCustomTime(slot, v)}
                              keyboardType="numeric"
                              placeholder="HH:MM"
                              autoFocus
                              onBlur={() => setEditingTime(null)}
                              style={{
                                fontSize: 18,
                                fontFamily: "Manrope_700Bold",
                                color: colors.primary,
                                textAlign: "right",
                                minWidth: 70,
                                padding: 0,
                              }}
                            />
                          ) : (
                            <Text style={{ fontSize: 18, fontFamily: "Manrope_700Bold", color: colors.primary }}>
                              {formatTime(timeVal)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            padding: 28,
            borderRadius: 24,
            marginBottom: 24,
            shadowColor: colors.onSurface,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.04,
            shadowRadius: 32,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
            <View style={{ padding: 12, borderRadius: 9999, backgroundColor: "rgba(0, 107, 39, 0.1)" }}>
              <MaterialIcons name="notes" size={24} color={colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 8 }}>
                Instructions (Optional)
              </Text>
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g. Take with food, avoid caffeine..."
                placeholderTextColor={colors.outlineVariant}
                multiline
                numberOfLines={3}
                style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: colors.onSurface, textAlignVertical: "top" }}
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ paddingTop: 16, paddingBottom: 32 }}>
          <PillButton title={isEditing ? "Update Medication" : "Save Medication"} onPress={handleSave} />
          <View style={{ marginTop: 8 }}>
            <PillButton title="Discard Draft" variant="text" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
