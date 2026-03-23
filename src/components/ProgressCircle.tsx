import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressCircle({
  percentage,
  size = 96,
  strokeWidth = 8,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text
        style={{ position: "absolute", color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_800ExtraBold" }}
      >
        {percentage}%
      </Text>
    </View>
  );
}
