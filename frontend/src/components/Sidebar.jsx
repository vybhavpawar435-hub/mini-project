import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Droplet,
  GitBranch,
  History,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Package,
  PlusCircle,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
      isActive
        ? 'bg-red-50 text-red-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                HemoSync
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Blood Bank System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {role} Workspace
            </div>
            <nav className="space-y-1" onClick={onClose}>
              {role === 'donor' && (
                <>
                  <NavLink to="/donor" end className={linkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Overview & Bookings
                  </NavLink>
                  <NavLink to="/donor/slots" className={linkClass}>
                    <Calendar className="w-4 h-4" />
                    Book Donation Slot
                  </NavLink>
                  <NavLink to="/donor/history" className={linkClass}>
                    <History className="w-4 h-4" />
                    Donation History
                  </NavLink>
                </>
              )}

              {role === 'staff' && (
                <>
                  <NavLink to="/staff" end className={linkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Clinical Desk
                  </NavLink>
                  <NavLink to="/staff/queue" className={linkClass}>
                    <ListOrdered className="w-4 h-4" />
                    Donor Queue
                  </NavLink>
                  <NavLink to="/staff/inventory" className={linkClass}>
                    <Package className="w-4 h-4" />
                    Blood Inventory
                  </NavLink>
                </>
              )}

              {role === 'admin' && (
                <>
                  <NavLink to="/admin" end className={linkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    System Overview
                  </NavLink>
                  <NavLink to="/admin/scheduler" className={linkClass}>
                    <Clock className="w-4 h-4" />
                    OS Scheduler
                  </NavLink>
                  <NavLink to="/admin/users" className={linkClass}>
                    <Users className="w-4 h-4" />
                    Users
                  </NavLink>
                  <NavLink to="/admin/audit" className={linkClass}>
                    <ShieldCheck className="w-4 h-4" />
                    Audit Logs
                  </NavLink>
                </>
              )}

              {role === 'requester' && (
                <>
                  <NavLink to="/requester" end className={linkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Blood Requests
                  </NavLink>
                  <NavLink to="/requester/new" className={linkClass}>
                    <PlusCircle className="w-4 h-4" />
                    New Request
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              System Engines
            </div>
            <nav className="space-y-1" onClick={onClose}>
              <NavLink to="/engines/compatibility" className={linkClass}>
                <GitBranch className="w-4 h-4 text-red-500" />
                DSA Compatibility
              </NavLink>
              <NavLink to="/engines/scheduler" className={linkClass}>
                <Clock className="w-4 h-4 text-slate-500" />
                OS Slot Scheduler
              </NavLink>
              <NavLink to="/engines/inventory" className={linkClass}>
                <Package className="w-4 h-4 text-emerald-600" />
                DBMS Inventory
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 px-1 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
