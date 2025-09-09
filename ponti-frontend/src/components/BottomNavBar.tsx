"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Map, Menu } from "lucide-react";

function Tab({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${
        isActive ? "text-foreground" : "text-muted-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-md grid grid-cols-4">
        <Tab href="/" label="Hoy" icon={<Home size={20} />} />
        <Tab href="/horario" label="Horario" icon={<CalendarDays size={20} />} />
        <Tab href="/mapa" label="Mapa" icon={<Map size={20} />} />
        <Tab href="/mas" label="Más" icon={<Menu size={20} />} />
      </div>
    </nav>
  );
}


