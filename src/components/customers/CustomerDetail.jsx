import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { StatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getTier } from '../../utils/creditScore';
import { Building2, Mail, Phone, FileText } from 'lucide-react';

export default function CustomerDetail({ customer, payments, onClose }) {
  if (!customer) return null;

  const analytics = customer.analytics;
  const tier = analytics ? getTier(analytics.payment_score) : 'SILVER';

  return (
    <Modal isOpen={!!customer} onClose={onClose} title="Customer Details" size="xl">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              {customer.company && (
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{customer.company}</span>
              )}
              {customer.email && (
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>
              )}
            </div>
            {customer.gstin && <p className="text-xs text-slate-400 mt-1">GSTIN: {customer.gstin}</p>}
          </div>
          <Badge tier={tier} className="text-sm" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Invoices', value: analytics?.total_invoices || 0 },
            { label: 'Total Amount', value: formatCurrency(analytics?.total_amount || 0) },
            { label: 'Total Paid', value: formatCurrency(analytics?.total_paid || 0) },
            { label: 'Score', value: analytics?.payment_score?.toFixed(1) || '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Recent Payments
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {(customer.recent_payments || payments || []).slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm text-slate-700">{p.invoice_number}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.invoice_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-700">{formatCurrency(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
            {(!customer.recent_payments?.length && !payments?.length) && (
              <p className="text-sm text-slate-400 text-center py-4">No payment records</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
