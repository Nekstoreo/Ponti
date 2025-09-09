import { create } from "zustand";
import { AnnouncementItem, AnnouncementCategory } from "@/data/types";

interface AnnouncementState {
  announcements: AnnouncementItem[];
  filteredAnnouncements: AnnouncementItem[];
  searchQuery: string;
  selectedCategory: AnnouncementCategory | "all";
  showOnlyUnread: boolean;
  showOnlyImportant: boolean;
  setAnnouncements: (items: AnnouncementItem[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: AnnouncementCategory | "all") => void;
  toggleUnreadFilter: () => void;
  toggleImportantFilter: () => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  getAnnouncementById: (id: string) => AnnouncementItem | undefined;
  updateFilteredAnnouncements: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  announcements: [],
  filteredAnnouncements: [],
  searchQuery: "",
  selectedCategory: "all",
  showOnlyUnread: false,
  showOnlyImportant: false,

  setAnnouncements: (items) => {
    set({ announcements: items });
    get().updateFilteredAnnouncements();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().updateFilteredAnnouncements();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().updateFilteredAnnouncements();
  },

  toggleUnreadFilter: () => {
    set((state) => ({ showOnlyUnread: !state.showOnlyUnread }));
    get().updateFilteredAnnouncements();
  },

  toggleImportantFilter: () => {
    set((state) => ({ showOnlyImportant: !state.showOnlyImportant }));
    get().updateFilteredAnnouncements();
  },

  markAsRead: (id) => {
    set((state) => ({
      announcements: state.announcements.map((announcement) =>
        announcement.id === id
          ? { ...announcement, isRead: true }
          : announcement
      ),
    }));
    get().updateFilteredAnnouncements();
  },

  markAsUnread: (id) => {
    set((state) => ({
      announcements: state.announcements.map((announcement) =>
        announcement.id === id
          ? { ...announcement, isRead: false }
          : announcement
      ),
    }));
    get().updateFilteredAnnouncements();
  },

  markAllAsRead: () => {
    set((state) => ({
      announcements: state.announcements.map((announcement) => ({
        ...announcement,
        isRead: true,
      })),
    }));
    get().updateFilteredAnnouncements();
  },

  getAnnouncementById: (id) => {
    return get().announcements.find((announcement) => announcement.id === id);
  },

  updateFilteredAnnouncements: () => {
    const { announcements, searchQuery, selectedCategory, showOnlyUnread, showOnlyImportant } = get();

    let filtered = announcements;

    // Aplicar filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter((announcement) =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (announcement.tags && announcement.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    // Aplicar filtro de categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter((announcement) => announcement.category === selectedCategory);
    }

    // Aplicar filtro de no leídos
    if (showOnlyUnread) {
      filtered = filtered.filter((announcement) => !announcement.isRead);
    }

    // Aplicar filtro de importantes
    if (showOnlyImportant) {
      filtered = filtered.filter((announcement) => announcement.isImportant);
    }

    // Ordenar por fecha (más recientes primero)
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    set({ filteredAnnouncements: filtered });
  },
}));


