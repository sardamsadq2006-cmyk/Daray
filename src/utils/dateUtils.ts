/**
 * Kurdish Date & Calendar Utilities
 */

export const KURDISH_DAYS = [
  'یەکشەممە',  // Sunday (index 0)
  'دووشەممە',  // Monday (index 1)
  'سێشەممە',   // Tuesday (index 2)
  'چوارشەممە', // Wednesday (index 3)
  'پێنجشەممە', // Thursday (index 4)
  'هەینی',     // Friday (index 5)
  'شەممە',     // Saturday (index 6)
];

export const KURDISH_MONTHS = [
  'کانوونی دووەم', // January
  'شوبات',        // February
  'ئازار',        // March
  'نیسان',        // April
  'ئایار',        // May
  'حوزەیران',      // June
  'تەممووز',       // July
  'ئاب',          // August
  'ئەیلوول',       // September
  'تشرینی یەکەم',  // October
  'تشرینی دووەم',  // November
  'کانوونی یەکەم', // December
];

export function getKurdishDayName(date: Date = new Date()): string {
  const dayIndex = date.getDay();
  return KURDISH_DAYS[dayIndex];
}

export function formatKurdishDate(date: Date = new Date()): string {
  const dayName = getKurdishDayName(date);
  const dayNumber = date.getDate();
  const monthName = KURDISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `ئەمڕۆ ${dayName}، ${dayNumber}ی ${monthName}ی ${year}`;
}

export function formatShortKurdishDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return dateStr.toString();
  const day = d.getDate();
  const month = KURDISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}ی ${month} ${year}`;
}

export function calculateDaysRemaining(nextDueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(nextDueDateStr);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
