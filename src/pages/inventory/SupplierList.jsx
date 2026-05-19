import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers } from '../../store/inventorySlice';
import * as inventoryAPI from '../../api/inventoryAPI';
import { Plus, Search, Edit2, Mail, Phone, MapPin, Loader2, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';


export default function SupplierList() {
  const dispatch = useDispatch();
  const { suppliers, loading } = useSelector(state => state.inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', contact_person: '', phone: '', email: '', address: '', gstin: ''
  });


  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let error;
    if (editId) {
      const res = await inventoryAPI.updateSupplier(editId, formData);
      error = res.error;
    } else {
      const res = await inventoryAPI.createSupplier(formData);
      error = res.error;
    }
    setIsSubmitting(false);
    if (!error) {
      dispatch(fetchSuppliers());
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', gstin: '' });
    } else {
      alert(`Failed to save supplier: ${JSON.stringify(error)}`);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      gstin: supplier.gstin || ''
    });
    setEditId(supplier.id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    const { error } = await inventoryAPI.deleteSupplier(deleteModal.id);
    setIsDeleting(false);
    if (!error) {
      toast.success("Supplier deleted successfully");
      dispatch(fetchSuppliers());
      setDeleteModal({ isOpen: false, id: null });
    } else {
      toast.error("Failed to delete supplier");
    }
  };


  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-sora font-bold text-slate-800">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage your vendors and suppliers</p>
        </div>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', gstin: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-5 h-5" /> Add Supplier
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company or contact person..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{supplier.name}</h3>
                    <p className="text-sm text-slate-500">{supplier.contact_person || 'No Contact Person'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(supplier)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: supplier.id })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
                
                <div className="space-y-3 mt-6">
                  {supplier.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editId ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input name="contact_person" value={formData.contact_person} onChange={handleInputChange} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                  <input name="gstin" value={formData.gstin} onChange={handleInputChange} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-colors disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Supplier'}
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
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This will not remove their previous purchase history but they will no longer be available for new orders."
        isLoading={isDeleting}
      />
    </div>
  );
}

