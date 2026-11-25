import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, Clock, Droplet, History, MapPin, Plus, RefreshCw, X } from 'lucide-react';

export const DonorDashboard = () => {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [priorityLevel, setPriorityLevel] = useState(5);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'slots' | 'history'
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync tab with sidebar route
  useEffect(() => {
    if (location.pathname.includes('/donor/slots')) setActiveTab('slots');
    else if (location.pathname.includes('/donor/history')) setActiveTab('history');
    else setActiveTab('overview');
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, slotRes, apptRes, histRes] = await Promise.all([
        api.get('/donors/me'),
        api.get('/slots?status=open'),
        api.get('/appointments'),
        api.get('/donors/history')
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (slotRes.success) setSlots(slotRes.data || []);
      if (apptRes.success) setAppointments(apptRes.data || []);
      if (histRes.success) setHistory(histRes.data || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load donor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : '');

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setBookingLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post('/appointments/book', {
        slot_id: selectedSlot.id,
        priority_level: parseInt(priorityLevel, 10),
        notes: bookingNotes
      });

      setSuccessMessage(res.message || 'Donation slot booked successfully!');
      setSelectedSlot(null);
      setBookingNotes('');
      setActiveTab('overview');
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Booking failed. Slot may be full or already booked.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await api.delete(`/appointments/${appointmentId}`);
      setSuccessMessage('Appointment cancelled and slot capacity released.');
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium">Loading your donor portal...</p>
      </div>
    );
  }

  const activeBookings = appointments.filter((a) => ['waiting', 'confirmed'].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your blood donation appointments, browse open slots, and review your donation history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Bookings ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'slots' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Book Slot ({slots.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'history' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History ({history.length})
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Blood Group</span>
            <Droplet className="w-4 h-4 text-red-600 fill-current" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-1.5">{profile?.blood_group || '—'}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified ABO/Rh type</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Bookings</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{activeBookings.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Upcoming appointments</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Donations</span>
            <History className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{profile?.total_donations || 0}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed blood draws</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open Slots</span>
            <Calendar className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{slots.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Available for booking</div>
        </div>
      </div>

      {/* Tab 1: My Appointments */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">My Scheduled Appointments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Track your booking status or cancel eligible slots.</p>
            </div>
            <button
              onClick={() => setActiveTab('slots')}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Book New Slot
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Center Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {formatDate(appt.slot_date_formatted || appt.slot_date)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={appt.location}>
                        {appt.location}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          Level {appt.priority_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {['waiting', 'confirmed'].includes(appt.status) && (
                          <button
                            onClick={() => handleCancelBooking(appt.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">
                      <p className="text-sm font-medium text-slate-500">No appointments booked yet.</p>
                      <button
                        onClick={() => setActiveTab('slots')}
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Browse available donation slots →
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Available Slots */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Available Donation Slots</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select an open time slot to reserve your donation.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">{slots.length} Open Slots</span>
          </div>

          {slots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-red-300 transition-colors flex flex-col justify-between bg-slate-50/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        {formatDate(slot.slot_date)}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {slot.available_capacity} / {slot.capacity} left
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </p>

                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{slot.location}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedSlot(slot)}
                    disabled={slot.available_capacity <= 0}
                    className="w-full mt-4 py-2 px-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Reserve Slot
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              No open donation slots are currently available. Please check back later.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Donation History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-base">Completed Donation History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Clinical records of your completed blood donations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Donation Date</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Vitals Recorded</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length > 0 ? (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatDate(record.donation_date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-red-600">
                        {record.units_donated} Unit (RBC)
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        Hb: {record.hemoglobin_level || '14.2'} g/dL • BP: {record.blood_pressure || '120/80'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{record.location}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">
                      No past donation records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Confirm Slot Booking</h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSlot} className="space-y-4 mt-4 text-xs">
              <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-100">
                <p className="font-bold text-slate-900">{selectedSlot.location}</p>
                <p className="mt-1 text-red-700 font-medium">
                  {formatDate(selectedSlot.slot_date)} • {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </p>
                <p className="mt-1 text-slate-500">
                  Remaining spots: {selectedSlot.available_capacity}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Priority Level
                </label>
                <select
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value={1}>Level 1 — Urgent / Emergency</option>
                  <option value={3}>Level 3 — High Priority</option>
                  <option value={5}>Level 5 — Regular Donor (Standard)</option>
                  <option value={7}>Level 7 — Flexible Schedule</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any health notes or preferences..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-1/2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  {bookingLoading ? 'Reserving...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
