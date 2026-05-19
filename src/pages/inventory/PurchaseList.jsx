import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPurchases, fetchSuppliers, fetchProducts } from '../../store/inventorySlice';
import * as inventoryAPI from '../../api/inventoryAPI';
import { Plus, CheckCircle, Clock, XCircle, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';



export default function PurchaseList() {
  const dispatch = useDispatch();
  const { purchases, suppliers, products, loading } = useSelector(state => state.inventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editId, setEditId] = useState(null);

  
  const [formData, setFormData] = useState({
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    items: [{ product: '', quantity: 1, unit_cost: 0 }]
  });

  useEffect(() => {
    dispatch(fetchPurchases());
    dispatch(fetchSuppliers());
    dispatch(fetchProducts());
  }, [dispatch]);

  const markReceived = async (id) => {
    const { error } = await inventoryAPI.receivePurchase(id);
    if (!error) {
      dispatch(fetchPurchases());
    } else {
      console.error(error);
      alert("Failed to mark as received.");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'product') {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].unit_cost = selectedProduct.cost_price;
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product: '', quantity: 1, unit_cost: 0 }] });
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
      unit_cost: parseFloat(item.unit_cost) || 0,
    }));
    
    const total_amount = processedItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    
    const payload = {
      ...formData,
      supplier: parseInt(formData.supplier),
      items: processedItems,
      total_amount: total_amount,
    };
    
    let error, data;
    if (editId) {
      const res = await inventoryAPI.updatePurchase(editId, payload);
      error = res.error;
      data = res.data;
    } else {
      const res = await inventoryAPI.createPurchase(payload);
      error = res.error;
      data = res.data;
    }
    setIsSubmitting(false);
    if (!error) {
      toast.success(data?.message || 'Purchase order saved successfully');
      dispatch(fetchPurchases());
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ supplier: '', purchase_date: new Date().toISOString().split('T')[0], status: 'PENDING', items: [{ product: '', quantity: 1, unit_cost: 0 }] });
    } else {
      alert(`Failed to save purchase order: ${JSON.stringify(error)}`);
    }
  };

  const handleEdit = (purchase) => {
    setFormData({
      supplier: purchase.supplier,
      purchase_date: purchase.purchase_date.split('T')[0],
      status: purchase.status,
      items: purchase.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      }))
    });
    setEditId(purchase.id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    const { error } = await inventoryAPI.deletePurchase(deleteModal.id);
    setIsDeleting(false);
    if (!error) {
      toast.success("Purchase order deleted successfully");
      dispatch(fetchPurchases());
      setDeleteModal({ isOpen: false, id: null });
    } else {
      toast.error("Failed to delete purchase order");
    }
  };


  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-sora font-bold text-slate-800">Purchases</h1>
          <p className="text-slate-500 mt-1">Manage purchase orders and stock receiving</p>
        </div>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({ supplier: '', purchase_date: new Date().toISOString().split('T')[0], status: 'PENDING', items: [{ product: '', quantity: 1, unit_cost: 0 }] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-5 h-5" /> Create PO
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 flex-1 overflow-hidden">
        <div className="overflow-auto h-full p-2">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <tr className="text-slate-500 text-sm border-b border-slate-100">
                <th className="font-medium p-4">PO ID</th>
                <th className="font-medium p-4">Date</th>
                <th className="font-medium p-4">Supplier</th>
                <th className="font-medium p-4 text-right">Total Amount</th>
                <th className="font-medium p-4 text-center">Status</th>
                <th className="font-medium p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-700">PO-{purchase.id}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{purchase.supplier_name}</td>
                  <td className="p-4 text-sm font-bold text-slate-700 text-right">₹{purchase.total_amount}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      purchase.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 
                      purchase.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {purchase.status === 'RECEIVED' && <CheckCircle className="w-3.5 h-3.5" />}
                      {purchase.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                      {purchase.status === 'CANCELLED' && <XCircle className="w-3.5 h-3.5" />}
                      {purchase.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {purchase.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleEdit(purchase)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => markReceived(purchase.id)}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                        >
                          Mark Received
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: purchase.id })}
                          className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                        >
                          Delete
                        </button>
                      </>

                    )}
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
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editId ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
                  <select required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none">
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                  <input required type="date" value={formData.purchase_date} onChange={e => setFormData({...formData, purchase_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none" />
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
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
                      </div>
                      <div className="w-32">
                        <input required type="number" min="0" step="0.01" placeholder="Unit Cost" value={item.unit_cost} onChange={e => handleItemChange(index, 'unit_cost', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none" />
                      </div>
                      <button type="button" onClick={() => removeItem(index)} disabled={formData.items.length === 1} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="text-right pt-2 pr-12 text-slate-600 font-medium">
                    Total Amount: ₹{formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Purchase Order'}
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
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This will remove the record completely."
        isLoading={isDeleting}
      />
    </div>
  );
}

