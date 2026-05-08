import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/60 backdrop-blur-md">
      <div className="lg:ml-0 ml-12">
        <h1 className="font-sora font-bold text-xl text-slate-800">{title}</h1>
      </div>

      {/* User avatar — navigates to Settings */}
      <button
        onClick={() => navigate('/settings')}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 
                   flex items-center justify-center text-white font-bold text-sm shadow-md 
                   shadow-brand-500/20 hover:scale-105 transition-transform cursor-pointer"
        title="Profile & Settings"
      >
        {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
      </button>
    </header>
  );
}
