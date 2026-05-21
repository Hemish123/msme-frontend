import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as inventoryAPI from '../../api/inventoryAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Download, AlertTriangle, TrendingUp, Package, ShoppingCart, Users, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
const STATUS_COLORS = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  RECEIVED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

function MiniStatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg shadow-slate-200/30 group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-xl shadow-md group-hover:-translate-y-0.5 transition-transform`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function SalesReportContent({ data }) {
  if (!data) return <div className="flex items-center justify-center h-full text-slate-400">No data available</div>;

  const hasMonthlyData = data.monthly_breakdown?.length > 0;
  const hasTopProducts = data.top_products?.length > 0;
  const hasRecentSales = data.recent_sales?.length > 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStatCard title="Total Revenue" value={`₹${(data.total_revenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-emerald-600" bgColor="bg-emerald-50" />
        <MiniStatCard title="Total Sales" value={data.total_sales_count || 0} icon={ShoppingCart} color="text-blue-600" bgColor="bg-blue-50" />
        <MiniStatCard title="Completed" value={data.completed_count || 0} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
        <MiniStatCard title="Pending" value={data.pending_count || 0} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
        <MiniStatCard title="Cancelled" value={data.cancelled_count || 0} icon={XCircle} color="text-rose-600" bgColor="bg-rose-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Monthly Revenue Trend</h3>
          {hasMonthlyData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_breakdown}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No monthly data yet. Complete some sales to see trends.</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Top Products by Revenue</h3>
          {hasTopProducts ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_products} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No product data yet.</div>
          )}
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Sales</h3>
        {hasRecentSales ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 pr-4 font-medium">ID</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Items</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_sales.map(sale => (
                  <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4 text-sm font-medium text-slate-700">SALE-{sale.id}</td>
                    <td className="py-3 pr-4 text-sm text-slate-600">{sale.customer_name}</td>
                    <td className="py-3 pr-4 text-sm text-slate-500">{new Date(sale.sale_date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 pr-4 text-sm text-slate-500">{sale.items_count} items</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[sale.status] || 'bg-slate-100 text-slate-600'}`}>{sale.status}</span>
                    </td>
                    <td className="py-3 text-sm font-bold text-slate-800 text-right">₹{sale.total_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">No sales recorded yet. Create your first sale to see data here.</div>
        )}
      </div>
    </div>
  );
}

