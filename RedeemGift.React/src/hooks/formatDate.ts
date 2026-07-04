import { format, parseISO, isValid } from 'date-fns';

type DateMode = "display" | "api";

/**
 * Format date (auto include time if available)
 * @param date Date object or parsable string
 * @param mode "display" (DD/MM/YYYY[ HH:mm:ss]) | "api" (YYYY-MM-DD[ HH:mm:ss])
 * @param fallback Return if null/invalid
 */
export const formatDate = (
  date?: string | Date | null,
  mode: DateMode = "display",
  fallback: string | null = "-"
): string | null => {
  if (!date) return fallback;

  let d: Date;
  if (typeof date === 'string') {
    d = parseISO(date);
  } else {
    d = date;
  }
  
  if (!isValid(d)) return fallback;

  const hasTime =
    d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;

  if (mode === "api")
    return format(d, hasTime ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd");

  return format(d, hasTime ? "dd/MM/yyyy HH:mm:ss" : "dd/MM/yyyy");
};
