"use client";

import { DayKey } from "@/data/types";
import { useState, useRef, useEffect } from "react";

function getDayKeyByIndex(index: number): DayKey {
  const map: DayKey[] = ["L", "M", "X", "J", "V", "S"];
  return map[index] ?? "L";
}

function getIndexByDayKey(dayKey: DayKey): number {
  const map: Record<DayKey, number> = { L: 0, M: 1, X: 2, J: 3, V: 4, S: 5 };
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
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const monthYear = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(referenceMonday);

  const today = new Date();
  const todayYMD = today.toDateString();
  const selectedIndex = getIndexByDayKey(selectedDay);

  // Auto-scroll to selected day
  useEffect(() => {
    if (carouselRef.current && !isScrolling) {
      const selectedButton = carouselRef.current.children[selectedIndex] as HTMLElement;
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, isScrolling]);

  const handleDayClick = (dayKey: DayKey) => {
    setSelectedDay(dayKey);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    setReferenceMonday(addDays(referenceMonday, days));
    onSwipeDay?.(direction === 'prev' ? 'right' : 'left');
  };

  const jumpToToday = () => {
    const todayWeekStart = getWeekStart(new Date());
    setReferenceMonday(todayWeekStart);
    
    // Set today as selected day
    const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday (0) to Saturday (6)
    setSelectedDay(getDayKeyByIndex(todayDayIndex));
  };

  const openMonthSelector = () => {
    setShowMonthSelector(true);
  };

  const selectMonth = (monthOffset: number) => {
    const newDate = new Date(referenceMonday);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    setReferenceMonday(getWeekStart(newDate));
    setShowMonthSelector(false);
  };

  // Handle carousel scroll
  const handleScroll = () => {
    setIsScrolling(true);
    // Reset scrolling flag after scroll ends
    setTimeout(() => setIsScrolling(false), 150);
  };

  return (
    <div className="space-y-3">
      {/* Month/Year header with selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={openMonthSelector}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium">
            {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="text-xs px-2 py-1 rounded-md border hover:bg-accent transition-colors"
          >
            Hoy
          </button>
          <button
            aria-label="Semana anterior"
            onClick={() => navigateWeek('prev')}
            className="h-8 w-8 rounded-md border hover:bg-accent transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Semana siguiente"
            onClick={() => navigateWeek('next')}
            className="h-8 w-8 rounded-md border hover:bg-accent transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day carousel */}
      <div 
        ref={carouselRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {Array.from({ length: 6 }).map((_, idx) => {
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
            <button
              key={idx}
              onClick={() => handleDayClick(dayKey)}
              className={`
                flex flex-col items-center justify-center h-16 min-w-[60px] px-3 rounded-lg border text-sm
                snap-center transition-all duration-200 ease-out
                ${isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : isToday
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : "hover:bg-accent hover:border-accent-foreground/20"
                }
              `}
            >
              <span className="text-[10px] uppercase font-medium opacity-75">
                {dayName}
              </span>
              <span className="text-lg font-bold leading-none">{labelDay}</span>
            </button>
          );
        })}
      </div>

      {/* Month selector modal */}
      {showMonthSelector && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={() => setShowMonthSelector(false)}
        >
          <div 
            className="bg-background rounded-lg border shadow-lg p-4 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Saltar a mes</h3>
            <div className="grid grid-cols-3 gap-2">
              {[-2, -1, 0, 1, 2, 3].map((offset) => {
                const date = new Date(referenceMonday);
                date.setMonth(date.getMonth() + offset);
                const monthLabel = new Intl.DateTimeFormat("es-ES", {
                  month: "short",
                  year: offset === 0 ? undefined : "numeric",
                }).format(date);
                
                return (
                  <button
                    key={offset}
                    onClick={() => selectMonth(offset)}
                    className={`
                      p-3 rounded-md border text-sm transition-colors
                      ${offset === 0 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                      }
                    `}
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowMonthSelector(false)}
              className="w-full mt-4 p-2 rounded-md border hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


