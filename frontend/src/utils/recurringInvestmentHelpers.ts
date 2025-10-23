// Shared utilities for recurring investment functionality

export const frequencyOptions = [
  "Once a month",
  "Twice a month",
  "Weekly",
  "Every other week",
];

export const investmentDaysMap: Record<string, string[]> = {
  "Once a month": ["1st", "15th", "Last day of month"],
  "Twice a month": ["1st & 15th", "15th & Last day"],
  Weekly: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "Every other week": ["Every other Monday", "Every other Friday"],
};

export const frequencyMap: Record<string, number> = {
  "Once a month": 12,
  "Twice a month": 24,
  Weekly: 52,
  "Every other week": 26,
};

// Map display frequency to backend format
export const frequencyMapping: Record<string, string> = {
  "Once a month": "monthly",
  "Twice a month": "monthly", // Could be "bi-monthly" if you want to distinguish
  "Weekly": "weekly",
  "Every other week": "weekly" // Could be "bi-weekly" if you want to distinguish
};

// Get midpoint value from a range string (e.g., "$1,000 to $10,000")
export function getMidpointFromRange(range: string): number {
  if (range.includes("Less than")) return 500;
  if (range.includes("More than")) return 1250000;
  const match = range.match(/\$?([\d,]+)\s+to\s+\$?([\d,]+)/);
  if (!match) return 0;
  const low = parseInt(match[1].replace(/,/g, ""));
  const high = parseInt(match[2].replace(/,/g, ""));
  return Math.floor((low + high) / 2);
}

// Generate preset amounts based on annual investment amount and frequency
export function generatePresetAmounts(annualAmount: string, frequency: string): number[] {
  const total = getMidpointFromRange(annualAmount);
  const periods = frequencyMap[frequency] || 12;
  const base = total / periods;
  const amounts = [1, 2, 3, 4].map((m) => Math.round((base * m) / 5) * 5);
  // Remove duplicates and ensure we have unique values
  return Array.from(new Set(amounts)).filter((amount, index, arr) =>
    amount > 0 && (index === 0 || amount !== arr[index - 1])
  );
}

// Map backend frequency to display format
export function mapBackendFrequencyToDisplay(backendFrequency: string): string {
  switch (backendFrequency) {
    case 'monthly':
      return 'Once a month';
    case 'weekly':
      return 'Weekly';
    case 'quarterly':
      return 'Once a month'; // Fallback
    default:
      return 'Once a month';
  }
}
