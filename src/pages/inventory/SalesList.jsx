import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSales, fetchProducts } from '../../store/inventorySlice';
import * as inventoryAPI from '../../api/inventoryAPI';
import { getCustomerDropdown } from '../../api/customerAPI';
import { Plus, CheckCircle, Clock, XCircle, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';



export default function SalesList() {
  const dispatch = useDispatch();
  const { sales, products, loading } = useSelector(state => state.inventory);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editId, setEditId] = useState(null);

  
  const [formData, setFormData] = useState({
    customer_name: '',
    sale_date: new Date().toISOString().split('T')[0],
    status: 'COMPLETED',
    items: [{ product: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    dispatch(fetchSales());
    dispatch(fetchProducts());
    loadCustomers();
  }, [dispatch]);

  const loadCustomers = async () => {
    const { data } = await getCustomerDropdown();
    if (data && data.data) {
      setCustomers(data.data);
    } else if (Array.isArray(data)) {
      setCustomers(data);
    } else {
      setCustomers([]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'product') {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].unit_price = selectedProduct.selling_price;
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product: '', quantity: 1, unit_price: 0 }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert item values to proper numbers
    const processedItems = formData.items.map(item => ({
      product: parseInt(item.product),
      quantity: parseInt(item.quantity) || 0,
      unit_price: parseFloat(item.unit_price) || 0,
    }));
    
    const total_amount = processedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    
    const payload = {
      ...formData,
      items: processedItems,
      total_amount: total_amount,
    };
    
    let error, data;
    if (editId) {
      const res = await inventoryAPI.updateSale(editId, payload);
      error = res.error;
      data = res.data;
    } else {
      const res = await inventoryAPI.createSale(payload);
      error = res.error;
      data = res.data;
    }
    setIsSubmitting(false);
    if (!error) {
      toast.success(data?.message || 'Sale recorded successfully');
      dispatch(fetchSales());
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ customer_name: '', sale_date: new Date().toISOString().split('T')[0], status: 'COMPLETED', items: [{ product: '', quantity: 1, unit_price: 0 }] });
    } else {
      alert(`Failed to save sale: ${JSON.stringify(error)}`);
    }
  };

  const handleEdit = (sale) => {
    setFormData({
      customer_name: sale.customer_name || '',
      sale_date: sale.sale_date.split('T')[0],
      status: sale.status,
      items: sale.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    });
    setEditId(sale.id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    const { error } = await inventoryAPI.deleteSale(deleteModal.id);
    setIsDeleting(false);
    if (!error) {
      toast.success("Sale deleted successfully");
      dispatch(fetchSales());
      setDeleteModal({ isOpen: false, id: null });
    } else {
      toast.error("Failed to delete sale");
    }
  };


  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-sora font-bold text-slate-800">Sales</h1>
          <p className="text-slate-500 mt-1">Manage direct sales and stock deductions</p>
        </div>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({ customer_name: '', sale_date: new Date().toISOString().split('T')[0], status: 'COMPLETED', items: [{ product: '', quantity: 1, unit_price: 0 }] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-5 h-5" /> Record Sale
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 flex-1 overflow-hidden">
        <div className="overflow-auto h-full p-2">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <tr className="text-slate-500 text-sm border-b border-slate-100">
                <th className="font-medium p-4">Sale ID</th>
                <th className="font-medium p-4">Date</th>
                <th className="font-medium p-4">Customer</th>
                <th className="font-medium p-4 text-right">Total Amount</th>
                <th className="font-medium p-4 text-center">Status</th>
                <th className="font-medium p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-700">SALE-{sale.id}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{sale.customer_name || 'Walk-in Customer'}</td>
                  <td className="p-4 text-sm font-bold text-slate-700 text-right">₹{sale.total_amount}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                      sale.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {sale.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5" />}
                      {sale.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                      {sale.status === 'CANCELLED' && <XCircle className="w-3.5 h-3.5" />}
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEdit(sale)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, id: sale.id })}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                      >
                        Delete
                      </button>
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editId ? 'Edit Sale' : 'Record Sale'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                  <input type="text" placeholder="Walk-in or type name" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none" list="customer-list" />
                  <datalist id="customer-list">
                    {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sale Date *</label>
                  <input required type="date" value={formData.sale_date} onChange={e => setFormData({...formData, sale_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none">
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">Line Items *</label>
                  <button type="button" onClick={addItem} className="text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-lg transition-colors">
                    + Add Item
                  </button>
                </div>
                
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <select required value={item.product} onChange={e => handleItemChange(index, 'product', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                          <option value="">Select Product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} (In stock: {p.current_stock})</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
                      </div>
                      <div className="w-32">
                        <input required type="number" min="0" step="0.01" placeholder="Price" value={item.unit_price} onChange={e => handleItemChange(index, 'unit_price', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
                      </div>
                      <button type="button" onClick={() => removeItem(index)} disabled={formData.items.length === 1} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="text-right pt-2 pr-12 text-slate-600 font-medium">
                    Total Amount: ₹{formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale record? This will completely remove it from your records."
        isLoading={isDeleting}
      />
    </div>
  );
}

