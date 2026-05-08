import { useState, useEffect } from 'react';
import { getYearlyAnalytics, getCustomerScores, getMonthlyHeatmap } from '../api/paymentAPI';
import Navbar from '../components/common/Navbar';
import HeatmapCalendar from '../components/charts/HeatmapCalendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { formatCurrencyCompact, formatCurrency } from '../utils/formatters';
import { getTierColor, getTier } from '../utils/creditScore';
import { CHART_COLORS } from '../utils/constants';

export default function Analytics() {
  const [yearly, setYearly] = useState([]);
  const [scores, setScores] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [yRes, sRes, hRes] = await Promise.all([getYearlyAnalytics(), getCustomerScores(), getMonthlyHeatmap()]);
    if (yRes.data) setYearly(yRes.data.data || []);
    if (sRes.data) setScores(sRes.data.data || []);
    if (hRes.data) setHeatmap(hRes.data.data || []);
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm space-y-1">
        <p className="text-slate-700 font-medium">{d?.customer_name}</p>
        <p className="text-slate-500">Score: <span className="text-brand-600 font-semibold">{d?.payment_score?.toFixed(1)}</span></p>
        <p className="text-slate-500">Avg Days Late: {d?.avg_days_late?.toFixed(1)}</p>
        <p className="text-slate-500">Total: {formatCurrency(d?.total_amount)}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Analytics" />
      <div className="p-6 space-y-6">
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="font-sora font-semibold text-lg text-slate-800 mb-4">Yearly Payment Volume</h2>
          {loading ? <div className="skeleton h-[350px]" /> : yearly.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={yearly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={formatCurrencyCompact} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }} formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="total_due" name="Total Due" fill={CHART_COLORS.indigo} radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_paid" name="Total Paid" fill={CHART_COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-sm text-slate-400 py-12">No yearly data</p>}
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-sora font-semibold text-lg text-slate-800 mb-4">Customer Score Distribution</h2>
          {loading ? <div className="skeleton h-[350px]" /> : scores.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="avg_days_late" name="Avg Days Late" tick={{ fill: '#64748B', fontSize: 12 }} label={{ value: 'Avg Days Late', position: 'bottom', fill: '#64748B', fontSize: 12 }} />
                <YAxis dataKey="total_amount" name="Total Amount" tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={formatCurrencyCompact} />
                <ZAxis dataKey="total_invoices" range={[50, 400]} name="Invoices" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={scores}>
                  {scores.map((s, i) => <Cell key={i} fill={getTierColor(s.tier || getTier(s.payment_score))} fillOpacity={0.8} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-sm text-slate-400 py-12">No score data</p>}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'BLACKLIST'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTierColor(t) }} /> {t}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="font-sora font-semibold text-lg text-slate-800 mb-4">Payment Activity Heatmap</h2>
          {loading ? <div className="skeleton h-32" /> : <HeatmapCalendar data={heatmap} />}
        </div>
      </div>
    </div>
  );
}
