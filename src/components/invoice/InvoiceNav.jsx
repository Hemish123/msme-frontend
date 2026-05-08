import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function InvoiceNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show the button if not already on the create page
  const isOnCreatePage = location.pathname === '/invoice/create';

  if (isOnCreatePage) return null;

  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={() => navigate('/invoice/create')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
          bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg shadow-emerald-600/20"
      >
        <Plus className="w-4 h-4" />
        Create Invoice
      </button>
    </div>
  );
}
