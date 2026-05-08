import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import { getInventoryItems, deleteInventoryItem } from '../../api/inventoryAPI';
import { Package, Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InventoryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const pageSize = 20;

  const loadItems = async () => {
    setLoading(true);
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    const { data } = await getInventoryItems(params);
    if (data) {
      const payload = data.data || data;
      setItems(Array.isArray(payload) ? payload : payload.results || []);
      setTotalCount(payload.count || (Array.isArray(payload) ? payload.length : 0));
    }
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, [search, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    const { error } = await deleteInventoryItem(id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Item deleted'); loadItems(); }
  };

  const getStockClass = (qty) => {
    if (qty === 0) return 'bg-rose-50';
    if (qty < 10) return 'bg-amber-50';
    return '';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Inventory" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1 relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by product name or HSN..."
              className="input-field pl-10 w-full" />
          </div>
          <button onClick={() => navigate('/inventory/add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2744] text-white rounded-lg text-sm font-semibold hover:bg-[#243352] transition-all shadow-md">
            <Plus className="w-4 h-4" /> Add Inventory
          </button>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-6">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg mb-2 animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No inventory items yet.</p>
              <p className="text-sm text-slate-400 mt-1">Click + Add Inventory to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 text-left font-medium">Product Name</th>
                    <th className="px-5 py-3 text-left font-medium">HSN Code</th>
                    <th className="px-5 py-3 text-center font-medium">Unit</th>
                    <th className="px-5 py-3 text-right font-medium">Unit Price (₹)</th>
                    <th className="px-5 py-3 text-center font-medium">Tax %</th>
                    <th className="px-5 py-3 text-center font-medium">Stock Qty</th>
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-5 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${getStockClass(item.stock_quantity)}`}>
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{item.product_name}</td>
                      <td className="px-5 py-3 text-sm font-mono text-slate-500">{item.hsn_code}</td>
                      <td className="px-5 py-3 text-sm text-center text-slate-500">{item.unit}</td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-slate-700">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-sm text-center text-slate-500">{item.tax_percentage}%</td>
                      <td className="px-5 py-3 text-sm text-center">
                        <span className={`font-semibold ${item.stock_quantity === 0 ? 'text-rose-600' : item.stock_quantity < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {item.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{item.customer_name || '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => navigate(`/inventory/edit/${item.id}`)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors" title="Delete">
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{totalCount} items total</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary py-2 px-3 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary py-2 px-3 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
