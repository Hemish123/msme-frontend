import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { getTier } from '../../utils/creditScore';
import { Building2 } from 'lucide-react';

export default function CustomerCard({ customer, onClick }) {
  const analytics = customer.analytics;
  const tier = analytics ? getTier(analytics.payment_score) : 'SILVER';
  const onTimeRate = analytics && analytics.total_invoices > 0
    ? Math.round((analytics.on_time_count / analytics.total_invoices) * 100)
    : 0;

  return (
    <div
      onClick={() => onClick?.(customer)}
      className="glass-card-hover p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
            {customer.name}
          </h3>
          {customer.company && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-400">
              <Building2 className="w-3.5 h-3.5" />
              {customer.company}
            </div>
          )}
        </div>
        <Badge tier={tier} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-xs text-slate-400">Total Amount</p>
          <p className="text-sm font-semibold text-slate-700">
            {formatCurrency(analytics?.total_amount || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">On-Time Rate</p>
          <p className={`text-sm font-semibold ${onTimeRate >= 70 ? 'text-emerald-600' : onTimeRate >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
            {onTimeRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Invoices</p>
          <p className="text-sm text-slate-600">{analytics?.total_invoices || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-sm font-semibold text-slate-700">
            {analytics?.payment_score?.toFixed(1) || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
