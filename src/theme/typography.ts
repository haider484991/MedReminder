import { Platform } from "react-native";

export const fonts = {
  headline: Platform.select({
    ios: "Manrope",
    android: "Manrope",
    default: "Manrope",
  }) as string,
  body: Platform.select({
    ios: "PlusJakartaSans",
    android: "PlusJakartaSans",
    default: "PlusJakartaSans",
  }) as string,
};

export const fontSizes = {
  displayLg: 56,
  displayMd: 44,
  displaySm: 36,
  headlineLg: 32,
  headlineMd: 28,
  headlineSm: 24,
  titleLg: 22,
  titleMd: 16,
  titleSm: 14,
  bodyLg: 16,
  bodyMd: 14,
  bodySm: 12,
  labelLg: 14,
  labelMd: 12,
  labelSm: 10,
} as const;
