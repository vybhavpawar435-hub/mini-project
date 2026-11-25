import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, AlertCircle, ArrowRight } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    blood_group: 'O+',
    date_of_birth: '1998-01-01',
    gender: 'Male',
    address: '',
    role: 'donor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      if (user.role === 'donor') navigate('/donor');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-200 mb-3">
          <Droplet className="w-7 h-7 fill-current" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Donor Registration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Join our life-saving voluntary donor network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs font-medium text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  name="first_name"
                  placeholder="e.g. Alex"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  name="last_name"
                  placeholder="e.g. Morgan"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                name="email"
                placeholder="alex.morgan@example.com"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password (min. 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Blood Group
                </label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-sm font-bold text-red-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1-555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-red-600 hover:text-red-700">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
