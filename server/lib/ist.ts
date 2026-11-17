const IST_TIMEZONE = 'Asia/Kolkata';

export function getISTDateParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  dateKey: string;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateKey = formatter.format(date); // YYYY-MM-DD in IST
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day, dateKey };
}

export function getISTDayBounds(date: Date = new Date()): { start: Date; end: Date; dateKey: string } {
  const { dateKey } = getISTDateParts(date);
  const start = new Date(`${dateKey}T00:00:00.000+05:30`);
  const end = new Date(`${dateKey}T23:59:59.999+05:30`);
  return { start, end, dateKey };
}

export function formatISTDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatISTDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
