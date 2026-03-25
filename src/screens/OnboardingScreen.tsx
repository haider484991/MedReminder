import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";
import { updateProfile } from "../data/profile";
import { updateFamilyProfile } from "../data/familyProfiles";
import { useActiveProfile } from "../data/ProfileContext";

const { width } = Dimensions.get("window");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoImage = require("../../assets/icon.png");

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: "favorite" as const,
    useLogo: true,
    title: "Welcome to\nDoseWise",
    subtitle: "Your personal medication companion. Simple, reliable, and beautiful.\n\nNote: DoseWise is not a medical device. Always consult your healthcare professional.",
    color: colors.primary,
  },
  {
    icon: "notifications-active" as const,
    title: "Never Miss\na Dose",
    subtitle: "Smart reminders that work even when your phone is on silent. We've got your back.",
    color: colors.tertiary,
  },
  {
    icon: "people" as const,
    title: "Care for\nYour Family",
    subtitle: "Track medications for yourself, parents, grandparents — everyone you love.",
    color: "#8b5cf6",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingProps) {
  const insets = useSafeAreaInsets();
  const { activeProfile, refreshProfiles } = useActiveProfile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1 });
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowNameInput(true);
    }
  };

  const handleFinish = async () => {
    const userName = name.trim() || "Me";
    await updateFamilyProfile(activeProfile.id, { name: userName });
    await updateProfile({ name: userName });
    await refreshProfiles();
    onComplete();
  };

  if (showNameInput) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: "center" }}>
          <View style={{
            width: 64, height: 64, borderRadius: 16, marginBottom: 32,
          }}>
            <Image source={logoImage} style={{ width: 64, height: 64, borderRadius: 16 }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 36, fontFamily: "Manrope_800ExtraBold", color: colors.onSurface, letterSpacing: -0.5, marginBottom: 12 }}>
            What's your{"\n"}name?
          </Text>
          <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSans_400Regular", color: colors.onSurfaceVariant, marginBottom: 40, lineHeight: 24 }}>
            We'll use this to personalize your experience. You can always change it later.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.outlineVariant}
            autoFocus
            style={{
              fontSize: 20,
              fontFamily: "PlusJakartaSans_600SemiBold",
              color: colors.onSurface,
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: 20,
              paddingHorizontal: 24,
              paddingVertical: 20,
              marginBottom: 32,
            }}
          />
          <TouchableOpacity onPress={handleFinish} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 9999, paddingVertical: 20, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Manrope_700Bold" }}>
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFinish} style={{ marginTop: 16, paddingVertical: 12 }}>
            <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", fontSize: 15, fontFamily: "PlusJakartaSans_500Medium" }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1, paddingHorizontal: 32, justifyContent: "center", paddingTop: insets.top + 60 }}>
            {(item as any).useLogo ? (
              <Image
                source={logoImage}
                style={{
                  width: 80, height: 80, borderRadius: 20, marginBottom: 40,
                  shadowColor: item.color, shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3, shadowRadius: 20,
                }}
                resizeMode="contain"
              />
            ) : (
              <View style={{
                width: 80, height: 80, borderRadius: 24,
                backgroundColor: item.color, alignItems: "center", justifyContent: "center",
                marginBottom: 40, shadowColor: item.color, shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
              }}>
                <MaterialIcons name={item.icon} size={40} color="#fff" />
              </View>
            )}
            <Text style={{ fontSize: 42, fontFamily: "Manrope_800ExtraBold", color: colors.onSurface, letterSpacing: -1, lineHeight: 48, marginBottom: 20 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 17, fontFamily: "PlusJakartaSans_400Regular", color: colors.onSurfaceVariant, lineHeight: 26 }}>
              {item.subtitle}
            </Text>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
      />

      {/* Bottom area */}
      <View style={{ paddingHorizontal: 32, paddingBottom: insets.bottom + 32 }}>
        {/* Dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: currentSlide === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentSlide === i ? colors.primary : colors.outlineVariant,
              }}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 9999, paddingVertical: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Manrope_700Bold" }}>
              {currentSlide === SLIDES.length - 1 ? "Let's Go" : "Next"}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => setShowNameInput(true)} style={{ marginTop: 16, paddingVertical: 12 }}>
            <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", fontSize: 15, fontFamily: "PlusJakartaSans_500Medium" }}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
