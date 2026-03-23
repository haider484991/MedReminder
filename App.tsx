import React, { useCallback, useEffect, useState } from "react";
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
import { getMedications } from "./src/data/medications";
import "./global.css";

const ONBOARDING_KEY = "@dosely/onboarding_complete";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        // Check if onboarding is complete
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!onboardingDone) {
          setShowOnboarding(true);
        }

        // Init notifications
        const notifService = await import("./src/services/notifications");
        await notifService.requestNotificationPermissions();
        const meds = await getMedications();
        await notifService.scheduleAllMedications(meds);
      } catch (e) {
        console.warn("App init:", e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
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
          <StatusBar barStyle="dark-content" backgroundColor="#f9f9ff" />
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
