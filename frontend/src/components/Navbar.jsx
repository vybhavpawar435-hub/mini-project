import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/health');
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels = {
    admin: 'Administrator',
    staff: 'Clinical Staff',
    donor: 'Blood Donor',
    requester: 'Hospital Requester'
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 fixed top-0 right-0 left-0 lg:left-64 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          <span className="hidden sm:inline">
            {backendOnline ? 'System Connected' : 'Connection Lost'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
          {roleLabels[user?.role] || user?.role}
        </span>
      </div>
    </header>
  );
};
