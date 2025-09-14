"use client";

import { WeeklySchedule, ClassBlock } from "@/data/types";
import { format, addDays, startOfWeek } from "date-fns";

// iCal generation utilities
export function generateICalendar(
  schedule: WeeklySchedule, 
  startDate: Date = new Date(),
  weeksToGenerate: number = 16
): string {
  const events: string[] = [];
  const prodId = "PRODID:-//Ponti//Student Schedule//ES";
  const version = "VERSION:2.0";
  const calScale = "CALSCALE:GREGORIAN";
  const method = "METHOD:PUBLISH";
  
  // Calendar header
  const header = [
    "BEGIN:VCALENDAR",
    version,
    prodId,
    calScale,
    method,
    "X-WR-CALNAME:Horario Universitario - Ponti",
    "X-WR-CALDESC:Horario de clases generado desde Ponti",
    "X-WR-TIMEZONE:America/Bogota"
  ];

  // Generate events for the specified number of weeks
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday

  for (let weekOffset = 0; weekOffset < weeksToGenerate; weekOffset++) {
    const currentWeekStart = addDays(weekStart, weekOffset * 7);
    
    Object.entries(schedule).forEach(([dayKey, blocks]) => {
      const dayOffset = getDayOffset(dayKey);
      const eventDate = addDays(currentWeekStart, dayOffset);
      
      blocks.forEach((block) => {
        const event = generateEvent(block, eventDate);
        events.push(event);
      });
    });
  }

  // Calendar footer
  const footer = ["END:VCALENDAR"];

  return [...header, ...events, ...footer].join("\r\n");
}

function getDayOffset(dayKey: string): number {
  const dayMap: Record<string, number> = {
    "L": 0, // Lunes
    "M": 1, // Martes
    "X": 2, // Miércoles
    "J": 3, // Jueves
    "V": 4, // Viernes
    "S": 5  // Sábado
  };
  return dayMap[dayKey] || 0;
}

function generateEvent(block: ClassBlock, date: Date): string {
  const startTime = parseTimeToDate(block.startTime, date);
  const endTime = parseTimeToDate(block.endTime, date);
  
  const uid = `${block.id}-${format(date, "yyyyMMdd")}@ponti.app`;
  const dtStart = formatDateForICal(startTime);
  const dtEnd = formatDateForICal(endTime);
  const summary = escapeICalText(block.courseName);
  const description = escapeICalText(
    `Profesor: ${block.professor}\\nAula: ${block.room}\\nHorario: ${block.startTime} - ${block.endTime}`
  );
  const location = escapeICalText(block.room);
  
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    `CREATED:${formatDateForICal(new Date())}`,
    `LAST-MODIFIED:${formatDateForICal(new Date())}`,
    "END:VEVENT"
  ].join("\r\n");
}

function parseTimeToDate(timeString: string, date: Date): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatDateForICal(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Download utilities
export function downloadICalFile(iCalContent: string, filename: string = "horario"): void {
  const blob = new Blob([iCalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Share utilities
export function createShareableScheduleLink(
  schedule: WeeklySchedule,
  baseUrl: string = window.location.origin
): string {
  const compressedSchedule = compressScheduleData(schedule);
  return `${baseUrl}/horario/compartir?data=${compressedSchedule}`;
}

function compressScheduleData(schedule: WeeklySchedule): string {
  const simplified = Object.entries(schedule).reduce((acc, [day, blocks]) => {
    acc[day] = blocks.map(block => ({
      id: block.id,
      course: block.courseName,
      prof: block.professor,
      room: block.room,
      start: block.startTime,
      end: block.endTime
    }));
    return acc;
  }, {} as Record<string, Array<{
    id: string;
    course: string;
    prof: string;
    room: string;
    start: string;
    end: string;
  }>>);
  
  const jsonString = JSON.stringify(simplified);
  const base64 = btoa(encodeURIComponent(jsonString));
  return base64;
}

export function decompressScheduleData(compressedData: string): WeeklySchedule {
  try {
    const jsonString = decodeURIComponent(atob(compressedData));
    const simplified = JSON.parse(jsonString);
    
    const result: WeeklySchedule = {} as WeeklySchedule;
    
    Object.entries(simplified).forEach(([day, blocks]) => {
      const typedBlocks = blocks as Array<{
        id: string;
        course: string;
        prof: string;
        room: string;
        start: string;
        end: string;
      }>;
      
      result[day as keyof WeeklySchedule] = typedBlocks.map(block => ({
        id: block.id,
        courseName: block.course,
        professor: block.prof,
        room: block.room,
        startTime: block.start,
        endTime: block.end
      }));
    });
    
    return result;
  } catch (error) {
    console.error("Error decompressing schedule data:", error);
    return {} as WeeklySchedule;
  }
}

// Social sharing
export async function shareSchedule(
  schedule: WeeklySchedule,
  studentName?: string
): Promise<void> {
  const shareData = {
    title: `Horario de ${studentName || 'Estudiante'} - Ponti`,
    text: "Mira mi horario de clases generado con Ponti",
    url: createShareableScheduleLink(schedule)
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log("Error sharing:", error);
      // Fallback to clipboard
      fallbackShare(shareData.url);
    }
  } else {
    // Fallback to clipboard
    fallbackShare(shareData.url);
  }
}

function fallbackShare(url: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      // You could show a toast notification here
      console.log("Link copied to clipboard");
    });
  } else {
    // Further fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    console.log("Link copied to clipboard (fallback)");
  }
}

// Calendar app detection and opening
export function openInCalendarApp(iCalContent: string): void {
  const blob = new Blob([iCalContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  
  // Try to open in default calendar app
  window.open(url, "_blank");
  
  // Cleanup after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// Format schedule for display in share preview
export function formatScheduleForDisplay(schedule: WeeklySchedule): string {
  const dayNames = {
    D: "Domingo",
    L: "Lunes",
    M: "Martes", 
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
    S: "Sábado"
  };

  let formatted = "📅 Mi Horario Universitario\n\n";
  
  Object.entries(schedule).forEach(([dayKey, blocks]) => {
    if (blocks.length > 0) {
      formatted += `${dayNames[dayKey as keyof typeof dayNames] || dayKey}:\n`;
      blocks.forEach(block => {
        formatted += `• ${block.startTime}-${block.endTime} ${block.courseName} (${block.room})\n`;
      });
      formatted += "\n";
    }
  });
  
  formatted += "Generado con Ponti 🎓";
  return formatted;
}
