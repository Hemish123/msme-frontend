import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Download, Check } from 'lucide-react';
import InvoiceItemRow from '../../components/invoice/InvoiceItemRow';
import { getCustomerDropdown } from '../../api/customerAPI';
import { getInventoryDropdown } from '../../api/inventoryAPI';
import { createInvoice, getNextInvoiceNumber, getInvoicePDFUrl, getInvoiceTemplates } from '../../api/invoiceAPI';

const emptyItem = {
  inventory_item: '', description: '', note_for_product: '',
  hsn_code: '', quantity: 1, unit: '', unit_price: 0, tax_percentage: 0,
};

const TEMPLATE_COLORS = {
  classic: { bg: 'bg-red-50', border: 'border-red-400', ring: 'ring-red-400', icon: '📋', accent: 'text-red-600' },
  modern: { bg: 'bg-blue-50', border: 'border-blue-400', ring: 'ring-blue-400', icon: '🏢', accent: 'text-blue-600' },
  elegant: { bg: 'bg-amber-50', border: 'border-amber-400', ring: 'ring-amber-400', icon: '✨', accent: 'text-amber-600' },
  minimal: { bg: 'bg-slate-50', border: 'border-slate-400', ring: 'ring-slate-400', icon: '◻️', accent: 'text-slate-600' },
};

