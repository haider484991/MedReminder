import React from "react";
import { View } from "react-native";
import { colors } from "../theme";

interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <View style={{ height: 12, width: "100%", backgroundColor: colors.primaryFixed, borderRadius: 9999, overflow: "hidden" }}>
      <View
        style={{ height: "100%", backgroundColor: colors.primary, borderRadius: 9999, width: `${Math.min(100, percentage)}%` }}
      />
    </View>
  );
}
