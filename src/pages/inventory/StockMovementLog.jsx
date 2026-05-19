import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockMovements } from '../../store/inventorySlice';
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

export default function StockMovementLog() {
  const dispatch = useDispatch();
  const { stockMovements, loading } = useSelector(state => state.inventory);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    dispatch(fetchStockMovements());
  }, [dispatch]);

  const filteredMovements = stockMovements
    .filter(m => filterType === 'ALL' || m.movement_type === filterType)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-sora font-bold text-slate-800">Stock Movements</h1>
          <p className="text-slate-500 mt-1">History of all inventory changes</p>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1">
          {['ALL', 'IN', 'OUT', 'ADJUSTMENT'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 flex-1 overflow-hidden">
        <div className="overflow-auto h-full p-2">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <tr className="text-slate-500 text-sm border-b border-slate-100">
                <th className="font-medium p-4">Date</th>
                <th className="font-medium p-4">Product</th>
                <th className="font-medium p-4">Type</th>
                <th className="font-medium p-4">Reason</th>
                <th className="font-medium p-4 text-right">Quantity</th>
                <th className="font-medium p-4">Ref ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(movement.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-800">{movement.product_name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      movement.movement_type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 
                      movement.movement_type === 'OUT' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {movement.movement_type === 'IN' ? <ArrowDownRight className="w-3.5 h-3.5" /> : 
                       movement.movement_type === 'OUT' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                      {movement.movement_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{movement.reason}</td>
                  <td className={`p-4 text-sm font-bold text-right ${
                    movement.movement_type === 'IN' ? 'text-emerald-600' : 
                    movement.movement_type === 'OUT' ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {movement.movement_type === 'IN' ? '+' : movement.movement_type === 'OUT' ? '-' : ''}{movement.quantity}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{movement.reference_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
