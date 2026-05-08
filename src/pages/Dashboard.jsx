import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats, getPaymentTrend, getTopCustomers, getDefaulters, getCreditDistribution } from '../api/dashboardAPI';
import { setStats, setPaymentTrend, setTopCustomers, setDefaulters, setCreditDistribution, setLoading } from '../store/dashboardSlice';
import Navbar from '../components/common/Navbar';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import PaymentTrendChart from '../components/charts/PaymentTrendChart';
import CreditDistribution from '../components/charts/CreditDistribution';
import Badge from '../components/common/Badge';
import { formatCurrencyCompact, formatCurrency } from '../utils/formatters';
import { getTier } from '../utils/creditScore';
import { Users, FileText, TrendingUp, Clock, Trophy, AlertTriangle, IndianRupee, CheckCircle } from 'lucide-react';
import { getInvoiceStats } from '../api/invoiceAPI';
import { Link } from 'react-router-dom';

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const duration = 1500;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  const formatted = Number.isInteger(value) ? Math.round(display).toLocaleString('en-IN') : display.toFixed(1);
  return <span>{prefix}{formatted}{suffix}</span>;
}

const kpiConfig = [
  { label: 'Total Customers', key: 'total_customers', icon: Users, gradient: 'from-brand-500 to-brand-600', iconBg: 'bg-brand-50', iconColor: 'text-brand-500', isInt: true },
  { label: 'Invoices Value', key: 'total_invoices_value', icon: FileText, gradient: 'from-emerald-500 to-teal-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', format: formatCurrencyCompact },
  { label: 'On-Time Rate', key: 'on_time_rate', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', suffix: '%' },
  { label: 'Avg Days Late', key: 'avg_days_late', icon: Clock, gradient: 'from-rose-500 to-pink-500', iconBg: 'bg-rose-50', iconColor: 'text-rose-500', suffix: ' days' },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, paymentTrend, topCustomers, defaulters, creditDistribution, loading } = useSelector((s) => s.dashboard);
  const [invoiceStats, setInvoiceStats] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    dispatch(setLoading(true));
    const [statsRes, trendRes, topRes, defRes, distRes, invStatsRes] = await Promise.all([
      getDashboardStats(), getPaymentTrend(), getTopCustomers(), getDefaulters(), getCreditDistribution(), getInvoiceStats(),
    ]);
    if (statsRes.data) dispatch(setStats(statsRes.data.data));
    if (trendRes.data) dispatch(setPaymentTrend(trendRes.data.data));
    if (topRes.data) dispatch(setTopCustomers(topRes.data.data));
    if (defRes.data) dispatch(setDefaulters(defRes.data.data));
    if (distRes.data) dispatch(setCreditDistribution(distRes.data.data));
    if (invStatsRes.data) setInvoiceStats(invStatsRes.data);
    dispatch(setLoading(false));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : kpiConfig.map((kpi, i) => {
                const Icon = kpi.icon;
                const val = stats?.[kpi.key] || 0;
                return (
                  <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-500 font-medium">{kpi.label}</span>
                      <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-sora font-bold text-slate-800">
                      {kpi.format ? kpi.format(val) : <AnimatedNumber value={val} prefix={kpi.prefix || ''} suffix={kpi.suffix || ''} />}
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Payment Trend */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="font-sora font-semibold text-lg text-slate-800 mb-4">Payment Trend (Last 12 Months)</h2>
          {loading ? <div className="skeleton h-[350px]" /> : <PaymentTrendChart data={paymentTrend} />}
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-sora font-semibold text-lg text-slate-800">Top On-Time Payers</h2>
            </div>
            <div className="space-y-2">
              {(topCustomers || []).slice(0, 5).map((c, i) => (
                <div key={c.customer_id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{c.customer_name}</p>
                    <p className="text-xs text-slate-400">{c.on_time_rate}% on-time</p>
                  </div>
                  <Badge tier={c.tier} />
                  <span className="text-sm font-bold text-brand-600">{c.payment_score.toFixed(0)}</span>
                </div>
              ))}
              {!topCustomers?.length && !loading && (
                <p className="text-center text-sm text-slate-400 py-4">No data yet</p>
              )}
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h2 className="font-sora font-semibold text-lg text-slate-800">Top Defaulters</h2>
            </div>
            <div className="space-y-2">
              {(defaulters || []).slice(0, 5).map((c, i) => (
                <div key={c.customer_id} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{c.customer_name}</p>
                    <p className="text-xs text-slate-400">Avg {c.avg_days_late.toFixed(0)} days late</p>
                  </div>
                  <Badge tier={c.tier} />
                  <span className="text-sm font-bold text-rose-600">{c.payment_score.toFixed(0)}</span>
                </div>
              ))}
              {!defaulters?.length && !loading && (
                <p className="text-center text-sm text-slate-400 py-4">No defaulters found</p>
              )}
            </div>
          </div>
        </div>

        {/* Credit Distribution */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h2 className="font-sora font-semibold text-lg text-slate-800 mb-4">Credit Tier Distribution</h2>
          {loading ? <div className="skeleton h-[300px]" /> : <CreditDistribution data={creditDistribution} />}
        </div>

        {/* Invoice Summary */}
        {invoiceStats && (
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sora font-semibold text-lg text-slate-800">Invoice Summary</h2>
              <Link to="/invoice/dashboard" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View All Invoices →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total Invoices', value: invoiceStats.total_invoices, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'This Month Revenue', value: `₹${(invoiceStats.month_revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending Amount', value: `₹${(invoiceStats.pending_amount || 0).toLocaleString('en-IN')}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Paid This Month', value: `₹${(invoiceStats.month_paid || 0).toLocaleString('en-IN')}`, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
              ].map(c => (
                <div key={c.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}><c.icon className={`w-3.5 h-3.5 ${c.color}`} /></div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">{c.label}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 ml-9">{c.value}</p>
                </div>
              ))}
            </div>
            {invoiceStats.recent_invoices && invoiceStats.recent_invoices.length > 0 && (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-xs uppercase text-slate-500">
                    <th className="px-4 py-2 text-left">Invoice No</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr></thead>
                  <tbody>{invoiceStats.recent_invoices.map((inv, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-4 py-2 font-mono text-indigo-600 font-medium">{inv.invoice_number}</td>
                      <td className="px-4 py-2 text-slate-700">{inv.customer_name}</td>
                      <td className="px-4 py-2 text-right font-semibold">₹{parseFloat(inv.grand_total).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'SENT' ? 'bg-blue-100 text-blue-700' : inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>{inv.status}</span></td>
                      <td className="px-4 py-2 text-slate-500">{inv.billing_date}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
