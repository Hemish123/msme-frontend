import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchStockMovements } from '../../store/inventorySlice';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function InventoryDashboard() {
  const dispatch = useDispatch();
  const { products, stockMovements, loading } = useSelector(state => state.inventory);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchStockMovements());
  }, [dispatch]);

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);
  const lowStockProducts = products.filter(p => p.current_stock <= p.minimum_stock_level && p.current_stock > 0);
  const outOfStockProducts = products.filter(p => p.current_stock === 0);

  // Top 5 products by stock value
  const topProductsData = [...products]
    .map(p => ({ name: p.name, value: p.current_stock * p.cost_price }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recentMovements = [...stockMovements]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="p-8 h-full overflow-y-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-sora font-bold text-slate-800">Inventory Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your stock, value, and recent movements</p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
              <p className="text-sm text-amber-600">{lowStockProducts.length} items are running low on stock.</p>
            </div>
          </div>
          <Link to="/inventory/products" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors">
            View Items
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={totalProducts} icon={Package} color="bg-blue-500" />
        <StatCard title="Total Stock Value" value={`₹${totalValue.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Low Stock Items" value={lowStockProducts.length} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard title="Out of Stock" value={outOfStockProducts.length} icon={TrendingDown} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Top Products by Value</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `₹${value}`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Movements</h2>
            <Link to="/inventory/stock-movements" className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</Link>
          </div>
          <div className="space-y-4">
            {recentMovements.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">No recent movements</p>
            ) : (
              recentMovements.map(movement => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${movement.movement_type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {movement.movement_type === 'IN' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{movement.product_name}</p>
                      <p className="text-xs text-slate-500">{new Date(movement.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${movement.movement_type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                    </span>
                    <p className="text-xs text-slate-400">{movement.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40 group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-2xl shadow-lg group-hover:-translate-y-1 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
