import { create } from "zustand";
import { WeeklySchedule, DayKey, ClassBlock } from "@/data/types";

interface ScheduleState {
  schedule: WeeklySchedule;
  selectedDay: DayKey;
  setSchedule: (data: WeeklySchedule) => void;
  setSelectedDay: (day: DayKey) => void;
  getNextClassForToday: () => ClassBlock | null;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getTodayDayKey(): DayKey {
  const map: Record<number, DayKey> = {
    0: "D",
    1: "L",
    2: "M",
    3: "X",
    4: "J",
    5: "V",
    6: "S",
  };
  const jsDay = new Date().getDay(); // 0-6 (domingo=0)
  return map[jsDay] ?? "D";
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedule: { D: [], L: [], M: [], X: [], J: [], V: [], S: [] },
  selectedDay: getTodayDayKey(),
  setSchedule: (data) => set({ schedule: data }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  getNextClassForToday: () => {
    const dayKey = get().selectedDay;
    const blocks = get().schedule[dayKey] ?? [];
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const upcoming = blocks
      .filter((b) => parseTimeToMinutes(b.startTime) >= nowMins)
      .sort(
        (a, b) =>
          parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
      );
    return upcoming[0] ?? null;
  },
}));


