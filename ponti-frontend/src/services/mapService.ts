import { mockPois } from "@/data/mockPois";
import { PoiItem } from "@/data/types";

export async function fetchPois(): Promise<PoiItem[]> {
  await new Promise((r) => setTimeout(r, 400));
  return mockPois;
}


