import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatCurrencyCompact } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
      <p className="text-slate-700 font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 100
            ? formatCurrencyCompact(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function CustomerScoreChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No score data available
      </div>
    );
  }

  const chartData = data.slice(0, 20).map((d) => ({
    name: d.customer_name?.length > 12 ? d.customer_name.slice(0, 12) + '…' : d.customer_name,
    score: d.payment_score,
    invoices: d.total_invoices,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} angle={-45} textAnchor="end" axisLine={{ stroke: '#E2E8F0' }} />
        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" name="Payment Score" fill={CHART_COLORS.indigo} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
