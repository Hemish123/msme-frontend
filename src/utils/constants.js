export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MSME PayTrack';

export const CREDIT_TIERS = [
  { value: 'PLATINUM', label: 'Platinum', min: 85, max: 100, color: '#7C3AED', days: 90 },
  { value: 'GOLD', label: 'Gold', min: 70, max: 84, color: '#D97706', days: 60 },
  { value: 'SILVER', label: 'Silver', min: 50, max: 69, color: '#64748B', days: 30 },
  { value: 'BRONZE', label: 'Bronze', min: 30, max: 49, color: '#EA580C', days: 15 },
  { value: 'BLACKLIST', label: 'Blacklist', min: 0, max: 29, color: '#E11D48', days: 0 },
];

export const PAYMENT_STATUSES = [
  { value: 'PAID', label: 'Paid', color: '#059669' },
  { value: 'LATE', label: 'Late', color: '#D97706' },
  { value: 'PARTIAL', label: 'Partial', color: '#EA580C' },
  { value: 'OVERDUE', label: 'Overdue', color: '#E11D48' },
  { value: 'PENDING', label: 'Pending', color: '#64748B' },
];

export const CREDIT_DAYS_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
  { value: 45, label: '45 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

export const CHART_COLORS = {
  indigo: '#6366F1',
  teal: '#14B8A6',
  amber: '#F59E0B',
  rose: '#F43F5E',
  purple: '#8B5CF6',
  orange: '#F97316',
  slate: '#64748B',
  emerald: '#10B981',
  blue: '#3B82F6',
};
