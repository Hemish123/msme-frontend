import { getTierBadgeClass, getTierLabel, getCreditDays } from '../../utils/creditScore';
import { Shield } from 'lucide-react';

export default function CreditBadge({ tier, score, showDays = true }) {
  const days = getCreditDays(tier);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border 
      ${getTierBadgeClass(tier)}`}>
      <Shield className="w-4 h-4" />
      <div className="flex flex-col">
        <span className="text-xs font-bold">{getTierLabel(tier)}</span>
        {showDays && (
          <span className="text-[10px] opacity-70">
            {days > 0 ? `${days} days credit` : 'No credit'}
          </span>
        )}
      </div>
      {score !== undefined && (
        <span className="text-sm font-bold ml-1">{score.toFixed(0)}</span>
      )}
    </div>
  );
}
