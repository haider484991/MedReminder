import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import {
  getWeekDays,
  getDayShort,
  getMonthName,
  getWeekNumber,
  isSameDay,
} from "../utils/dates";

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeekCalendar({
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: WeekCalendarProps) {
  const weekDays = getWeekDays(selectedDate);
  const today = new Date();

  return (
    <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: 24, padding: 24, gap: 24 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          <Text
            style={{ color: colors.onSurface, fontSize: 20, fontFamily: "Manrope_700Bold" }}
          >
            {getMonthName(selectedDate)} {selectedDate.getFullYear()}
          </Text>
          <Text
            style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "PlusJakartaSans_400Regular" }}
          >
            Week {getWeekNumber(selectedDate)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onPrevWeek}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              backgroundColor: colors.surfaceContainerLowest,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.onSurface,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <MaterialIcons name="chevron-left" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onNextWeek}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              backgroundColor: colors.surfaceContainerLowest,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.onSurface,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => onSelectDate(day)}
              style={[
                { alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, gap: 8 },
                isSelected
                  ? {
                      backgroundColor: colors.primary,
                      borderRadius: 9999,
                      paddingHorizontal: 8,
                    }
                  : undefined,
              ]}
            >
              <Text
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  fontFamily: "PlusJakartaSans_700Bold",
                  color: isSelected ? "rgba(255,255,255,0.8)" : colors.outline,
                }}
              >
                {getDayShort(day)}
              </Text>
              <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontSize: 16,
                    color: isSelected ? "#fff" : colors.onSurface,
                  }}
                >
                  {day.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
