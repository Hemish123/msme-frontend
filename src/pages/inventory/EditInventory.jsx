import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import { getInventoryItem, updateInventoryItem } from '../../api/inventoryAPI';
import { getCustomerDropdown } from '../../api/customerAPI';

const UNIT_OPTIONS = ['Nos', 'Kg', 'Ltr', 'Mtr', 'Box', 'Pcs', 'Set', 'Pair', 'Dozen', 'Other'];
const TAX_OPTIONS = [0, 5, 12, 18, 28];

export default function EditInventory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      const [itemRes, custRes] = await Promise.all([getInventoryItem(id), getCustomerDropdown()]);
      if (itemRes.data) {
        const d = itemRes.data.data || itemRes.data;
        setForm({
          customer: d.customer || '', product_name: d.product_name || '', hsn_code: d.hsn_code || '',
          unit: d.unit || 'Nos', unit_price: d.unit_price || '', tax_percentage: d.tax_percentage || 18,
          stock_quantity: d.stock_quantity || 0, description: d.description || '',
        });
      }
      if (custRes.data) setCustomers(custRes.data.data || custRes.data);
      setFetching(false);
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, customer: form.customer || null, unit_price: parseFloat(form.unit_price), stock_quantity: parseInt(form.stock_quantity), tax_percentage: parseInt(form.tax_percentage) };
    const { error } = await updateInventoryItem(id, payload);
    setLoading(false);
    if (error) toast.error(typeof error === 'string' ? error : 'Failed to update');
    else { toast.success('Inventory item updated!'); navigate('/inventory'); }
  };

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all';

  if (fetching) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a2744] border-t-transparent rounded-full" /></div>;
  if (!form) return <div className="flex-1 p-6"><p className="text-slate-500">Item not found.</p></div>;

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Edit Inventory" />
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Customer</label>
              <select name="customer" value={form.customer} onChange={handleChange} className={`${inputClass} bg-white`}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
                <input name="product_name" value={form.product_name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">HSN Code <span className="text-rose-500">*</span></label>
                <input name="hsn_code" value={form.hsn_code} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange} className={`${inputClass} bg-white`}>
                  {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Unit Price (₹)</label>
                <input name="unit_price" type="number" step="0.01" value={form.unit_price} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tax %</label>
                <select name="tax_percentage" value={form.tax_percentage} onChange={handleChange} className={`${inputClass} bg-white`}>
                  {TAX_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Stock Quantity</label>
                <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/inventory')} className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#1a2744] text-white font-semibold rounded-lg hover:bg-[#243352] disabled:opacity-60 shadow-md">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