function PurchaseReportContent({ data }) {
  if (!data) return <div className="flex items-center justify-center h-full text-slate-400">No data available</div>;

  const hasMonthlyData = data.monthly_breakdown?.length > 0;
  const hasTopProducts = data.top_products?.length > 0;
  const hasTopSuppliers = data.top_suppliers?.length > 0;
  const hasRecentPurchases = data.recent_purchases?.length > 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStatCard title="Total Spend" value={`₹${(data.total_spend || 0).toLocaleString()}`} icon={Package} color="text-blue-600" bgColor="bg-blue-50" />
        <MiniStatCard title="Total Orders" value={data.total_purchase_count || 0} icon={ShoppingCart} color="text-violet-600" bgColor="bg-violet-50" />
        <MiniStatCard title="Received" value={data.received_count || 0} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-50" />
        <MiniStatCard title="Pending" value={data.pending_count || 0} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
        <MiniStatCard title="Cancelled" value={data.cancelled_count || 0} icon={XCircle} color="text-rose-600" bgColor="bg-rose-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Trend */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Monthly Spend Trend</h3>
          {hasMonthlyData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_breakdown}>
                  <defs>
                    <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Spend']} />
                  <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fill="url(#purchaseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No monthly data yet. Receive some purchases to see trends.</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Top Products by Spend</h3>
          {hasTopProducts ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_products} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Spend']} />
                  <Bar dataKey="spend" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No product data yet.</div>
          )}
        </div>
      </div>

      {/* Top Suppliers + Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Suppliers */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Top Suppliers</h3>
          {hasTopSuppliers ? (
            <div className="space-y-3">
              {data.top_suppliers.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.orders} orders</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">₹{s.spend.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No supplier data yet.</div>
          )}
        </div>

        {/* Recent Purchases Table */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Purchases</h3>
          {hasRecentPurchases ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 pr-4 font-medium">ID</th>
                    <th className="pb-3 pr-4 font-medium">Supplier</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Items</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_purchases.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4 text-sm font-medium text-slate-700">PO-{p.id}</td>
                      <td className="py-3 pr-4 text-sm text-slate-600">{p.supplier_name}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{new Date(p.purchase_date).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{p.items_count} items</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                      </td>
                      <td className="py-3 text-sm font-bold text-slate-800 text-right">₹{p.total_amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No purchases recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stock');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const TAB_TO_REPORT_TYPE = {
    'stock': 'stock-summary',
    'low-stock': 'low-stock',
    'sales': 'sales-summary',
    'purchases': 'purchase-summary',
  };

  const handleExportPDF = async () => {
    if (!reportData || exporting) return;
    setExporting(true);
    alert('Starting PDF export... If you see this, the new code is loaded!');
    console.log('PDF Export triggered for:', activeTab);
    const reportType = TAB_TO_REPORT_TYPE[activeTab];
    const result = await inventoryAPI.exportReportPDF(reportType);
    if (result.error) {
      console.error('PDF export failed:', result.error);
      alert(`Failed to export PDF: ${result.error}`);
    } else {
      alert('PDF export successful!');
    }
    setExporting(false);
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const fetchReport = async (tab) => {
    setLoading(true);
    setReportData(null);
    let result = { data: null, error: null };
    
    if (tab === 'stock') {
      result = await inventoryAPI.getStockSummaryReport();
    } else if (tab === 'low-stock') {
      result = await inventoryAPI.getLowStockReport();
    } else if (tab === 'sales') {
      result = await inventoryAPI.getSalesSummaryReport();
    } else if (tab === 'purchases') {
      result = await inventoryAPI.getPurchaseSummaryReport();
    }
    
    if (!result.error && result.data) {
      setReportData(result.data);
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'stock', label: 'Stock Report' },
    { id: 'low-stock', label: 'Low Stock Alert' },
    { id: 'sales', label: 'Sales Report' },
    { id: 'purchases', label: 'Purchase Report' }
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-sora font-bold text-slate-800">Inventory Reports</h1>
          <p className="text-slate-500 mt-1">Analytics and summaries for your inventory</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={!reportData || loading || exporting}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {exporting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Exporting...</>
          ) : (
            <><Download className="w-5 h-5" /> Export PDF</>
          )}
        </button>
      </div>

      <div className="flex border-b border-slate-200 mb-6 space-x-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
              <span>Loading report data...</span>
            </div>
          </div>
        ) : (
          <div id="report-content" className="p-4 bg-slate-50 min-h-full">
            {activeTab === 'stock' && Array.isArray(reportData) && (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Current Stock Summary</h2>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                      <th className="p-3 font-medium">Product Name</th>
                      <th className="p-3 font-medium text-center">Stock</th>
                      <th className="p-3 font-medium text-right">Unit Cost</th>
                      <th className="p-3 font-medium text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="p-3 text-sm text-slate-800">{p.name}</td>
                        <td className="p-3 text-sm font-semibold text-slate-700 text-center">{p.current_stock}</td>
                        <td className="p-3 text-sm text-slate-600 text-right">₹{p.cost_price}</td>
                        <td className="p-3 text-sm font-medium text-brand-600 text-right">₹{(p.current_stock * p.cost_price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'low-stock' && Array.isArray(reportData) && (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-lg">
                 <h2 className="text-xl font-bold text-rose-700 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Low Stock Alerts</h2>
                 {reportData.length === 0 ? (
                   <p className="text-slate-500 py-8 text-center">All products have sufficient stock.</p>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {reportData.map(p => (
                       <div key={p.id} className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                         <h3 className="font-bold text-rose-900">{p.name}</h3>
                         <div className="mt-2 flex justify-between items-center text-sm text-rose-700">
                           <span>Current: <strong className="text-rose-900">{p.current_stock}</strong></span>
                           <span>Min Level: <strong>{p.minimum_stock_level}</strong></span>
                         </div>
                         <button 
                           onClick={() => navigate('/inventory/purchases')}
                           className="mt-4 w-full py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
                         >
                           Create Purchase Order
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'sales' && <SalesReportContent data={reportData} />}
            {activeTab === 'purchases' && <PurchaseReportContent data={reportData} />}
          </div>
        )}
      </div>
    </div>
  );
}
