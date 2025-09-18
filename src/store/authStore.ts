import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "@/data/types";

interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  loginSuccess: (profile: UserProfile) => void;
  logout: () => void;
  completeOnboarding: () => void;
  hasCompletedOnboarding: () => boolean;
}

const ONBOARDING_COMPLETED_KEY = "ponti:onboardingCompleted";
const AUTH_STORAGE_KEY = "ponti:auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userProfile: null,
      loginSuccess: (profile: UserProfile) => {
        set({ 
          isAuthenticated: true, 
          userProfile: profile
        });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        }
        set({ isAuthenticated: false, userProfile: null });
      },
      completeOnboarding: () => {
        if (typeof window !== "undefined") {
          localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
        }
      },
      hasCompletedOnboarding: () => {
        if (typeof window !== "undefined") {
          return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
        }
        return false;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userProfile: state.userProfile,
      }),
    }
  )
);


