import React from 'react';
import { Eye, Activity, ShieldCheck, MapPin, User, Server, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';

export default function Navbar({ 
  backendHealth, 
  onRefreshHealth, 
  currentUser, 
  onLogout, 
  onNavigateToAdmin, 
  onNavigateToLanding 
}) {
  const isHealthy = backendHealth?.status === 'healthy';
  const isAiHealthy = backendHealth?.pythonMicroservice?.status === 'healthy';
  const isDbConnected = backendHealth?.database?.status === 'connected';

  const operatorId = currentUser?.userId || 'ASHA-HYD-1092';
  const facilityName = currentUser?.facilityName || 'Medipally Sub-Center';
  const role = currentUser?.role || 'screener';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Portal Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateToLanding} title="Return to Portal Home">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                DRISHTI-AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-950/80 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/60">
                MoHFW &bull; ABHA Tele-Health
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              National Rural Tele-Ophthalmology &amp; Retinopathy Screening Portal
            </p>
          </div>
        </div>

        {/* Right Info Badges, User Session & Health */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Facility Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200" id="navbar-facility-name">{facilityName}</span>
          </div>

          {/* Operator / User Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-normal">
              {role === 'admin' ? 'Officer:' : 'Operator:'}
            </span>
            <span className="font-mono font-bold text-slate-200" id="navbar-operator-id">{operatorId}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
              role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-emerald-900 text-emerald-200'
            }`}>
              {role}
            </span>
          </div>

          {/* Switch to Admin Dashboard if admin */}
          {role === 'admin' && onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              id="navbar-admin-dash-btn"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-semibold transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Dash</span>
            </button>
          )}

          {/* Live Gateway Health */}
          <div
            onClick={onRefreshHealth}
            title={`Gateway: ${isHealthy ? 'Online' : 'Offline'} | AI Microservice: ${isAiHealthy ? 'Online' : 'Unreachable'} | DB: ${isDbConnected ? 'Connected' : 'Offline'}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer select-none transition-all ${
              isHealthy && isAiHealthy
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/60'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-950/60'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy && isAiHealthy ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthy && isAiHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className="font-semibold tracking-wide uppercase text-[11px]">
              {isHealthy && isAiHealthy ? 'AI ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              id="navbar-logout-btn"
              title="Logout & Return to Landing Page"
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:border-rose-800 border border-slate-700 text-slate-300 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
