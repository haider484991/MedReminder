/**
 * DoseWise Color System
 * Derived from logo: Steel Blue (#6A9ECB) + Coral Orange (#E8734A)
 */
export const colors = {
  // Primary — Steel Blue (left pill)
  primary: "#5B8FB9",
  primaryContainer: "#7BAFD4",
  primaryFixed: "#D6E6F5",
  primaryFixedDim: "#A3C7E2",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#f0f7ff",

  // Secondary — Coral Orange (right pill / accent)
  secondary: "#E8734A",
  secondaryContainer: "#F09A7A",
  secondaryFixed: "#FDDDD1",
  onSecondary: "#ffffff",

  // Tertiary — Success green (kept for dose-taken states)
  tertiary: "#2E9E5E",
  tertiaryContainer: "#37B86D",
  tertiaryFixed: "#C8F5D8",
  tertiaryFixedDim: "#6ED898",
  onTertiary: "#ffffff",
  onTertiaryContainer: "#f0fff5",

  // Error
  error: "#D64045",
  errorContainer: "#FFE0E1",
  onError: "#ffffff",
  onErrorContainer: "#8C1D20",

  // Surfaces — Warm neutral tint
  surface: "#F8F9FC",
  surfaceDim: "#D8DAE2",
  surfaceBright: "#F8F9FC",
  surfaceContainer: "#EEF0F6",
  surfaceContainerLow: "#F2F4F9",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#E6E8F0",
  surfaceContainerHighest: "#DFE1EA",
  surfaceVariant: "#DFE1EA",

  // Text
  onSurface: "#1A1D24",
  onSurfaceVariant: "#454B5C",
  onBackground: "#1A1D24",
  background: "#F8F9FC",

  // Outlines
  outline: "#6E7587",
  outlineVariant: "#BFC4D4",

  // Inverse
  inverseSurface: "#2C2F38",
  inverseOnSurface: "#EEF0F8",
  inversePrimary: "#A3C7E2",
} as const;
