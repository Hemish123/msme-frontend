import { useEffect, useState } from 'react';
import { FileText, IndianRupee, Clock, CheckCircle, Download, Pencil, Trash2, CheckCircle2, Search, Mail, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import InvoiceNav from '../../components/invoice/InvoiceNav';
import { getInvoiceStats, getInvoices, downloadInvoicePDF, deleteInvoice, updateInvoice, resendInvoiceEmail, scheduleInvoiceReminder } from '../../api/invoiceAPI';

const STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700',
};

export default function InvoiceDashboard() {
  const { user } = useAuth();
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

  const handleWhatsAppMessage = (inv) => {
    const mobile = inv.customer_mobile || "";
    if (!mobile) {
      toast.error("Customer mobile number not found.");
      return;
    }
    
    // Clean mobile number: remove spaces, dashes, etc.
    const cleanMobile = mobile.replace(/\D/g, '');
    const finalMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const pdfUrl = `${baseUrl}${inv.public_pdf_url}`;
    
    const message = `Hello ${inv.customer_name},\n\nThis is a reminder for your Invoice *#${inv.invoice_number}* from *${user?.company_name || 'our business'}*.\n\n*Amount:* ₹${parseFloat(inv.grand_total).toLocaleString('en-IN')}\n*Date:* ${inv.billing_date}\n\nYou can view/download your invoice PDF here:\n${pdfUrl}\n\nThank you!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${finalMobile}?text=${encodedMessage}`, '_blank');
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
                            <button 
                              onClick={() => handleWhatsAppMessage(inv)} 
                              className={`p-1.5 rounded-full transition-colors ${inv.status === 'PAID' ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-500 hover:bg-emerald-50'}`} 
                              title={inv.status === 'PAID' ? "Invoice already paid" : "Send WhatsApp Message"}
                              disabled={inv.status === 'PAID'}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                               </svg>
                            </button>
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
