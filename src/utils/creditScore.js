export const computeCreditScore = ({
  totalInvoices = 0,
  onTimeCount = 0,
  lateCount = 0,
  avgDaysLate = 0,
  overdueCount = 0,
  hasPartial = false,
}) => {
  if (totalInvoices === 0) return 50;
  let score = 100;
  score -= Math.min(avgDaysLate * 2, 40);
  const lateRate = (lateCount / totalInvoices) * 100;
  if (lateRate > 50) score -= 20;
  else if (lateRate > 20) score -= 10;
  score -= Math.min(overdueCount * 15, 30);
  if (hasPartial) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
};

export const getTier = (score) => {
  if (score >= 85) return 'PLATINUM';
  if (score >= 70) return 'GOLD';
  if (score >= 50) return 'SILVER';
  if (score >= 30) return 'BRONZE';
  return 'BLACKLIST';
};

export const getTierLabel = (tier) => {
  const labels = { PLATINUM: 'Platinum', GOLD: 'Gold', SILVER: 'Silver', BRONZE: 'Bronze', BLACKLIST: 'Blacklist' };
  return labels[tier] || tier;
};

export const getTierColor = (tier) => {
  const colors = { PLATINUM: '#7C3AED', GOLD: '#D97706', SILVER: '#64748B', BRONZE: '#EA580C', BLACKLIST: '#E11D48' };
  return colors[tier] || '#64748B';
};

export const getCreditDays = (tier) => {
  const days = { PLATINUM: 90, GOLD: 60, SILVER: 30, BRONZE: 15, BLACKLIST: 0 };
  return days[tier] || 0;
};

export const getTierBadgeClass = (tier) => {
  const classes = { PLATINUM: 'badge-platinum', GOLD: 'badge-gold', SILVER: 'badge-silver', BRONZE: 'badge-bronze', BLACKLIST: 'badge-blacklist' };
  return classes[tier] || 'badge-silver';
};

export const getRowClass = (tier) => {
  const classes = { PLATINUM: 'table-row-platinum', GOLD: 'table-row-gold', SILVER: 'table-row-silver', BRONZE: 'table-row-bronze', BLACKLIST: 'table-row-blacklist' };
  return classes[tier] || '';
};
