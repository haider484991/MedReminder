import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, WeekCalendar, ProgressBar } from "../components";
import { colors } from "../theme";
import { getMedications } from "../data/medications";
import { getAdherenceRate } from "../data/doseLogs";
import { getUpcomingDoses, getDailyProgress } from "../data/scheduler";
import { formatTime } from "../utils/dates";
import { useActiveProfile } from "../data/ProfileContext";
import type { RootStackParamList } from "../navigation/types";
import type { Medication, UpcomingDose } from "../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FORM_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Tablet: "medication",
  Capsule: "medication",
  Pill: "circle",
  Softgel: "water-drop",
  Liquid: "water-drop",
  default: "medication",
};

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { activeProfile } = useActiveProfile();
  const profileId = activeProfile.id;
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doses, setDoses] = useState<UpcomingDose[]>([]);
  const [adherenceRate, setAdherenceRate] = useState(0);

  const loadData = useCallback(async () => {
    const meds = await getMedications(profileId);
    setMedications(meds);
    const upcomingDoses = await getUpcomingDoses(meds, selectedDate, profileId);
    setDoses(upcomingDoses);
    const rate = await getAdherenceRate(undefined, 7, profileId);
    setAdherenceRate(rate);
  }, [selectedDate, profileId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  // Group doses by medication for the schedule view
  const medMap = new Map<string, { med: Medication; doses: UpcomingDose[] }>();
  for (const dose of doses) {
    const existing = medMap.get(dose.medication.id);
    if (existing) {
      existing.doses.push(dose);
    } else {
      medMap.set(dose.medication.id, { med: dose.medication, doses: [dose] });
    }
  }
  const activeMeds = Array.from(medMap.values());

  const progress = getDailyProgress(doses);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ marginTop: 32, marginBottom: 32, gap: 8 }}>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontFamily: "Manrope_600SemiBold",
            }}
          >
            Today's Focus
          </Text>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 36,
              letterSpacing: -0.5,
              fontFamily: "Manrope_800ExtraBold",
            }}
          >
            Your Routine
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 18,
              fontFamily: "PlusJakartaSans_400Regular",
            }}
          >
            Maintaining {adherenceRate}% adherence this week.
          </Text>
        </View>

        {/* Calendar */}
        <View style={{ marginBottom: 48 }}>
          <WeekCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
          />
        </View>

        {/* Active Medications */}
        <View style={{ gap: 24, marginBottom: 48 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: colors.onSurface,
                fontSize: 20,
                fontFamily: "Manrope_700Bold",
              }}
            >
              Active Medications
            </Text>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: colors.secondaryFixed,
                borderRadius: 9999,
              }}
            >
              <Text
                style={{
                  color: colors.onSurface,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  fontFamily: "PlusJakartaSans_700Bold",
                }}
              >
                {activeMeds.length} Total
              </Text>
            </View>
          </View>

          <View style={{ gap: 16 }}>
            {activeMeds.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surfaceContainerLowest,
                  borderRadius: 24,
                  padding: 32,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontSize: 16,
                    textAlign: "center",
                    fontFamily: "PlusJakartaSans_500Medium",
                  }}
                >
                  No medications scheduled for this day.
                </Text>
              </View>
            ) : (
              activeMeds.map(({ med, doses: medDoses }) => {
                const allTaken = medDoses.every((d) => d.status === "taken");
                const nextDose = medDoses.find((d) => d.status === "pending");
                const iconName = FORM_ICONS[med.form] || FORM_ICONS.default;

                return (
                  <TouchableOpacity
                    key={med.id}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("MedicationDetail", {
                        medicationId: med.id,
                      })
                    }
                    style={{
                      borderRadius: 24,
                      padding: 24,
                      backgroundColor: allTaken
                        ? "#f0f9f4"
                        : colors.surfaceContainerLowest,
                      borderWidth: allTaken ? 1 : 0,
                      borderColor: allTaken
                        ? "rgba(55, 184, 109, 0.1)"
                        : "transparent",
                      shadowColor: allTaken ? "transparent" : colors.onSurface,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.06,
                      shadowRadius: 32,
                      elevation: allTaken ? 0 : 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 24,
                      }}
                    >
                      <View style={{ gap: 4 }}>
                        <Text
                          style={{
                            color: colors.onSurface,
                            fontSize: 24,
                            fontFamily: "Manrope_700Bold",
                          }}
                        >
                          {med.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <MaterialIcons
                            name={iconName}
                            size={18}
                            color={colors.onSurfaceVariant}
                          />
                          <Text
                            style={{
                              color: colors.onSurfaceVariant,
                              fontFamily: "PlusJakartaSans_400Regular",
                            }}
                          >
                            {med.dosageAmount}
                            {med.dosageUnit} {med.form}
                          </Text>
                        </View>
                      </View>
                      {allTaken ? (
                        <View
                          style={{
                            backgroundColor: colors.tertiaryContainer,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 9999,
                          }}
                        >
                          <MaterialIcons
                            name="check-circle"
                            size={14}
                            color="#fff"
                          />
                          <Text
                            style={{
                              color: "#ffffff",
                              fontSize: 12,
                              fontFamily: "PlusJakartaSans_700Bold",
                            }}
                          >
                            Taken Today
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 9999,
                            backgroundColor: colors.primaryFixed,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: "PlusJakartaSans_700Bold",
                              color: colors.primary,
                            }}
                          >
                            {medDoses[0]?.timeSlot.label
                              ? medDoses[0].timeSlot.label.charAt(0).toUpperCase() +
                                medDoses[0].timeSlot.label.slice(1)
                              : "Scheduled"}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: allTaken
                          ? "rgba(55, 184, 109, 0.1)"
                          : "rgba(191, 196, 212, 0.1)",
                      }}
                    >
                      <View style={{ gap: 4 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 2,
                            fontFamily: "PlusJakartaSans_700Bold",
                            color: allTaken ? colors.tertiary : colors.outline,
                          }}
                        >
                          Frequency
                        </Text>
                        <Text
                          style={{
                            color: colors.onSurface,
                            fontFamily: "PlusJakartaSans_600SemiBold",
                          }}
                        >
                          {med.frequency === "daily" ? "Daily" : "Specific days"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 2,
                            fontFamily: "PlusJakartaSans_700Bold",
                            color: allTaken ? colors.tertiary : colors.outline,
                          }}
                        >
                          {allTaken ? "Status" : "Next Dose"}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "PlusJakartaSans_600SemiBold",
                            color: allTaken
                              ? colors.tertiary
                              : colors.primary,
                          }}
                        >
                          {allTaken
                            ? "Completed"
                            : nextDose
                            ? formatTime(nextDose.timeSlot.time || "08:00")
                            : "Done"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Weekly Progress */}
        <View
          style={{
            backgroundColor: colors.surfaceContainerHigh,
            padding: 24,
            borderRadius: 24,
            gap: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.onSurface,
                fontSize: 18,
                fontFamily: "Manrope_700Bold",
              }}
            >
              Weekly Progress
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Manrope_700Bold",
              }}
            >
              {adherenceRate}%
            </Text>
          </View>
          <ProgressBar percentage={adherenceRate} />
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 14,
              fontFamily: "PlusJakartaSans_400Regular",
            }}
          >
            {adherenceRate >= 90
              ? "Excellent adherence! Keep it up!"
              : adherenceRate >= 70
              ? "Good progress. Stay consistent!"
              : "Let's work on building your routine."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
