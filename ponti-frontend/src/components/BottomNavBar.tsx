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
  const isActive = href === "/" 
    ? pathname === "/" 
    : pathname.startsWith(href);

  const content = (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center gap-1 flex-1 py-3 relative
        transition-all duration-200 ease-out
        ${isActive ? "text-primary" : "text-muted-foreground"}
        hover:text-foreground active:scale-95
      `}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon */}
      <div 
        className={`
          transition-transform duration-200 ease-out
          ${isActive ? "scale-110" : "scale-100"}
        `}
      >
        {icon}
      </div>
      
      {/* Label */}
      <span className="text-xs font-medium">{label}</span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-8 bg-primary rounded-full" />
      )}
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


