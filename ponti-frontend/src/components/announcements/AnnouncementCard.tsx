"use client";

import { AnnouncementItem } from "@/data/types";
import { useAnnouncementStore } from "@/store/announcementStore";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Star, Pin } from "lucide-react";

interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  onClick?: () => void;
  showActions?: boolean;
}

const categoryColors = {
  academico: "bg-blue-100 text-blue-800",
  administrativo: "bg-gray-100 text-gray-800",
  eventos: "bg-green-100 text-green-800",
  general: "bg-purple-100 text-purple-800",
};

const categoryLabels = {
  academico: "Académico",
  administrativo: "Administrativo",
  eventos: "Eventos",
  general: "General",
};

export function AnnouncementCard({
  announcement,
  onClick,
  showActions = false
}: AnnouncementCardProps) {
  const { markAsRead, markAsUnread } = useAnnouncementStore();

  const handleReadToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (announcement.isRead) {
      markAsUnread(announcement.id);
    } else {
      markAsRead(announcement.id);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es,
    });
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        announcement.isRead ? "opacity-75" : "border-l-4 border-l-blue-500"
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={categoryColors[announcement.category]}
              >
                {categoryLabels[announcement.category]}
              </Badge>
              {announcement.isImportant && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {!announcement.isRead && (
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
              )}
            </div>
            <h3 className={`font-medium text-sm leading-tight ${
              announcement.isRead ? "text-muted-foreground" : ""
            }`}>
              {announcement.title}
            </h3>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReadToggle}
              className="h-8 w-8 p-0"
            >
              {announcement.isRead ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {announcement.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{announcement.author}</span>
          <span>{formatDate(announcement.createdAt)}</span>
        </div>
        {announcement.tags && announcement.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {announcement.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {announcement.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{announcement.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
