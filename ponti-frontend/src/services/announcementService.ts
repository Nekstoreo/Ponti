import { mockAnnouncements } from "@/data/mockAnnouncements";
import { AnnouncementItem } from "@/data/types";

export async function fetchAnnouncements(): Promise<AnnouncementItem[]> {
  await new Promise((r) => setTimeout(r, 350));
  return mockAnnouncements;
}


