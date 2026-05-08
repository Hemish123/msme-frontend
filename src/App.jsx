import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ErrorBoundary from './components/common/ErrorBoundary';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
// Invoice module pages
import AddInvoiceCustomer from './pages/invoice/AddInvoiceCustomer';
import EditInvoiceCustomer from './pages/invoice/EditInvoiceCustomer';
import AddInventory from './pages/invoice/AddInventory';
import CreateInvoice from './pages/invoice/CreateInvoice';
import EditInvoice from './pages/invoice/EditInvoice';
import InvoiceDashboard from './pages/invoice/InvoiceDashboard';
// New pages
import AddCustomer from './pages/customers/AddCustomer';
import BulkUpload from './pages/customers/BulkUpload';
import InventoryList from './pages/inventory/InventoryList';
import EditInventoryPage from './pages/inventory/EditInventory';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><AppLayout><Customers /></AppLayout></PrivateRoute>} />
        <Route path="/customers/add" element={<PrivateRoute><AppLayout><AddCustomer /></AppLayout></PrivateRoute>} />
        <Route path="/customers/edit/:id" element={<PrivateRoute><AppLayout><AddCustomer /></AppLayout></PrivateRoute>} />
        <Route path="/customers/bulk-upload" element={<PrivateRoute><AppLayout><BulkUpload /></AppLayout></PrivateRoute>} />
        <Route path="/customers/:id" element={<PrivateRoute><AppLayout><CustomerProfile /></AppLayout></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><AppLayout><Upload /></AppLayout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><AppLayout><Analytics /></AppLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>} />
        {/* Inventory routes */}
        <Route path="/inventory" element={<PrivateRoute><AppLayout><InventoryList /></AppLayout></PrivateRoute>} />
        <Route path="/inventory/add" element={<PrivateRoute><AppLayout><AddInventory /></AppLayout></PrivateRoute>} />
        <Route path="/inventory/edit/:id" element={<PrivateRoute><AppLayout><EditInventoryPage /></AppLayout></PrivateRoute>} />
        {/* Invoice module routes */}
        <Route path="/invoice/add-customer" element={<PrivateRoute><AppLayout><AddInvoiceCustomer /></AppLayout></PrivateRoute>} />
        <Route path="/invoice/edit-customer/:id" element={<PrivateRoute><AppLayout><EditInvoiceCustomer /></AppLayout></PrivateRoute>} />
        <Route path="/invoice/add-inventory" element={<PrivateRoute><AppLayout><AddInventory /></AppLayout></PrivateRoute>} />
        <Route path="/invoice/create" element={<PrivateRoute><AppLayout><CreateInvoice /></AppLayout></PrivateRoute>} />
        <Route path="/invoice/edit/:id" element={<PrivateRoute><AppLayout><EditInvoice /></AppLayout></PrivateRoute>} />
        <Route path="/invoice/dashboard" element={<PrivateRoute><AppLayout><InvoiceDashboard /></AppLayout></PrivateRoute>} />
        {/* Redirects */}
        <Route path="/invoice/customers/add" element={<Navigate to="/customers/add" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
