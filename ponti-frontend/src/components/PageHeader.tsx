"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
}

export default function PageHeader({
  title,
  showBackButton = true,
  backTo,
  className = ""
}: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Para la vista de calificaciones, no mostrar botón de retroceso y quitar borde
  const isCalificacionesPage = pathname === "/calificaciones";
  const shouldShowBackButton = showBackButton && !isCalificacionesPage;

  const handleBack = () => {
    if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${isCalificacionesPage ? '' : 'border-b'} bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      {shouldShowBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-2 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}
      <div className="flex-1">
        <h1 className="text-xl font-semibold truncate">{title}</h1>
      </div>
    </div>
  );
}
