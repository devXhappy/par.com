import { useAuth } from "@/contexts/AuthContext";

export const useOnboardingGuard = () => {
  const { profile } = useAuth(); // ✅ c'est ça ton user enrichi

  if (profile?.type === "professional" && profile.onboardingStatus !== "completed") {
    return {
      shouldShowOnboarding: true,
      currentStatus: profile.onboardingStatus,
      canAccessApp: false,
    };
  }

  return { shouldShowOnboarding: false, canAccessApp: true };
};
