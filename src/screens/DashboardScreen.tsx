import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Header, ProgressCircle, DoseCard } from "../components";
import { colors } from "../theme";
import { getMedications } from "../data/medications";
import { logDose } from "../data/doseLogs";
import { getUpcomingDoses, getDailyProgress } from "../data/scheduler";
import { useActiveProfile } from "../data/ProfileContext";
import { getGreeting, getTodayDateLabel } from "../utils/dates";
import type { RootStackParamList } from "../navigation/types";
import type { Medication, UpcomingDose } from "../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { activeProfile } = useActiveProfile();
  const [doses, setDoses] = useState<UpcomingDose[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lowStockMed, setLowStockMed] = useState<Medication | null>(null);

  const profileId = activeProfile.id;
  const userName = activeProfile.name;

  const loadData = useCallback(async () => {
    const meds = await getMedications(profileId);

    const today = new Date();
    const upcomingDoses = await getUpcomingDoses(meds, today, profileId);
    setDoses(upcomingDoses);

    const low = meds.find(
      (m) =>
        m.stockCount !== undefined &&
        m.refillAlertAt !== undefined &&
        m.stockCount <= m.refillAlertAt
    );
    setLowStockMed(low || null);
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTake = async (dose: UpcomingDose) => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    await logDose(profileId, dose.medication.id, dose.scheduledTime.toISOString(), "taken");
    await loadData();
  };

  const handleSkip = async (dose: UpcomingDose) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    await logDose(profileId, dose.medication.id, dose.scheduledTime.toISOString(), "skipped");
    await loadData();
  };

  const progress = getDailyProgress(doses);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ marginBottom: 40, marginTop: 16 }}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", marginBottom: 4 }}>
            {getTodayDateLabel()}
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 34, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.5 }}>
            {getGreeting()}, {userName}.
          </Text>
        </View>

        {/* Daily Progress */}
        <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 32, padding: 32, marginBottom: 40, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.onSurface, fontSize: 18, fontFamily: "Manrope_700Bold", marginBottom: 4 }}>
                Daily Progress
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_400Regular" }}>
                {progress.taken} of {progress.total} doses taken today
              </Text>
              <View style={{ marginTop: 16, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, backgroundColor: progress.percentage >= 50 ? colors.tertiaryContainer : colors.error }}>
                <Text style={{ color: "#fff", fontSize: 10, fontFamily: "PlusJakartaSans_700Bold", textTransform: "uppercase", letterSpacing: 1.5 }}>
                  {progress.percentage >= 50 ? "On Track" : "Behind"}
                </Text>
              </View>
            </View>
            <ProgressCircle percentage={progress.percentage} />
          </View>
        </View>

        {/* Upcoming Doses */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_700Bold" }}>
            Upcoming Doses
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Schedule" } as any)}>
            <Text style={{ color: colors.primary, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" }}>
              View Schedule
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          {doses.length === 0 ? (
            <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 40, alignItems: "center" }}>
              <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primaryFixed, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <MaterialIcons name="medication" size={36} color={colors.primary} />
              </View>
              <Text style={{ color: colors.onSurface, fontSize: 18, fontFamily: "Manrope_700Bold", marginBottom: 8, textAlign: "center" }}>
                No medications yet
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 24 }}>
                Add your first medication to start{"\n"}tracking your health routine.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Main", { screen: "Add" } as any)}
                style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 9999 }}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold" }}>
                  Add Medication
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            doses.map((dose, index) => (
              <DoseCard
                key={`${dose.medication.id}-${dose.timeSlot.label}-${index}`}
                dose={dose}
                onTake={() => handleTake(dose)}
                onSkip={() => handleSkip(dose)}
                onPress={() => navigation.navigate("MedicationDetail", { medicationId: dose.medication.id })}
              />
            ))
          )}
        </View>

        {/* Refill Reminder */}
        {lowStockMed && (
          <TouchableOpacity
            style={{ marginTop: 48, borderRadius: 32, overflow: "hidden" }}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("MedicationDetail", { medicationId: lowStockMed.id })}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24, borderRadius: 32 }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontFamily: "Manrope_700Bold", marginBottom: 8 }}>
                Refill Reminder
              </Text>
              <Text style={{ color: "rgba(216, 226, 255, 0.8)", fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", marginBottom: 16 }}>
                You have {lowStockMed.stockCount} pills of {lowStockMed.name} remaining.
              </Text>
              <View style={{ backgroundColor: "#fff", alignSelf: "flex-start", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999 }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" }}>
                  Order Refill
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
