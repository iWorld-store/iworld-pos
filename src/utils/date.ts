import { format, parse } from 'date-fns';

// Convert date to DD/MM/YYYY format
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    // Try to parse ISO format
    try {
      const parsed = new Date(date);
      return format(parsed, 'dd/MM/yyyy');
    } catch {
      return date;
    }
  }
  return format(date, 'dd/MM/yyyy');
}

// Parse DD/MM/YYYY to Date object
export function parseDate(dateString: string): Date {
  try {
    return parse(dateString, 'dd/MM/yyyy', new Date());
  } catch {
    return new Date();
  }
}

// Get today's date in DD/MM/YYYY format
export function getTodayDate(): string {
  return format(new Date(), 'dd/MM/yyyy');
}

// Generate receipt number: RCP-YYYYMMDD-XXX
export function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${dateStr}-${random}`;
}

