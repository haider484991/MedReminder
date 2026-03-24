import * as Device from "expo-device";
import { Platform, AppState } from "react-native";
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
      priority: Notifications!.AndroidNotificationPriority.MAX,
    }),
  });
} catch (e) {
  console.warn("expo-notifications not available (Expo Go):", e);
}

/** Returns true if notifications are available (not in Expo Go) */
export function isNotificationsAvailable(): boolean {
  return Notifications !== null;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    if (!Device.isDevice) return false;

    if (Platform.OS === "android") {
      // Create HIGH importance channel — this makes notifications behave like alarms
      await Notifications.setNotificationChannelAsync("medication-reminders", {
        name: "Medication Reminders",
        description: "Alarm-style reminders for your scheduled medications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
        lightColor: "#5B8FB9",
        sound: "default",
        enableVibrate: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });

      // Set up notification action buttons
      await Notifications.setNotificationCategoryAsync("medication-action", [
        {
          identifier: "TAKE",
          buttonTitle: "Take Now ✓",
          options: { opensAppToForeground: false },
        },
        {
          identifier: "SNOOZE",
          buttonTitle: "Snooze 15min",
          options: { opensAppToForeground: false },
        },
      ]);
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (e) {
    console.warn("Notification permissions error:", e);
    return false;
  }
}

/**
 * Schedule notifications for a single medication.
 * Call this after adding or editing a medication.
 */
export async function scheduleMedicationNotifications(
  medication: Medication
): Promise<void> {
  if (!Notifications) return;
  try {
    // Cancel existing notifications for this med first
    await cancelMedicationNotifications(medication.id);
    if (!medication.isActive) return;

    for (const timeSlot of medication.timesOfDay) {
      const time = timeSlot.time || getDefaultTime(timeSlot.label);
      const [hours, minutes] = time.split(":").map(Number);

      const content = {
        title: `💊 Time for ${medication.name}`,
        body: `${medication.dosageAmount}${medication.dosageUnit} ${medication.form}${
          medication.instructions ? ` • ${medication.instructions}` : ""
        }`,
        data: {
          medicationId: medication.id,
          timeSlot: timeSlot.label,
          type: "medication-reminder",
        },
        categoryIdentifier: "medication-action",
        sound: "default" as const,
        sticky: true, // Persistent until dismissed
      };

      if (medication.frequency === "daily") {
        await Notifications.scheduleNotificationAsync({
          content,
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
            content,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: weekday + 1, // expo: 1=Sun, 7=Sat
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

/**
 * Schedule a snooze notification — fires once in 15 minutes
 */
export async function scheduleSnooze(
  medication: Medication,
  timeSlotLabel: string
): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Reminder: ${medication.name}`,
        body: `Snoozed reminder — ${medication.dosageAmount}${medication.dosageUnit} ${medication.form}`,
        data: {
          medicationId: medication.id,
          timeSlot: timeSlotLabel,
          type: "snooze-reminder",
        },
        categoryIdentifier: "medication-action",
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 15 * 60, // 15 minutes
        channelId: "medication-reminders",
      },
      identifier: `${medication.id}-snooze-${Date.now()}`,
    });
  } catch (e) {
    console.warn("Snooze error:", e);
  }
}

export async function cancelMedicationNotifications(
  medicationId: string
): Promise<void> {
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
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

/**
 * Get the expo-notifications module for setting up response listeners.
 * Returns null in Expo Go.
 */
export function getNotificationsModule() {
  return Notifications;
}

/**
 * Get count of currently scheduled notifications (for debugging)
 */
export async function getScheduledCount(): Promise<number> {
  if (!Notifications) return 0;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch {
    return 0;
  }
}
