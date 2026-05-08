import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatCurrencyCompact } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm space-y-1">
      <p className="text-slate-700 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatCurrencyCompact(entry.value)}
        </p>
      ))}
      {payload.length === 2 && (
        <p className="text-slate-400 text-xs border-t border-slate-100 pt-1 mt-1">
          Gap: {formatCurrencyCompact(Math.abs((payload[0]?.value || 0) - (payload[1]?.value || 0)))}
        </p>
      )}
    </div>
  );
};

export default function PaymentTrendChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No payment trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="month_label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} tickFormatter={formatCurrencyCompact} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#64748B', fontSize: 12 }} />
        <Line type="monotone" dataKey="total_due" name="Total Due" stroke={CHART_COLORS.indigo} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.indigo }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="total_collected" name="Total Collected" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.teal }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
