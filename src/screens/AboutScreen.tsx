import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";

// Update these URLs after hosting on GitHub Pages
const PRIVACY_URL = "https://haider484991.github.io/MedReminder/privacy-policy.html";
const TERMS_URL = "https://haider484991.github.io/MedReminder/terms-of-service.html";

export function AboutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={{
        width: "100%", backgroundColor: colors.surface, paddingHorizontal: 24, paddingBottom: 12,
        paddingTop: insets.top + 8, flexDirection: "row", alignItems: "center", gap: 12,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, borderRadius: 9999 }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={{ color: colors.primary, fontSize: 20, fontFamily: "Manrope_700Bold" }}>About DoseWise</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
            <View style={{ width: 72, height: 72, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
              <MaterialIcons name="favorite" size={36} color="#fff" />
            </View>
          </View>
          <Text style={{ fontSize: 28, fontFamily: "Manrope_800ExtraBold", color: colors.onSurface }}>DoseWise</Text>
          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", color: colors.onSurfaceVariant, marginTop: 4 }}>
            Version 1.0.0 (Build 1)
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", color: colors.onSurfaceVariant, marginTop: 2 }}>
            Medication Reminder & Tracker
          </Text>
        </View>

        {/* Medical Disclaimer */}
        <View style={{
          backgroundColor: colors.secondaryFixed, borderRadius: 20, padding: 20, marginBottom: 24,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <MaterialIcons name="medical-services" size={20} color={colors.secondary} />
            <Text style={{ fontSize: 16, fontFamily: "Manrope_700Bold", color: colors.onSurface }}>Medical Disclaimer</Text>
          </View>
          <Text style={{ fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", color: colors.onSurfaceVariant, lineHeight: 22 }}>
            DoseWise is not a medical device and does not diagnose, treat, cure, or prevent any medical condition. This app is intended solely as a reminder and organizational tool.{"\n\n"}Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment. Do not rely solely on this app for critical medication management.
          </Text>
        </View>

        {/* Links */}
        <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, overflow: "hidden", marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => openLink(PRIVACY_URL)}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <MaterialIcons name="privacy-tip" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: colors.onSurface }}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="open-in-new" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openLink(TERMS_URL)}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderTopWidth: 1, borderTopColor: `${colors.outlineVariant}20` }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <MaterialIcons name="description" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: colors.onSurface }}>Terms of Service</Text>
            </View>
            <MaterialIcons name="open-in-new" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openLink("mailto:haider484991@gmail.com")}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderTopWidth: 1, borderTopColor: `${colors.outlineVariant}20` }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <MaterialIcons name="email" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: colors.onSurface }}>Contact Support</Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Healthcare Reminder */}
        <View style={{ backgroundColor: colors.primaryFixed, borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", color: colors.primary, lineHeight: 20 }}>
            Always consult your healthcare professional before starting, stopping, or changing any medication. DoseWise is designed to help you remember — your doctor is the expert.
          </Text>
        </View>

        <Text style={{ textAlign: "center", fontSize: 12, color: colors.onSurfaceVariant, opacity: 0.6, fontFamily: "PlusJakartaSans_400Regular" }}>
          Made with care for your health.{"\n"}© 2026 DoseWise. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}
