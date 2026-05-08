import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../api/authAPI';
import { downloadCustomerTemplate } from '../api/customerAPI';
import Navbar from '../components/common/Navbar';
import Modal from '../components/common/Modal';
import { User, Building2, Phone, Save, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, logout, deleteAccount } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    if (error) toast.error(error);
    else toast.success('Profile updated!');
    setSaving(false);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    const { data, error } = await downloadCustomerTemplate();
    if (data) {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customer_bulk_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded!');
    } else {
      toast.error(error || 'Download failed');
    }
    setDownloading(false);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Settings" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="font-sora text-lg font-semibold text-slate-800 mb-6">Profile Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-500/20">
                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">{user?.email}</p>
                <p className="text-sm text-slate-400">MSME Owner</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium"><User className="w-3 h-3" /> First Name</label>
                <input name="first_name" value={form.first_name} onChange={onChange} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium"><User className="w-3 h-3" /> Last Name</label>
                <input name="last_name" value={form.last_name} onChange={onChange} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium"><Building2 className="w-3 h-3" /> Company</label>
                <input name="company_name" value={form.company_name} onChange={onChange} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium"><Phone className="w-3 h-3" /> Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border border-rose-200">
          <h3 className="font-sora text-lg font-semibold text-rose-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Once you log out or delete your account, you'll need to sign in again.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={logout} className="btn-danger bg-rose-100 text-rose-600 hover:bg-rose-200">Logout</button>
            <button onClick={() => setShowDeleteModal(true)} className="btn-danger">Delete Account</button>
          </div>
        </div>

        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete your account? This action will deactivate your account. 
              You can reactivate it later by simply logging in again.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={async () => {
                const success = await deleteAccount();
                if (success) setShowDeleteModal(false);
              }} className="btn-danger">Yes, Deactivate My Account</button>
            </div>
          </div>
        </Modal>

        {/* Import Templates */}
        <div className="glass-card p-6">
          <h3 className="font-sora text-lg font-semibold text-slate-800 mb-2">Import Templates</h3>
          <p className="text-sm text-slate-500 mb-4">Download Excel templates for bulk importing data into MSME PayTrack.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadTemplate} disabled={downloading}
               className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md disabled:opacity-60">
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Customer Template (.xlsx)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
