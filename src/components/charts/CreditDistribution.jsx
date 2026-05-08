import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
      <p style={{ color: p.color }} className="font-medium">{name}</p>
      <p className="text-slate-600">{value} customers</p>
    </div>
  );
};

const renderLabel = ({ name, percent }) => {
  if (percent < 0.05) return '';
  return `${(percent * 100).toFixed(0)}%`;
};

export default function CreditDistribution({ data }) {
  if (!data?.length || data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No credit distribution data
      </div>
    );
  }

  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: d.label,
    value: d.count,
    color: d.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          label={renderLabel}
          labelLine={{ stroke: '#CBD5E1' }}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="white" strokeWidth={3} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#64748B' }}
          formatter={(value) => <span className="text-slate-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
