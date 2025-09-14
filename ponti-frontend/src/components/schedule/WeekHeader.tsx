"use client";

import { DayKey } from "@/data/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

function getDayKeyByIndex(index: number): DayKey {
  const map: DayKey[] = ["D", "L", "M", "X", "J", "V", "S"];
  return map[index] ?? "D";
}

function getIndexByDayKey(dayKey: DayKey): number {
  const map: Record<DayKey, number> = { D: 0, L: 1, M: 2, X: 3, J: 4, V: 5, S: 6 };
  return map[dayKey];
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

export default function TimeNavigator({
  selectedDay,
  setSelectedDay,
  referenceMonday,
  setReferenceMonday,
  onSwipeDay,
}: {
  selectedDay: DayKey;
  setSelectedDay: (d: DayKey) => void;
  referenceMonday: Date;
  setReferenceMonday: (d: Date) => void;
  onSwipeDay?: (direction: 'left' | 'right') => void;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const monthYear = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(referenceMonday);

  const today = new Date();
  const todayYMD = today.toDateString();
  const selectedIndex = getIndexByDayKey(selectedDay);


  const handleDayClick = (dayKey: DayKey) => {
    setSelectedDay(dayKey);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    const newMonday = addDays(referenceMonday, days);
    setReferenceMonday(newMonday);
    onSwipeDay?.(direction === 'prev' ? 'right' : 'left');
  };

  const jumpToToday = () => {
    const today = new Date();
    // Calculate the Sunday of the current week (first day)
    const todayWeekStart = getWeekStart(today);
    setReferenceMonday(todayWeekStart);

    // Set today as selected day
    const todayDayIndex = today.getDay(); // Sunday = 0, Monday = 1, etc.
    setSelectedDay(getDayKeyByIndex(todayDayIndex));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setReferenceMonday(getWeekStart(date));
      setIsCalendarOpen(false);
    }
  };


  return (
    <div className="space-y-3">
      {/* Month/Year header with selector */}
      <div className="flex items-center justify-between">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground h-auto p-0 font-medium"
            >
              <span className="font-medium">
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={referenceMonday}
              onSelect={handleDateSelect}
              initialFocus
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={jumpToToday}
            className="text-xs"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Semana anterior"
            onClick={() => navigateWeek('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Semana siguiente"
            onClick={() => navigateWeek('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day buttons */}
      <div className="flex gap-1 justify-between">
        {Array.from({ length: 7 }).map((_, idx) => {
          const date = addDays(referenceMonday, idx);
          const labelDay = new Intl.DateTimeFormat("es-ES", {
            day: "numeric",
          }).format(date);
          const dayName = new Intl.DateTimeFormat("es-ES", {
            weekday: "short",
          }).format(date);
          
          const isSelected = idx === selectedIndex;
          const isToday = date.toDateString() === todayYMD;
          const dayKey = getDayKeyByIndex(idx);
          
          return (
            <Button
              key={idx}
              variant="outline"
              onClick={() => handleDayClick(dayKey)}
              className={`
                flex flex-col items-center justify-center h-14 px-2 py-2 text-xs flex-1
                transition-all duration-200 ease-out border
                ${isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary"
                  : isToday
                  ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
                  : "hover:bg-accent hover:border-accent-foreground/20"
                }
              `}
            >
              <span className="text-[10px] uppercase font-medium opacity-75">
                {dayName}
              </span>
              <span className="text-sm font-bold leading-none">{labelDay}</span>
            </Button>
          );
        })}
      </div>

    </div>
  );
}