const today = () => new Date().toISOString().split('T')[0];

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const [form, setForm] = useState({
    customer: '', order_date: today(), billing_date: today(),
    billing_to: '', shipping_to: '', order_reference: '',
    payment_terms: '', note: '',
  });

  const [items, setItems] = useState([{ ...emptyItem }]);

  // Fetch customers + next number + templates on mount
  useEffect(() => {
    (async () => {
      const [custRes, numRes, tplRes] = await Promise.all([
        getCustomerDropdown(),
        getNextInvoiceNumber(),
        getInvoiceTemplates(),
      ]);
      if (custRes.data) setCustomers(custRes.data.data || custRes.data);
      if (numRes.data) setInvoiceNumber(numRes.data.invoice_number);
      if (tplRes.data) setTemplates(tplRes.data);
    })();
  }, []);

  // Fetch products on mount
  useEffect(() => {
    (async () => {
      const { data } = await getInventoryDropdown();
      if (data) setProducts(data);
    })();
  }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCustomerChange = (e) => {
    const id = e.target.value;
    const cust = customers.find((c) => String(c.id) === id);
    setForm({
      ...form,
      customer: id,
      billing_to: cust?.registered_address || '',
      shipping_to: cust?.registered_address || '',
    });
  };

  const handleItemChange = (index, updatedItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);

  // Live totals
  const { subtotal, taxTotal, grandTotal } = useMemo(() => {
    let sub = 0, tax = 0;
    items.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxPct = parseFloat(item.tax_percentage) || 0;
      const lineBase = qty * price;
      sub += lineBase;
      tax += lineBase * (taxPct / 100);
    });
    return { subtotal: sub, taxTotal: tax, grandTotal: sub + tax };
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer) { toast.error('Please select a customer'); return; }
    if (!items[0]?.description) { toast.error('Add at least one item'); return; }

    setLoading(true);
    const payload = {
      ...form,
      invoice_number: invoiceNumber,
      template: selectedTemplate,
      items: items.map((item) => ({
        ...item,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        tax_percentage: parseInt(item.tax_percentage) || 0,
        inventory_item: item.inventory_item || null,
      })),
    };

    const { data, error } = await createInvoice(payload);
    setLoading(false);

    if (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to create invoice');
    } else {
      const inv = data.data;
      const cust = customers.find((c) => String(c.id) === String(form.customer));
      toast.success(`✅ Invoice #${inv.invoice_number} generated & emailed to ${cust?.email || 'customer'}!`);
      setCreatedInvoiceId(inv.id);
      // Reset for new invoice
      setForm({ customer: '', order_date: today(), billing_date: today(),
        billing_to: '', shipping_to: '', order_reference: '', payment_terms: '', note: '' });
      setItems([{ ...emptyItem }]);
      // Refresh next number
      const numRes = await getNextInvoiceNumber();
      if (numRes.data) setInvoiceNumber(numRes.data.invoice_number);
    }
  };

  const inputClass = 'w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all';

  const formRows = [
    { label: 'Invoice Number', content: (
      <input value={invoiceNumber} readOnly className={`${inputClass} bg-slate-50 font-mono font-semibold text-indigo-600`} />
    )},
    { label: 'Customer Name', content: (
      <div className="flex items-center gap-2">
        <select name="customer" value={form.customer} onChange={handleCustomerChange} className={`${inputClass} bg-white flex-1`}>
          <option value="">-- Select Customer --</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.display_name || c.name}</option>)}
        </select>
        <button type="button" onClick={() => navigate('/customers/add')} className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> Add Customer
        </button>
      </div>
    )},
    { label: 'Order Date', content: (
      <input name="order_date" type="date" value={form.order_date} onChange={handleFormChange} className={inputClass} />
    )},
    { label: 'Billing Date', content: (
      <input name="billing_date" type="date" value={form.billing_date} onChange={handleFormChange} className={inputClass} />
    )},
    { label: 'Billing To', content: (
      <input name="billing_to" value={form.billing_to} onChange={handleFormChange} placeholder="Billing address" className={inputClass} />
    )},
    { label: 'Shipping to', content: (
      <input name="shipping_to" value={form.shipping_to} onChange={handleFormChange} placeholder="Shipping address" className={inputClass} />
    )},
    { label: 'Order Reference', content: (
      <input name="order_reference" value={form.order_reference} onChange={handleFormChange} placeholder="PO number or reference" className={inputClass} />
    )},
    { label: 'Payment Terms', content: (
      <input name="payment_terms" value={form.payment_terms} onChange={handleFormChange} placeholder="e.g. Net 30" className={inputClass} />
    )},
    { label: 'Note', content: (
      <textarea name="note" value={form.note} onChange={handleFormChange} rows={2} placeholder="Optional note for the invoice" className={`${inputClass} resize-none`} />
    )},
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 max-w-5xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Invoice Form
          </h2>

          {/* Table-style form rows */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            {formRows.map((row, i) => (
              <div key={row.label}
                className={`flex flex-col sm:flex-row ${i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                <div className="sm:w-[30%] px-4 py-3 flex items-center">
                  <span className="text-sm font-medium text-slate-600">{row.label}</span>
                </div>
                <div className="sm:w-[70%] px-4 py-2">
                  {row.content}
                </div>
              </div>
            ))}
          </div>

          {/* Template Selector */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Select Invoice Template</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((tpl) => {
                const colors = TEMPLATE_COLORS[tpl.key] || TEMPLATE_COLORS.classic;
                const isSelected = selectedTemplate === tpl.key;
                return (
                  <button key={tpl.key} type="button" onClick={() => setSelectedTemplate(tpl.key)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} shadow-md` : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{colors.icon}</div>
                    <div className={`font-semibold text-sm ${isSelected ? colors.accent : 'text-slate-700'}`}>{tpl.name}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Invoice Items</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-[#1a2744] text-white text-xs uppercase tracking-wide">
                    <th className="px-2 py-3 text-left font-medium" style={{ width: '20%' }}>Description</th>
                    <th className="px-2 py-3 text-left font-medium" style={{ width: '12%' }}>Note</th>
                    <th className="px-2 py-3 text-center font-medium" style={{ width: '10%' }}>HSN</th>
                    <th className="px-2 py-3 text-center font-medium" style={{ width: '8%' }}>Qty</th>
                    <th className="px-2 py-3 text-center font-medium" style={{ width: '7%' }}>Unit</th>
                    <th className="px-2 py-3 text-right font-medium" style={{ width: '12%' }}>Unit Price</th>
                    <th className="px-2 py-3 text-center font-medium" style={{ width: '7%' }}>Tax%</th>
                    <th className="px-2 py-3 text-right font-medium" style={{ width: '14%' }}>Amount</th>
                    <th className="px-2 py-3 text-center font-medium" style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <InvoiceItemRow
                      key={idx}
                      item={item}
                      index={idx}
                      products={products}
                      onChange={handleItemChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-[#1a2744] text-white rounded-lg text-sm font-medium
                         hover:bg-[#243352] transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Subtotal: <span className="font-medium text-slate-700">₹{subtotal.toFixed(2)}</span></p>
              <p className="text-sm text-slate-500">Tax: <span className="font-medium text-slate-700">₹{taxTotal.toFixed(2)}</span></p>
              <p className="text-xl font-bold text-slate-800">
                Total: <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Created invoice download link */}
          {createdInvoiceId && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <a href={getInvoicePDFUrl(createdInvoiceId)} target="_blank" rel="noreferrer"
                className="text-sm font-medium text-emerald-700 hover:underline">
                Download Last Invoice PDF →
              </a>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-lg hover:bg-emerald-700
                       transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md
                       hover:shadow-lg text-base">
            {loading ? 'Generating...' : '🧾 Generate Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
