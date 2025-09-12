"use client";

import MapCanvas from "@/components/map/MapCanvas";
import PlacesList from "@/components/map/PlacesList";

export default function MapPage() {
  return (
    <div className="space-y-3">
      <MapCanvas />
      <PlacesList />
    </div>
  );
}


