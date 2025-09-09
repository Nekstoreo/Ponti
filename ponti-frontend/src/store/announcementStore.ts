import { create } from "zustand";
import { AnnouncementItem } from "@/data/types";

interface AnnouncementState {
  announcements: AnnouncementItem[];
  setAnnouncements: (items: AnnouncementItem[]) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  setAnnouncements: (items) => set({ announcements: items }),
}));


