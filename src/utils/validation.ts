export function validateIMEI(imei: string): { valid: boolean; error?: string } {
  if (!imei || imei.trim() === '') {
    return { valid: false, error: 'IMEI is required' };
  }
  
  // Remove any whitespace
  const cleaned = imei.trim().replace(/\s/g, '');
  
  // Check if numeric
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'IMEI must contain only digits' };
  }
  
  // Check length (14-16 digits)
  if (cleaned.length < 14 || cleaned.length > 16) {
    return { valid: false, error: 'IMEI must be 14-16 digits' };
  }
  
  return { valid: true };
}

export function validatePrice(price: string | number): { valid: boolean; error?: string } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { valid: false, error: 'Price must be a valid number' };
  }
  
  if (numPrice <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  
  return { valid: true };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDateOnly(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

