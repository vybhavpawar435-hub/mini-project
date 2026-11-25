import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SchedulerQueueVisualizer } from '../components/SchedulerQueueVisualizer';
import { Check, Clock, Droplet, Heart, Package, RefreshCw, Users, X } from 'lucide-react';

export const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'scheduler' | 'users' | 'audit'
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/admin/scheduler')) setActiveTab('scheduler');
    else if (location.pathname.includes('/admin/users')) setActiveTab('users');
    else if (location.pathname.includes('/admin/audit')) setActiveTab('audit');
    else setActiveTab('overview');
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, userRes, auditRes, reqRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs?limit=25'),
        api.get('/requests')
      ]);

      if (dashRes.success) setStats(dashRes.data);
      if (userRes.success) setUsers(userRes.data || []);
      if (auditRes.success) setAuditLogs(auditRes.data || []);
      if (reqRes.success) setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrantBlood = async (requestId) => {
    setActionLoadingId(requestId);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/inventory/fulfilment', {
        request_id: requestId,
        notes: 'Granted by Administrator'
      });
      setMessage(res.message || 'Blood units granted and dispatched from inventory!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to grant blood. Check available stock for this blood group.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    setActionLoadingId(requestId);
    setError('');
    setMessage('');
    try {
      const res = await api.patch(`/requests/${requestId}/status`, { status });
      setMessage(res.message || `Request ${status}`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update request status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium">Loading system overview...</p>
      </div>
    );
  }

  const summary = stats?.summary || {};

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor blood inventory, grant blood requests, manage users, and configure OS scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'requests' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Requests ({requests.filter(r => ['pending', 'approved', 'partially_fulfilled'].includes(r.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'scheduler' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OS Scheduler
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'users' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'audit' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Logs
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl shadow-2xs transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered Donors</span>
                <Users className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1.5">{summary.total_donors || 0}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {summary.active_donors || 0} active eligible
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Appointments</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1.5">{summary.total_appointments || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {summary.confirmed_appointments || 0} confirmed • {summary.waiting_appointments || 0} waiting
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Available Stock</span>
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1.5">{summary.total_units_available || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Unexpired RBC units</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Requests</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1.5">{summary.pending_requests || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {summary.fulfilled_requests || 0} fulfilled
              </p>
            </div>
          </div>

          {/* Inventory Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="font-bold text-slate-900 text-base mb-3.5">Inventory by Blood Group</h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {(stats?.inventory_distribution || []).map((item) => (
                <div key={item.group_name} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-center">
                  <span className="text-sm font-black text-red-600">{item.group_name}</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">{item.units_available}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Units</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <h2 className="font-bold text-slate-900 text-base mb-3.5">Recent Donations</h2>
              <div className="space-y-2.5">
                {(stats?.recent_donations || []).length > 0 ? (
                  stats.recent_donations.map((don) => (
                    <div key={don.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{don.first_name} {don.last_name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{formatDate(don.donation_date)}</p>
                      </div>
                      <span className="font-bold text-red-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {don.blood_group} • {don.units_donated} Unit
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent donations recorded.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="font-bold text-slate-900 text-base">Recent Hospital Requests</h2>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2.5">
                {(stats?.recent_requests || []).length > 0 ? (
                  stats.recent_requests.map((req) => (
                    <div key={req.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{req.patient_name} • {req.hospital_name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Need: {req.units_requested} Units of <span className="font-bold text-red-600">{req.blood_group}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {['pending', 'approved', 'partially_fulfilled'].includes(req.status) && (
                          <button
                            onClick={() => handleGrantBlood(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Grant blood units from available inventory"
                          >
                            <Droplet className="w-3 h-3 fill-current" />
                            {actionLoadingId === req.id ? 'Granting...' : 'Grant Blood'}
                          </button>
                        )}
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                            disabled={actionLoadingId === req.id}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] transition-colors"
                            title="Approve request"
                          >
                            Approve
                          </button>
                        )}
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent hospital requests.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Hospital Blood Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">Approve requests and grant compatible units directly from blood bank inventory.</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">{requests.length} Total Requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient & Hospital</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units (Fulfilled / Req)</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{req.patient_name}</div>
                        <div className="text-[11px] text-slate-500">{req.hospital_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-extrabold text-red-700 bg-red-50 border border-red-200">
                          {req.blood_group}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900">{req.units_fulfilled || 0}</span> / {req.units_requested}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.urgency} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(req.request_date)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {['pending', 'approved', 'partially_fulfilled'].includes(req.status) && (
                            <button
                              onClick={() => handleGrantBlood(req.id)}
                              disabled={actionLoadingId === req.id}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <Droplet className="w-3 h-3 fill-current" />
                              Grant Blood
                            </button>
                          )}
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                                disabled={actionLoadingId === req.id}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                                disabled={actionLoadingId === req.id}
                                className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">No hospital requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'scheduler' && <SchedulerQueueVisualizer />}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Registered System Users</h2>
            <span className="text-xs text-slate-500">{users.length} Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Donations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{u.first_name} {u.last_name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-600">{u.blood_group || '—'}</td>
                    <td className="py-3.5 px-4 font-mono">{u.total_donations || 0}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            u.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-base">System Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recent authentication, booking, and inventory events.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.entity_type} #{log.entity_id}</td>
                    <td className="py-3 px-4 text-slate-600">{log.email || 'System'}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                      {log.new_values ? JSON.stringify(log.new_values) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
