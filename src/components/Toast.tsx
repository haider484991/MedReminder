import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info";
  onHide: () => void;
  duration?: number;
}

const ICONS: Record<string, { name: keyof typeof MaterialIcons.glyphMap; color: string; bg: string }> = {
  success: { name: "check-circle", color: colors.tertiary, bg: "rgba(0, 107, 39, 0.1)" },
  error: { name: "error", color: colors.error, bg: "rgba(186, 26, 26, 0.1)" },
  info: { name: "info", color: colors.primary, bg: "rgba(0, 88, 188, 0.1)" },
};

export function Toast({ message, visible, type = "success", onHide, duration = 2000 }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const icon = ICONS[type];

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 12,
        left: 24,
        right: 24,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
      }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: icon.bg, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcons name={icon.name} size={20} color={icon.color} />
        </View>
        <Text style={{ flex: 1, color: colors.onSurface, fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
