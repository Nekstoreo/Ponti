import { mockSchedule } from "@/data/mockSchedule";
import { WeeklySchedule } from "@/data/types";

export async function fetchSchedule(): Promise<WeeklySchedule> {
  await new Promise((r) => setTimeout(r, 400));
  return mockSchedule;
}


