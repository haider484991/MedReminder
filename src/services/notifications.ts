import * as Device from "expo-device";
import { Platform } from "react-native";
import type { Medication } from "../data/types";
import { getDefaultTime } from "../data/scheduler";

let Notifications: typeof import("expo-notifications") | null = null;

try {
  Notifications = require("expo-notifications");
  Notifications!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority:
        Notifications!.AndroidNotificationPriority.MAX,
    }),
  });
} catch (e) {
  console.warn("expo-notifications not available (Expo Go):", e);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    if (!Device.isDevice) return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("medication-reminders", {
        name: "Medication Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0058bc",
        sound: "default",
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (e) {
    console.warn("Notification permissions error:", e);
    return false;
  }
}

export async function scheduleMedicationNotifications(
  medication: Medication
): Promise<void> {
  if (!Notifications) return;
  try {
    await cancelMedicationNotifications(medication.id);
    if (!medication.isActive) return;

    for (const timeSlot of medication.timesOfDay) {
      const time = timeSlot.time || getDefaultTime(timeSlot.label);
      const [hours, minutes] = time.split(":").map(Number);

      if (medication.frequency === "daily") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${medication.name}`,
            body: `${medication.dosageAmount}${medication.dosageUnit}${
              medication.instructions
                ? ` \u2022 ${medication.instructions}`
                : ""
            }`,
            data: { medicationId: medication.id, timeSlot: timeSlot.label },
            categoryIdentifier: "medication-action",
            sound: "default",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hours,
            minute: minutes,
            channelId: "medication-reminders",
          },
          identifier: `${medication.id}-${timeSlot.label}`,
        });
      } else if (
        medication.frequency === "specific_days" &&
        medication.specificDays
      ) {
        for (const weekday of medication.specificDays) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Time for ${medication.name}`,
              body: `${medication.dosageAmount}${medication.dosageUnit}${
                medication.instructions
                  ? ` \u2022 ${medication.instructions}`
                  : ""
              }`,
              data: {
                medicationId: medication.id,
                timeSlot: timeSlot.label,
              },
              categoryIdentifier: "medication-action",
              sound: "default",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: weekday + 1,
              hour: hours,
              minute: minutes,
              channelId: "medication-reminders",
            },
            identifier: `${medication.id}-${timeSlot.label}-${weekday}`,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Schedule notification error:", e);
  }
}

export async function cancelMedicationNotifications(
  medicationId: string
): Promise<void> {
  if (!Notifications) return;
  try {
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith(medicationId)) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
  } catch (e) {
    console.warn("Cancel notification error:", e);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn("Cancel all notifications error:", e);
  }
}

export async function scheduleAllMedications(
  medications: Medication[]
): Promise<void> {
  if (!Notifications) return;
  try {
    await cancelAllNotifications();
    for (const med of medications) {
      await scheduleMedicationNotifications(med);
    }
  } catch (e) {
    console.warn("Schedule all medications error:", e);
  }
}
