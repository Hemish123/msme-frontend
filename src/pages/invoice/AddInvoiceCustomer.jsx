import { useState } from 'react';
import toast from 'react-hot-toast';
import InvoiceNav from '../../components/invoice/InvoiceNav';
import { createInvoiceCustomer } from '../../api/invoiceCustomerAPI';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const initialForm = {
  name: '', email: '', registered_address: '',
  contact_number: '', contact_person_1: '', contact_person_2: '',
  gst_number: '',
};

export default function AddInvoiceCustomer() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!GST_REGEX.test(form.gst_number)) {
      toast.error('Invalid GST number format');
      return;
    }
    setLoading(true);
    const { data, error } = await createInvoiceCustomer(form);
    setLoading(false);
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to create customer');
    } else {
      toast.success(`Customer "${data.name}" added successfully!`);
      setForm(initialForm);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <InvoiceNav active="customer" />

      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Customer</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Customer Name <span className="text-rose-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="Enter customer name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email <span className="text-rose-500">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="customer@example.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Registered Address <span className="text-rose-500">*</span></label>
            <textarea name="registered_address" value={form.registered_address} onChange={handleChange} required
              rows={3} placeholder="Street, City, State, Pincode"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none" />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact Number <span className="text-rose-500">*</span></label>
              <input name="contact_number" value={form.contact_number} onChange={handleChange} required
                placeholder="+91-XXXXXXXXXX"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact Person 1 <span className="text-rose-500">*</span></label>
              <input name="contact_person_1" value={form.contact_person_1} onChange={handleChange} required
                placeholder="Main Contact Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact Person 2</label>
              <input name="contact_person_2" value={form.contact_person_2} onChange={handleChange}
                placeholder="Alternate Contact Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">GST Number <span className="text-rose-500">*</span></label>
              <input name="gst_number" value={form.gst_number} onChange={handleChange} required
                placeholder="22AAAAA0000A1Z5" maxLength={15}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a2744] text-white font-semibold py-3 rounded-lg hover:bg-[#243352]
                       transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md
                       hover:shadow-lg hover:shadow-[#1a2744]/20">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
