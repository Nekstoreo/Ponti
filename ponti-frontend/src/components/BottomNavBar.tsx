"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Map, Menu } from "lucide-react";
import { NotificationIndicator } from "@/components/notifications/NotificationIndicator";

function Tab({
  href,
  label,
  icon,
  showNotificationIndicator = false
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  showNotificationIndicator?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const content = (
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

  if (showNotificationIndicator) {
    return (
      <NotificationIndicator className="flex-1">
        {content}
      </NotificationIndicator>
    );
  }

  return content;
}

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-md grid grid-cols-4">
        <Tab href="/" label="Hoy" icon={<Home size={20} />} />
        <Tab href="/horario" label="Horario" icon={<CalendarDays size={20} />} />
        <Tab href="/mapa" label="Mapa" icon={<Map size={20} />} />
        <Tab
          href="/mas"
          label="Más"
          icon={<Menu size={20} />}
          showNotificationIndicator={true}
        />
      </div>
    </nav>
  );
}


