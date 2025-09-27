/**
 * Utility functions for formatting data display
 */

/**
 * Format currency values
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for invalid currency codes
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Format percentage values
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date values
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', options);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', options);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;

    return formatDate(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format large numbers with abbreviations (e.g., 1.2K, 1.5M)
 */
export const formatNumber = (
  num: number,
  decimals: number = 1
): string => {
  if (num === 0) return '0';

  const k = 1000;
  const sizes = ['', 'K', 'M', 'B', 'T'];
  const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k));

  if (i === 0) return num.toString();

  return (num / Math.pow(k, i)).toFixed(decimals) + sizes[i];
};

/**
 * Format duration in days, hours, minutes
 */
export const formatDuration = (
  startDate: string | Date,
  endDate: string | Date
): string => {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Same day';
    if (diffInDays === 1) return '1 day';
    if (diffInDays < 30) return `${diffInDays} days`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;

    return `${Math.floor(diffInDays / 365)} years`;
  } catch (error) {
    return 'Invalid Duration';
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phoneNumber;
};

/**
 * Format social security number
 */
export const formatSSN = (ssn: string, masked: boolean = true): string => {
  const cleaned = ssn.replace(/\D/g, '');

  if (cleaned.length !== 9) return ssn;

  if (masked) {
    return `XXX-XX-${cleaned.slice(-4)}`;
  }

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
};

/**
 * Format investment return rate
 */
export const formatReturnRate = (
  principal: number,
  currentValue: number,
  decimals: number = 2
): string => {
  if (principal === 0) return '0%';

  const returnRate = ((currentValue - principal) / principal) * 100;
  const formatted = returnRate.toFixed(decimals);

  return `${returnRate >= 0 ? '+' : ''}${formatted}%`;
};

export default {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatDuration,
  formatFileSize,
  truncateText,
  formatPhoneNumber,
  formatSSN,
  formatReturnRate,
};