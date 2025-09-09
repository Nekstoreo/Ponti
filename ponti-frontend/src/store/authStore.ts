import { create } from "zustand";
import { UserProfile } from "@/data/types";

interface AuthState {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  userProfile: UserProfile | null;
  loginSuccess: (profile: UserProfile, isFirst: boolean) => void;
  logout: () => void;
  dismissFirstLogin: () => void;
}

const FIRST_LOGIN_KEY = "ponti:firstLoginDone";

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isFirstLogin: typeof window !== "undefined" ? localStorage.getItem(FIRST_LOGIN_KEY) !== "true" : false,
  userProfile: null,
  loginSuccess: (profile, isFirst) => {
    const shouldShow = isFirst && (typeof window === "undefined" ? true : localStorage.getItem(FIRST_LOGIN_KEY) !== "true");
    set({ isAuthenticated: true, userProfile: profile, isFirstLogin: shouldShow });
  },
  logout: () => {
    set({ isAuthenticated: false, userProfile: null });
  },
  dismissFirstLogin: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FIRST_LOGIN_KEY, "true");
    }
    set({ isFirstLogin: false });
  },
}));


