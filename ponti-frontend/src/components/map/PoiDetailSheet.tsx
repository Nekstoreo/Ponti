"use client";

import { PoiItem } from "@/data/types";

export default function PoiDetailSheet({
  open,
  onOpenChange,
  poi,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  poi: PoiItem | null;
}) {
  if (!open || !poi) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={() => onOpenChange(false)}>
      <div
        className="fixed left-0 right-0 bottom-0 mx-auto max-w-md rounded-t-xl border bg-background p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 bg-muted mx-auto rounded-full mb-3" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{poi.title}</h3>
          {poi.subtitle && <p className="text-sm">{poi.subtitle}</p>}
          <p className="text-xs text-muted-foreground capitalize">{poi.category}</p>
          {poi.hours && (
            <p className="text-sm">
              {poi.isOpenNow ? (
                <span className="text-green-600 dark:text-green-400">Abierto ahora</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Cerrado</span>
              )} {poi.hours && `• ${poi.hours}`}
            </p>
          )}
          {poi.description && (
            <p className="text-sm text-muted-foreground">{poi.description}</p>
          )}
        </div>
        <div className="mt-4">
          <button
            className="w-full h-10 rounded-md bg-foreground text-background"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}


