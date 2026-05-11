import { useEffect, useState } from 'react';
import { FileText, IndianRupee, Clock, CheckCircle, Download, Pencil, Trash2, CheckCircle2, Search, Mail, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import InvoiceNav from '../../components/invoice/InvoiceNav';
import { getInvoiceStats, getInvoices, downloadInvoicePDF, deleteInvoice, updateInvoice, resendInvoiceEmail, scheduleInvoiceReminder } from '../../api/invoiceAPI';

const STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700',
};

export default function InvoiceDashboard() {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', inv: null });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, inv: null, datetime: '' });
  const navigate = useNavigate();
  const pageSize = 20;

  const loadData = async () => {
    const [statsRes, invRes] = await Promise.all([
      getInvoiceStats(),
      getInvoices({ page_size: 100 }),
    ]);
    if (statsRes.data) setStats(statsRes.data);
    if (invRes.data) {
      const payload = invRes.data.data || invRes.data;
      setInvoices(Array.isArray(payload) ? payload : Array.isArray(payload.results) ? payload.results : []);
    }
  };

  useEffect(() => { (async () => { await loadData(); setLoading(false); })(); }, []);

  const handleDownload = async (inv) => {
    setDownloadingId(inv.id);
    try {
      const { data, error } = await downloadInvoicePDF(inv.id);
      if (data) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url; link.setAttribute('download', `Invoice_${inv.invoice_number.replace('/', '-')}.pdf`);
        document.body.appendChild(link); link.click(); link.remove();
      } else { toast.error(error || 'Failed to download PDF'); }
    } finally { setDownloadingId(null); }
  };

  const handleResendEmail = async (inv) => {
    if (inv.status === 'PAID') {
      toast.error('Cannot resend email for a PAID invoice.');
      return;
    }
    const { error } = await resendInvoiceEmail(inv.id);
    if (error) toast.error('Failed to resend email');
    else { toast.success(`Email resent to ${inv.customer_email || 'customer'}`); loadData(); }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await deleteInvoice(id); loadData();
  };

  const handlePaidToggle = (inv) => {
    setConfirmModal({ isOpen: true, type: inv.status === 'PAID' ? 'UNPAID' : 'PAID', inv });
  };

  const confirmTogglePaid = async () => {
    const inv = confirmModal.inv;
    const newStatus = confirmModal.type === 'PAID' ? 'PAID' : 'SENT';
    setConfirmModal({ isOpen: false, type: '', inv: null });
    const { error } = await updateInvoice(inv.id, { status: newStatus });
    if (!error) { toast.success(`Invoice #${inv.invoice_number} → ${newStatus}`); await loadData(); }
    else toast.error('Failed to update status.');
  };

  const handleScheduleReminder = async (e) => {
    e.preventDefault();
    const { inv, datetime } = scheduleModal;
    if (!datetime) return;
    
    const { error } = await scheduleInvoiceReminder(inv.id, datetime);
    if (!error) {
      toast.success(`Reminder scheduled for Invoice #${inv.invoice_number}`);
      setScheduleModal({ isOpen: false, inv: null, datetime: '' });
      await loadData();
    } else {
      toast.error(typeof error === 'string' ? error : 'Failed to schedule reminder');
    }
  };

  const filtered = invoices.filter(inv => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inv.invoice_number?.toLowerCase().includes(q) && !inv.customer_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paid = stats ? stats.total_revenue : 0;
  const pending = stats ? stats.pending_amount : 0;

  const statCards = stats ? [
    { label: 'Total Invoices', value: stats.total_invoices, icon: FileText, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Total Revenue', value: `₹${(paid + pending).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Paid', value: `₹${paid.toLocaleString('en-IN')}`, icon: CheckCircle, color: 'from-teal-500 to-teal-600' },
    { label: 'Pending', value: `₹${pending.toLocaleString('en-IN')}`, icon: Clock, color: 'from-amber-500 to-amber-600' },
  ] : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Invoices</h2>
        <InvoiceNav />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="relative overflow-hidden rounded-2xl shadow-sm border border-slate-100 p-5 bg-white">
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-gradient-to-br ${card.color} opacity-10`} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by customer or invoice number..."
                className="input-field pl-10 w-full" />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-44">
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {paged.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No invoices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 text-left font-medium">Invoice No</th>
                      <th className="px-5 py-3 text-left font-medium">Customer</th>
                      <th className="px-5 py-3 text-left font-medium">Date</th>
                      <th className="px-5 py-3 text-right font-medium">Amount</th>
                      <th className="px-5 py-3 text-center font-medium">Status</th>
                      <th className="px-5 py-3 text-center font-medium">Email Sent</th>
                      <th className="px-5 py-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(inv => (
                      <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono font-medium text-indigo-600">{inv.invoice_number}</td>
                        <td className="px-5 py-3 text-sm text-slate-700">{inv.customer_name}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{inv.billing_date}</td>
                        <td className="px-5 py-3 text-sm text-right font-semibold text-slate-700">₹{parseFloat(inv.grand_total).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[inv.status] || 'bg-slate-100 text-slate-600'}`}>{inv.status}</span>
                        </td>
                        <td className="px-5 py-3 text-center text-sm">
                          {inv.email_sent ? <span className="text-emerald-600 font-medium">✅ Sent</span> : <span className="text-slate-400">⏳ Pending</span>}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleDownload(inv)} disabled={downloadingId === inv.id} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="View PDF">
                              <Download className={`w-4 h-4 ${downloadingId === inv.id ? 'animate-bounce' : ''}`} />
                            </button>
                            <button 
                              onClick={() => handleResendEmail(inv)} 
                              className={`p-1.5 rounded-full transition-colors ${inv.status === 'PAID' ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`} 
                              title={inv.status === 'PAID' ? "Cannot resend paid invoice" : "Resend Email"}
                              disabled={inv.status === 'PAID'}
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setScheduleModal({ isOpen: true, inv, datetime: '' })}
                              className={`p-1.5 rounded-full transition-colors ${inv.status === 'PAID' ? 'text-slate-300 cursor-not-allowed' : 'text-violet-600 hover:bg-violet-50'}`}
                              title={inv.status === 'PAID' ? "Paid invoices need no reminder" : "Schedule Reminder"}
                              disabled={inv.status === 'PAID'}
                            >
                              <CalendarClock className="w-4 h-4" />
                            </button>
                            <button onClick={() => handlePaidToggle(inv)} className={`p-1.5 rounded-full transition-colors ${inv.status === 'PAID' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`} title="Mark Paid">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate(`/invoice/edit/${inv.id}`)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">{filtered.length} invoices</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-3 disabled:opacity-30">‹</button>
                <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-2 px-3 disabled:opacity-30">›</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${confirmModal.type === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Confirm Status</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              {confirmModal.type === 'PAID'
                ? `Mark Invoice #${confirmModal.inv?.invoice_number} as PAID?`
                : `Mark Invoice #${confirmModal.inv?.invoice_number} as UNPAID?`}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmModal({ isOpen: false, type: '', inv: null })} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={confirmTogglePaid} className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm ${confirmModal.type === 'PAID' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Reminder Modal */}
      {scheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-violet-100 text-violet-600">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Schedule Reminder</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Set a date and time to automatically send a reminder email for Invoice #{scheduleModal.inv?.invoice_number}.
            </p>
            
            {scheduleModal.inv?.reminder_scheduled_at && !scheduleModal.inv?.reminder_sent && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                Currently scheduled for:<br/>
                <b>{new Date(scheduleModal.inv.reminder_scheduled_at).toLocaleString()}</b>
              </div>
            )}
            
            <form onSubmit={handleScheduleReminder}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={scheduleModal.datetime}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, datetime: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setScheduleModal({ isOpen: false, inv: null, datetime: '' })} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm bg-violet-600 hover:bg-violet-700">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
