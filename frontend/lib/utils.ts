import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format time to 24-hour format
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Format number with commas (e.g., 1,234,567)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Calculate goal difference
 */
export function calculateGoalDifference(goalsFor: number, goalsAgainst: number): number {
  return goalsFor - goalsAgainst;
}

/**
 * Get result class (W, D, L) based on score
 */
export function getMatchResult(homeScore: number, awayScore: number, isHomeTeam: boolean): 'W' | 'D' | 'L' {
  if (homeScore === awayScore) return 'D';
  if ((homeScore > awayScore && isHomeTeam) || (homeScore < awayScore && !isHomeTeam)) {
    return 'W';
  }
  return 'L';
}

/**
 * Get badge color based on position
 */
export function getPositionColor(position: number, totalTeams: number): string {
  if (position === 1) return 'text-primary-yellow'; // Champion
  if (position <= 3) return 'text-primary-green'; // Champions League
  if (position >= totalTeams - 2) return 'text-status-error'; // Relegation
  return 'text-text-primary';
}

/**
 * Format match status for display
 */
export function formatMatchStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'scheduled': 'Upcoming',
    'live': 'LIVE',
    'halftime': 'HT',
    'finished': 'FT',
    'postponed': 'Postponed',
    'cancelled': 'Cancelled',
    'abandoned': 'Abandoned'
  };
  return statusMap[status] || status;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'live': 'bg-status-live text-text-inverse',
    'halftime': 'bg-status-warning text-text-inverse',
    'finished': 'bg-text-tertiary text-text-inverse',
    'scheduled': 'bg-accent-blue text-text-inverse',
    'postponed': 'bg-status-warning text-text-inverse',
    'cancelled': 'bg-status-error text-text-inverse'
  };
  return colorMap[status] || 'bg-text-tertiary text-text-inverse';
}

/**
 * Calculate win percentage
 */
export function calculateWinPercentage(wins: number, totalMatches: number): number {
  if (totalMatches === 0) return 0;
  return Math.round((wins / totalMatches) * 100);
}

/**
 * Generate player age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format player position
 */
export function formatPosition(position: string): string {
  const positionMap: Record<string, string> = {
    'GK': 'Goalkeeper',
    'CB': 'Centre Back',
    'LB': 'Left Back',
    'RB': 'Right Back',
    'CDM': 'Defensive Midfielder',
    'CM': 'Central Midfielder',
    'CAM': 'Attacking Midfielder',
    'LM': 'Left Midfielder',
    'RM': 'Right Midfielder',
    'LW': 'Left Winger',
    'RW': 'Right Winger',
    'ST': 'Striker',
    'CF': 'Centre Forward'
  };
  return positionMap[position] || position;
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

/**
 * Get Socket URL
 */
export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
}

/**
 * Handle API errors
 */
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
