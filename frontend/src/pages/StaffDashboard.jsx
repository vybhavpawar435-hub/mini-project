import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Users,
  X
} from 'lucide-react';

export const StaffDashboard = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'waiting' | 'confirmed' | 'donated' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApptForDonation, setSelectedApptForDonation] = useState(null);

  useEffect(() => {
    if (location.pathname.includes('/staff/queue')) {
      setActiveFilter('waiting');
    } else if (location.pathname.includes('/staff/inventory')) {
      document.getElementById('staff-inventory-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveFilter('all');
    }
  }, [location.pathname]);
  
  const [vitals, setVitals] = useState({
    hemoglobin_level: 14.5,
    blood_pressure: '120/80',
    temperature: 98.6,
    notes: 'Health screening passed. Normal donation.'
  });
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError('');
    try {
      const [apptRes, slotRes, invRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/slots'),
        api.get('/inventory')
      ]);

      if (apptRes.success) setAppointments(apptRes.data || []);
      if (slotRes.success) setSlots(slotRes.data || []);
      if (invRes.success) setInventory(invRes.data?.summary || []);
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
      setError(err.message || 'Failed to sync live data from server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds for live synchronization
    const timer = setInterval(() => loadData(false), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (apptId, newStatus) => {
    setError('');
    setMessage('');
    try {
      await api.patch(`/appointments/${apptId}/status`, { status: newStatus });
      setMessage(`Appointment status successfully updated to '${newStatus}'`);
      await loadData(false);
    } catch (err) {
      setError(err.message || 'Failed to update appointment status');
    }
  };

  const handleCancelBooking = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this donor booking? Capacity will be refunded.')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/appointments/${apptId}`);
      setMessage('Booking cancelled and slot capacity refunded.');
      await loadData(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleCompleteDonation = async (e) => {
    e.preventDefault();
    if (!selectedApptForDonation) return;

    setSubmittingDonation(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/inventory/donation', {
        appointment_id: selectedApptForDonation.id,
        hemoglobin_level: parseFloat(vitals.hemoglobin_level),
        blood_pressure: vitals.blood_pressure,
        temperature: parseFloat(vitals.temperature),
        notes: vitals.notes
      });

      setMessage(res.message || 'Donation committed! Unit added to inventory with 42-day expiry.');
      setSelectedApptForDonation(null);
      await loadData(false);
    } catch (err) {
      setError(err.message || 'Failed to record donation');
    } finally {
      setSubmittingDonation(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((appt) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'cancelled'
        ? ['cancelled', 'no_show', 'rejected'].includes(appt.status)
        : appt.status === activeFilter;

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : `${appt.first_name} ${appt.last_name} ${appt.email} ${appt.blood_group}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const waitingCount = appointments.filter((a) => a.status === 'waiting').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const donatedCount = appointments.filter((a) => a.status === 'donated').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold">Loading clinical schedule & inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Clinical Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time donor booking queue, triage reception, and blood inventory intake
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs flex items-center gap-2 self-start sm:self-auto transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Sync Live Bookings'}</span>
        </button>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bookings</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded in system</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Waiting in Queue</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{waitingCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting triage/check-in</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Confirmed Slots</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{confirmedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for blood draw</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Completed Donations</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{donatedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Committed to stock</div>
        </div>
      </div>

      {/* Main Donor Bookings Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              Donor Bookings & Clinical Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredAppointments.length} of {appointments.length} total bookings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search donor or blood group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setActiveFilter('waiting')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === 'waiting' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Waiting ({waitingCount})
              </button>
              <button
                onClick={() => setActiveFilter('confirmed')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === 'confirmed' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Confirmed ({confirmedCount})
              </button>
              <button
                onClick={() => setActiveFilter('donated')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === 'donated' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Donated ({donatedCount})
              </button>
              <button
                onClick={() => setActiveFilter('cancelled')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === 'cancelled' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Donor Name & Info</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Slot Schedule</th>
                <th className="py-3 px-4">Center Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {appt.first_name} {appt.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {appt.email} {appt.phone ? `• ${appt.phone}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-extrabold text-red-700 bg-red-50 border border-red-200">
                        {appt.blood_group}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {formatDate(appt.slot_date_formatted || appt.slot_date)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="truncate text-slate-600" title={appt.location}>
                        {appt.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 text-slate-700">
                        Level {appt.priority_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status === 'waiting' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                            title="Confirm donor arrival at clinic"
                          >
                            Confirm Arrival
                          </button>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => setSelectedApptForDonation(appt)}
                            className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Heart className="w-3 h-3 fill-current" />
                            Record Draw
                          </button>
                        )}
                        {['waiting', 'confirmed'].includes(appt.status) && (
                          <button
                            onClick={() => handleCancelBooking(appt.id)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Cancel booking and refund slot capacity"
                          >
                            Cancel
                          </button>
                        )}
                        {appt.status === 'donated' && (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <p className="text-sm font-medium">No bookings match the selected criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      New donor bookings made through the Donor Portal appear here automatically.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Slots & Capacity Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-slate-900 text-base">Donation Slots & Capacity Status</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {slots.length} Registered Centers / Slots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map((slot) => {
            const booked = slot.capacity - slot.available_capacity;
            const percent = Math.min(100, Math.round((booked / slot.capacity) * 100));
            return (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {formatDate(slot.slot_date)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        slot.available_capacity > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {slot.available_capacity > 0 ? `${slot.available_capacity} Left` : 'Full'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 mt-1 truncate" title={slot.location}>
                    <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                    {slot.location}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                    <span>Capacity: {booked} / {slot.capacity}</span>
                    <span>{percent}% Booked</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent >= 100 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Inventory Summary */}
      <div id="staff-inventory-section" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Blood Bank Inventory Summary</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Total Stock: {inventory.reduce((acc, i) => acc + parseInt(i.available_units || 0), 0)} Units
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {inventory.map((item) => (
            <div
              key={item.group_name}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center"
            >
              <span className="text-base font-black text-red-600">{item.group_name}</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5">{item.available_units}</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Units</span>
            </div>
          ))}
        </div>
      </div>

      {/* Record Donation Vitals Modal */}
      {selectedApptForDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600 fill-current" />
                <h3 className="font-bold text-slate-900 text-base">Record Blood Donation</h3>
              </div>
              <button
                onClick={() => setSelectedApptForDonation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Donor: </span>
                <span className="font-bold text-slate-900">
                  {selectedApptForDonation.first_name} {selectedApptForDonation.last_name}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Group: </span>
                <span className="font-black text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                  {selectedApptForDonation.blood_group}
                </span>
              </div>
            </div>

            <form onSubmit={handleCompleteDonation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hemoglobin (g/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={vitals.hemoglobin_level}
                    onChange={(e) => setVitals({ ...vitals, hemoglobin_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="120/80"
                    value={vitals.blood_pressure}
                    onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Notes
                </label>
                <textarea
                  rows="2"
                  value={vitals.notes}
                  onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApptForDonation(null)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDonation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submittingDonation ? (
                    <span>Committing...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Commit to Inventory</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
