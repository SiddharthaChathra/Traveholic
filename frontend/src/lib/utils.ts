// Utility functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, { hour: '2-digit', minute: '2-digit' });
}

export function formatNumber(num: number, decimals = 1): string {
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

export function getRiskColor(category: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    very_high: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
    very_low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return colors[category] || colors.low;
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return colors[severity] || colors.info;
}

export function getSensorTypeColor(type: string): string {
  const colors: Record<string, string> = {
    tide_gauge: 'bg-blue-500',
    wave_buoy: 'bg-green-500',
    camera: 'bg-purple-500',
    weather: 'bg-yellow-500',
  };
  return colors[type] || 'bg-slate-500';
}

export function getSensorTypeIcon(type: string) {
  const icons: Record<string, string> = {
    tide_gauge: 'Waves',
    wave_buoy: 'Waves',
    camera: 'Camera',
    weather: 'CloudSun',
  };
  return icons[type] || 'Sensor';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}