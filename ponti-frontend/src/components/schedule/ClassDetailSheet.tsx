"use client";

import { ClassBlock } from "@/data/types";
import { useRouter } from "next/navigation";

export default function ClassDetailSheet({
  open,
  onOpenChange,
  block,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  block: ClassBlock | null;
}) {
  const router = useRouter();
  if (!open || !block) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={() => onOpenChange(false)}>
      <div
        className="fixed left-0 right-0 bottom-0 mx-auto max-w-md rounded-t-xl border bg-background p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-10 bg-muted mx-auto rounded-full mb-3" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{block.courseName}</h3>
          <p className="text-sm">{block.startTime} - {block.endTime}</p>
          <p className="text-sm text-muted-foreground">{block.professor} • {block.room}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="h-10 rounded-md border"
            onClick={() => {
              onOpenChange(false);
              // en el futuro podría centrar el mapa en el salón
              router.push("/mapa");
            }}
          >
            Ubicar en el mapa
          </button>
          <button
            className="h-10 rounded-md bg-foreground text-background"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}


