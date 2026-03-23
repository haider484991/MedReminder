import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import type { FamilyProfile } from "./types";
import { getFamilyProfiles, ensureDefaultProfile } from "./familyProfiles";
import { getProfile, updateProfile } from "./profile";
import { colors } from "../theme";

interface ProfileContextType {
  activeProfile: FamilyProfile;
  allProfiles: FamilyProfile[];
  switchProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<FamilyProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<FamilyProfile[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refreshProfiles = useCallback(async () => {
    const defaultProfile = await ensureDefaultProfile();
    const profiles = await getFamilyProfiles();
    setAllProfiles(profiles);

    const userProfile = await getProfile();
    const activeId = userProfile.activeProfileId;
    const found = profiles.find((p) => p.id === activeId);
    const active = found || defaultProfile;
    setActiveProfile(active);

    if (!found && defaultProfile) {
      await updateProfile({ activeProfileId: defaultProfile.id });
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const switchProfile = useCallback(
    async (profileId: string) => {
      await updateProfile({ activeProfileId: profileId });
      const profiles = await getFamilyProfiles();
      const found = profiles.find((p) => p.id === profileId);
      if (found) {
        setActiveProfile(found);
        setAllProfiles(profiles);
      }
    },
    []
  );

  // Block rendering until profile is loaded
  if (!isReady || !activeProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ProfileContext.Provider
      value={{ activeProfile, allProfiles, switchProfile, refreshProfiles }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useActiveProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useActiveProfile must be used within ProfileProvider");
  }
  return context;
}
