import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ProfileProvider } from "./src/data/ProfileContext";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { getMedications, getMedicationById, decrementStock } from "./src/data/medications";
import { logDose } from "./src/data/doseLogs";
import { getProfile } from "./src/data/profile";
// import "./global.css"; // NativeWind disabled — using inline styles

const ONBOARDING_KEY = "@dosely/onboarding_complete";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const responseListenerRef = useRef<any>(null);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!onboardingDone) {
          setShowOnboarding(true);
        }

        // Init notifications
        const notifService = await import("./src/services/notifications");
        await notifService.requestNotificationPermissions();
        const meds = await getMedications();
        await notifService.scheduleAllMedications(meds);

        // Listen for notification action responses (Take / Snooze buttons)
        const NotifModule = notifService.getNotificationsModule();
        if (NotifModule) {
          responseListenerRef.current =
            NotifModule.addNotificationResponseReceivedListener(
              async (response) => {
                const actionId = response.actionIdentifier;
                const data = response.notification.request.content.data as {
                  medicationId?: string;
                  timeSlot?: string;
                };

                if (!data.medicationId) return;

                const med = await getMedicationById(data.medicationId);
                if (!med) return;

                const profile = await getProfile();
                const now = new Date().toISOString();

                if (actionId === "TAKE") {
                  // Mark dose as taken from notification
                  await logDose(profile.activeProfileId, med.id, now, "taken");
                  if (med.stockCount !== undefined) {
                    await decrementStock(med.id);
                  }
                } else if (actionId === "SNOOZE") {
                  // Schedule a 15-minute snooze
                  await notifService.scheduleSnooze(med, data.timeSlot || "");
                }
                // Default tap (no action button) just opens the app
              }
            );
        }
      } catch (e) {
        console.warn("App init:", e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    return () => {
      if (responseListenerRef.current) {
        try {
          responseListenerRef.current.remove();
        } catch {}
      }
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
          {showOnboarding ? (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          ) : (
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          )}
        </View>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
