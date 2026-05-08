import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, getCustomerPayments, getCustomerSummary, getCustomerCreditHistory, assignCredit } from '../api/customerAPI';
import Navbar from '../components/common/Navbar';
import Badge, { StatusBadge } from '../components/common/Badge';
import CreditBadge from '../components/customers/CreditBadge';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { PageLoader } from '../components/common/LoadingSpinner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { getTier, getTierColor, getCreditDays } from '../utils/creditScore';
import { CREDIT_DAYS_OPTIONS, CHART_COLORS } from '../utils/constants';
import { Building2, Mail, Phone, ArrowLeft, Award, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditForm, setCreditForm] = useState({ credit_days: 30, reason: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [custRes, summRes, payRes] = await Promise.all([
      getCustomer(id), getCustomerSummary(id), getCustomerPayments(id),
    ]);
    if (custRes.data) setCustomer(custRes.data.data);
    if (summRes.data) setSummary(summRes.data.data);
    if (payRes.data) setPayments(payRes.data.data?.results || payRes.data.data || []);
    setLoading(false);
  };

  const handleAssignCredit = async () => {
    const { error } = await assignCredit(id, creditForm);
    if (error) { toast.error(error); return; }
    toast.success('Credit timeline assigned!');
    setShowCreditModal(false);
    loadData();
  };

  if (loading) return <div className="flex-1"><Navbar title="Customer Profile" /><PageLoader /></div>;
  if (!customer) return <div className="flex-1 p-6"><p className="text-slate-400">Customer not found</p></div>;

  const analytics = summary?.analytics;
  const tier = analytics?.tier || getTier(analytics?.payment_score || 0);
  const score = analytics?.payment_score || 0;

  const statusData = [
    { name: 'On-Time', value: analytics?.on_time_count || 0, color: CHART_COLORS.emerald },
    { name: 'Late', value: analytics?.late_count || 0, color: CHART_COLORS.amber },
    { name: 'Overdue', value: analytics?.overdue_count || 0, color: CHART_COLORS.rose },
    { name: 'Pending', value: Math.max(0, (analytics?.total_invoices || 0) - (analytics?.on_time_count || 0) - (analytics?.late_count || 0) - (analytics?.overdue_count || 0)), color: CHART_COLORS.slate },
  ].filter(d => d.value > 0);

  const paymentColumns = [
    { key: 'invoice_number', label: 'Invoice #', sortable: true },
    { key: 'invoice_date', label: 'Invoice Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'due_date', label: 'Due Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'paid_amount', label: 'Paid', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'paid_date', label: 'Paid Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'days_late', label: 'Days Late', sortable: true, render: (v) => v > 0 ? <span className="text-rose-600 font-semibold">{v}</span> : <span className="text-emerald-600">0</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Customer Profile" />
      <div className="p-6 space-y-6">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>

        {/* Hero */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-sora text-2xl font-bold text-slate-800">{customer.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {customer.company && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{customer.company}</span>}
                {customer.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{customer.email}</span>}
                {customer.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{customer.phone}</span>}
              </div>
              {customer.gstin && <p className="text-xs text-slate-400">GSTIN: {customer.gstin}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/customers/edit/${id}`)} className="btn-secondary flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Details
              </button>
              <CreditBadge tier={tier} score={score} />
              <button onClick={() => setShowCreditModal(true)} className="btn-primary flex items-center gap-2">
                <Award className="w-4 h-4" /> Assign Credit
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoices', value: formatNumber(analytics?.total_invoices), color: 'text-slate-800' },
            { label: 'Total Amount', value: formatCurrency(analytics?.total_amount || 0), color: 'text-brand-600' },
            { label: 'Total Paid', value: formatCurrency(analytics?.total_paid || 0), color: 'text-emerald-600' },
            { label: 'Avg Days Late', value: `${(analytics?.avg_days_late || 0).toFixed(1)} days`, color: analytics?.avg_days_late > 15 ? 'text-rose-600' : 'text-slate-800' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">Payment Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} stroke="white" strokeWidth={3} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-slate-400 py-8">No data</p>}
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}: {d.value}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">Credit Score Gauge</h3>
            <div className="flex flex-col items-center justify-center h-[200px]">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={getTierColor(tier)} strokeWidth="10"
                    strokeDasharray={`${score * 3.14} ${314 - score * 3.14}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{score.toFixed(0)}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="text-sm font-medium mt-2" style={{ color: getTierColor(tier) }}>
                {tier} — {summary?.credit_days || getCreditDays(tier)} days credit
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-sora font-semibold text-lg text-slate-800">Payment History</h3>
          </div>
          <Table columns={paymentColumns} data={payments} />
        </div>
      </div>

      <Modal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} title="Assign Credit Timeline">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 mb-1 block">Credit Days</label>
            <select value={creditForm.credit_days} onChange={(e) => setCreditForm({ ...creditForm, credit_days: parseInt(e.target.value) })} className="input-field">
              {CREDIT_DAYS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-500 mb-1 block">Reason</label>
            <textarea value={creditForm.reason} onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
              className="input-field h-24 resize-none" placeholder="Reason for credit..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreditModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAssignCredit} className="btn-primary">Assign Credit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
