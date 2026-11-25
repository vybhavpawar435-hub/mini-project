import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Lock, Mail, AlertCircle, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(trimmedEmail, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else if (user.role === 'donor') navigate('/donor');
      else if (user.role === 'requester') navigate('/requester');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-200 mb-4">
          <Droplet className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          HemoSync Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Secure Blood Bank & Donor Slot Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs font-medium text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoGuide(!showDemoGuide)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-red-500" />
                Demo Credentials Guide
              </span>
              <span className="text-[11px] text-red-600 font-bold">
                {showDemoGuide ? 'Hide' : 'View Accounts'}
              </span>
            </button>

            {showDemoGuide && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <p className="text-[11px] text-slate-500 font-medium mb-1">
                  Click any role below to pre-fill test credentials:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectDemo('admin@bloodbank.com', 'password123')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-left hover:border-red-300 transition-colors"
                  >
                    <div className="font-bold text-slate-800">Admin</div>
                    <div className="text-[10px] text-slate-400 truncate">admin@bloodbank.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemo('staff@bloodbank.com', 'password123')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-left hover:border-red-300 transition-colors"
                  >
                    <div className="font-bold text-slate-800">Staff</div>
                    <div className="text-[10px] text-slate-400 truncate">staff@bloodbank.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemo('donor1@bloodbank.com', 'password123')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-left hover:border-red-300 transition-colors"
                  >
                    <div className="font-bold text-slate-800">Donor</div>
                    <div className="text-[10px] text-slate-400 truncate">donor1@bloodbank.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemo('requester@bloodbank.com', 'password123')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-left hover:border-red-300 transition-colors"
                  >
                    <div className="font-bold text-slate-800">Requester</div>
                    <div className="text-[10px] text-slate-400 truncate">requester@bloodbank.com</div>
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-1">
                  Default password for demo accounts: <code className="font-mono text-slate-600">password123</code>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              New blood donor?{' '}
              <Link to="/register" className="font-semibold text-red-600 hover:text-red-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
