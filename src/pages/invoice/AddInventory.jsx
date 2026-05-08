import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createInventoryItem } from '../../api/inventoryAPI';
import { getCustomerDropdown } from '../../api/customerAPI';
import { Plus } from 'lucide-react';

const UNIT_OPTIONS = ['Nos', 'Kg', 'Ltr', 'Mtr', 'Box', 'Pcs', 'Set', 'Pair', 'Dozen', 'Other'];
const TAX_OPTIONS = [0, 5, 12, 18, 28];

const initialForm = {
  customer: '', product_name: '', hsn_code: '',
  unit: 'Nos', unit_price: '', tax_percentage: 18,
  stock_quantity: '', description: '',
};

export default function AddInventory() {
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await getCustomerDropdown();
      if (data) setCustomers(data.data || data);
    })();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      customer: form.customer || null,
      unit_price: parseFloat(form.unit_price),
      stock_quantity: parseInt(form.stock_quantity),
      tax_percentage: parseInt(form.tax_percentage),
    };
    const { data, error } = await createInventoryItem(payload);
    setLoading(false);
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to add inventory item');
    } else {
      toast.success(`"${data.product_name}" added to inventory!`);
      setForm(initialForm);
      navigate('/inventory');
    }
  };

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all';

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Inventory</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Select Customer</label>
            <div className="flex items-center gap-2">
              <select name="customer" value={form.customer} onChange={handleChange}
                className={`${inputClass} bg-white flex-1`}>
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.display_name || c.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => navigate('/customers/add')} className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap flex items-center gap-0.5">
                <Plus className="w-3 h-3" /> Add Customer
              </button>
            </div>
          </div>

          {/* Product Name + HSN Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
              <input name="product_name" value={form.product_name} onChange={handleChange} required
                placeholder="Enter product name" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">HSN Code <span className="text-rose-500">*</span></label>
              <input name="hsn_code" value={form.hsn_code} onChange={handleChange} required
                placeholder="e.g. 8471" className={inputClass} />
            </div>
          </div>

          {/* Unit + Unit Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Unit <span className="text-rose-500">*</span></label>
              <select name="unit" value={form.unit} onChange={handleChange} className={`${inputClass} bg-white`}>
                {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Unit Price (₹) <span className="text-rose-500">*</span></label>
              <input name="unit_price" type="number" step="0.01" min="0" value={form.unit_price} onChange={handleChange} required
                placeholder="0.00" className={inputClass} />
            </div>
          </div>

          {/* Tax + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Tax % <span className="text-rose-500">*</span></label>
              <select name="tax_percentage" value={form.tax_percentage} onChange={handleChange} className={`${inputClass} bg-white`}>
                {TAX_OPTIONS.map((t) => <option key={t} value={t}>{t}%</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Stock Quantity <span className="text-rose-500">*</span></label>
              <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} required
                placeholder="0" className={inputClass} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Product Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Brief product description"
              className={`${inputClass} resize-none`} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a2744] text-white font-semibold py-3 rounded-lg hover:bg-[#243352]
                       transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md
                       hover:shadow-lg hover:shadow-[#1a2744]/20">
            {loading ? 'Adding...' : 'Add to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
}
