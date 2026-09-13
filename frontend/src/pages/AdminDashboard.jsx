import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  LogOut, 
  Search, 
  ShieldAlert, 
  Filter, 
  Eye, 
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  FileSpreadsheet,
  MapPin,
  ExternalLink,
  UserPlus,
  Key,
  Phone,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';

export const AdminDashboard = ({ currentUser, onLogout, onNavigateToScreen }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Staff Onboarding Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState('');
  const [onboardSuccess, setOnboardSuccess] = useState(null);

  // Onboarding Form Fields
  const [operatorId, setOperatorId] = useState('');
  const [fullName, setFullName] = useState('');
  const [facilityName, setFacilityName] = useState('Cherlapally Primary Health Center');
  const [customFacility, setCustomFacility] = useState('');
  const [phone, setPhone] = useState('+91-98765-43217');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const PHC_FACILITY_PRESETS = [
    'Cherlapally Primary Health Center',
    'Pocharam Urban Primary Health Center',
    'Dammaiguda Health & Wellness Center',
    'Keesara Community Health Center',
    'Malkajgiri Urban Health Post',
    'Custom'
  ];

  const handleOpenOnboardModal = () => {
    // Determine next ASHA-HYD number
    const operators = stats?.operatorMetrics || stats?.operators || [];
    let nextNum = 1097;
    operators.forEach((op) => {
      const match = (op.operatorId || op.userId || '').match(/ASHA-HYD-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextNum) nextNum = num + 1;
      }
    });

    const suggestedId = `ASHA-HYD-${nextNum}`;
    setOperatorId(suggestedId);
    setPassword(`asha${nextNum}`);
    setFullName('');
    setFacilityName('Cherlapally Primary Health Center');
    setCustomFacility('');
    setPhone('+91-98765-43217');
    setOnboardError('');
    setOnboardSuccess(null);
    setCopied(false);
    setShowOnboardModal(true);
  };

  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    const finalFacility = facilityName === 'Custom' ? customFacility.trim() : facilityName.trim();
    if (!operatorId.trim() || !fullName.trim() || !finalFacility || !password.trim()) {
      setOnboardError('Please complete all required fields.');
      return;
    }

    setOnboardLoading(true);
    setOnboardError('');

    try {
      const res = await api.createStaff({
        operatorId: operatorId.trim().toUpperCase(),
        fullName: fullName.trim(),
        facilityName: finalFacility,
        phone: phone.trim() || '+91-98765-00000',
        password: password.trim(),
        role: 'screener'
      });

      if (res.success) {
        setOnboardSuccess({
          operatorId: res.operator.userId,
          fullName: res.operator.name,
          facilityName: res.operator.facilityName,
          password: password.trim()
        });
        // Immediately refresh operator statistics table
        await fetchStats();
      } else {
        setOnboardError(res.message || 'Failed to create operator.');
      }
    } catch (err) {
      setOnboardError(err.response?.data?.message || err.message || 'Error communicating with server.');
    } finally {
      setOnboardLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminStats();
      if (data.success) {
        setStats(data);
      } else {
        setError('Could not retrieve administrative stats.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend administrative gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getSeverityBadge = (grade, ungradable = false) => {
    if (ungradable || grade === -1 || grade === null) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
          Ungradable
        </span>
      );
    }
    switch (grade) {
      case 0:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            0: Normal
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
            1: Mild
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
            2: Moderate
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-orange-950/80 text-orange-300 border border-orange-800">
            3: Severe
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800 animate-pulse">
            4: Proliferative
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">Unknown</span>;
    }
  };

  const filteredLogs = (stats?.patientAuditLogs || stats?.recentScreenings)?.filter((log) => {
    const matchesSearch = 
      (log.abhaId && log.abhaId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.patientName && log.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.screenerOperatorId && log.screenerOperatorId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.phcFacilityId && log.phcFacilityId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (gradeFilter === 'ALL') return true;
    if (gradeFilter === 'REFERABLE') return log.isReferable;
    if (gradeFilter === 'UNGRADABLE') return !log.gradable;
    if (gradeFilter === 'NORMAL') return log.gradable && log.severityGrade === 0;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Tricolor Ribbon Header */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>

      {/* Top Bar */}
      <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  DRISHTI<span className="text-purple-400">-AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                  District Oversight Dashboard
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                Medipally Revenue Division • Hyderabad District Tele-Ophthalmology Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active User Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-slate-300 font-medium">{currentUser?.name || 'Dr. K. Srinivas'}</span>
              <span className="text-slate-500 font-mono">({currentUser?.userId || 'ADMIN-GOV-01'})</span>
            </div>

            <button
              onClick={handleOpenOnboardModal}
              id="admin-register-staff-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register New Screener / Staff</span>
            </button>

            <button
              onClick={onNavigateToScreen}
              id="admin-launch-screener-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Screener Tool</span>
            </button>

            <button
              onClick={fetchStats}
              disabled={loading}
              title="Refresh Data"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              id="admin-logout-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:border-rose-800 border border-slate-700 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Title & Division Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Government Administrative Oversight
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time epidemiological monitoring across 5 ASHA Primary Health Centers in Medipally Division.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-400">Jurisdiction:</span>
            <span className="text-xs font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
              Medipally (District Zone 4)
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchStats}
              className="text-xs underline font-semibold hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4 Aggregate KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI 1: Total Screenings */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Screenings
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white" id="kpi-total-screenings">
              {loading ? '...' : stats?.kpis?.totalScreenings || 0}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-blue-400 font-semibold">100%</span> logged with ABHA ID
            </p>
          </div>

          {/* KPI 2: Referable Cases */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Referable Cases (Grade 2+)
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-rose-400" id="kpi-referable-cases">
              {loading ? '...' : (stats?.kpis?.referableCount ?? stats?.kpis?.referableCases ?? 0)}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-rose-400 font-semibold">Immediate</span> triage required
            </p>
          </div>

          {/* KPI 3: Ungradable / Recaptures */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ungradable / Recaptures
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-400" id="kpi-ungradable-cases">
              {loading ? '...' : (stats?.kpis?.ungradableCount ?? stats?.kpis?.ungradableCases ?? 0)}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-amber-400 font-semibold">OpenCV Gate</span> triggered
            </p>
          </div>

          {/* KPI 4: Referral Escalation Rate */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Referral Escalation Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-300" id="kpi-referral-rate">
              {loading ? '...' : `${stats?.kpis?.referralRate || 0}%`}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-purple-400 font-semibold">High precision</span> triage
            </p>
          </div>
        </div>

        {/* Operator Performance Table */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>PHC Screener Operator Performance</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking all active ASHA field operators in Medipally division.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {(stats?.operatorMetrics || stats?.operators)?.length || 5} Active ASHA Stations
              </span>
              <button
                onClick={handleOpenOnboardModal}
                id="section-register-staff-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow transition-all active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register Staff</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="operator-performance-table">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Operator & ID</th>
                    <th className="px-5 py-3.5 font-bold">Assigned Facility</th>
                    <th className="px-5 py-3.5 font-bold text-center">Total Scans</th>
                    <th className="px-5 py-3.5 font-bold">Severity Breakdown (0-4)</th>
                    <th className="px-5 py-3.5 font-bold text-center">Quality Gate Rejections</th>
                    <th className="px-5 py-3.5 font-bold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-normal">
                  {(stats?.operatorMetrics || stats?.operators)?.map((op) => (
                    <tr key={op.operatorId || op.userId} className="hover:bg-slate-750/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{op.name}</div>
                        <div className="font-mono text-xs text-slate-400">{op.operatorId || op.userId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-medium">{op.facilityName}</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 ml-5">{op.facilityId}</div>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-white text-base">
                        {op.totalScans ?? op.totalScreenings ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        {/* 5-bar mini distribution */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-300 font-mono text-[11px]">{op.gradeBreakdown?.[0] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-slate-300 font-mono text-[11px]">{op.gradeBreakdown?.[1] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span className="text-slate-300 font-mono text-[11px]">{op.gradeBreakdown?.[2] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-slate-300 font-mono text-[11px]">{op.gradeBreakdown?.[3] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="text-slate-300 font-mono text-[11px]">{op.gradeBreakdown?.[4] || 0}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Norm / Mild / Mod / Sev / Prolif
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {(() => {
                          const rejCount = op.ungradableScans ?? op.ungradableCount ?? 0;
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              rejCount > 0 
                                ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                                : 'text-slate-500'
                            }`}>
                              {rejCount} {rejCount === 1 ? 'retake' : 'retakes'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {op.lastActive ? new Date(op.lastActive).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Patient Screening Audit Log */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Screening Audit Log & Patient Registry</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed record of all patient screenings performed under Medipally jurisdiction.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ABHA ID, Operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  id="admin-search-logs-input"
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-60"
                />
              </div>

              {/* Grade Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Records ({stats?.recentScreenings?.length || 0})</option>
                <option value="REFERABLE">Referable Only (Grade 2+)</option>
                <option value="NORMAL">Normal (Grade 0)</option>
                <option value="UNGRADABLE">Ungradable / Recaptures</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="patient-audit-table">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">ABHA ID & Patient</th>
                    <th className="px-5 py-3.5 font-bold">Operator ID</th>
                    <th className="px-5 py-3.5 font-bold">PHC Facility</th>
                    <th className="px-5 py-3.5 font-bold">DR Severity</th>
                    <th className="px-5 py-3.5 font-bold">Referral Status</th>
                    <th className="px-5 py-3.5 font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-normal">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                        No screening logs matched the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white text-xs">{log.patientName}</div>
                          <div className="font-mono text-[11px] text-slate-400">{log.abhaId}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {log.screenerOperatorId || 'ASHA-HYD-1092'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-300">
                          {log.phcFacilityId || 'PHC-MEDIPALLY-01'}
                        </td>
                        <td className="px-5 py-3.5">
                          {getSeverityBadge(log.severityGrade, !log.gradable)}
                        </td>
                        <td className="px-5 py-3.5">
                          {log.isReferable ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Refer to District Specialist</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Annual Follow-up</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {(log.createdAt || log.timestamp) ? new Date(log.createdAt || log.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Recent'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Staff Onboarding Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Register New PHC Screener / Staff</h3>
                  <p className="text-xs text-slate-400">MoHFW Ayushman Bharat Staff Onboarding</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOnboardModal(false);
                  setOnboardError('');
                  setOnboardSuccess(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {onboardError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{onboardError}</span>
              </div>
            )}

            {/* Success Notification View */}
            {onboardSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Staff Operator Successfully Registered!</span>
                  </div>
                  <p className="text-xs text-emerald-300/80">
                    The new screener account is active and immediately visible in the district performance roster.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans font-medium">Operator ID:</span>
                    <span className="font-bold text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {onboardSuccess.operatorId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans font-medium">Full Name:</span>
                    <span className="text-slate-200 font-sans font-semibold">{onboardSuccess.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400 font-sans font-medium">Assigned Facility:</span>
                    <span className="text-slate-300 font-sans">{onboardSuccess.facilityName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans font-medium">Initial Password:</span>
                    <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {onboardSuccess.password}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `DRISHTI-AI Screener Account:\nOperator ID: ${onboardSuccess.operatorId}\nPassword: ${onboardSuccess.password}\nFacility: ${onboardSuccess.facilityName}`;
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOnboardModal(false);
                      setOnboardSuccess(null);
                    }}
                    id="close-onboard-success-btn"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                  >
                    <span>Close &amp; View Roster</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
                {/* Operator ID */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Operator ID / Employee Code *
                    </label>
                    <span className="text-[11px] text-purple-400 font-mono">Format: ASHA-HYD-XXXX</span>
                  </div>
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    placeholder="e.g. ASHA-HYD-1097"
                    id="onboard-operator-id-input"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. R. Swapna (ASHA Worker)"
                    id="onboard-fullname-input"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Assigned Facility */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Assigned Primary Health Center / Facility *
                  </label>
                  <select
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    id="onboard-facility-select"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 mb-2"
                  >
                    {PHC_FACILITY_PRESETS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  {facilityName === 'Custom' && (
                    <input
                      type="text"
                      value={customFacility}
                      onChange={(e) => setCustomFacility(e.target.value)}
                      placeholder="Enter custom PHC or Sub-Center name"
                      id="onboard-custom-facility-input"
                      className="w-full bg-slate-950 border border-purple-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                      required
                    />
                  )}
                </div>

                {/* Mobile Number & Temporary Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91-98765-43217"
                      id="onboard-phone-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Temporary Password *
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. asha1097"
                      id="onboard-password-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOnboardModal(false);
                      setOnboardError('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={onboardLoading}
                    id="submit-create-staff-btn"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {onboardLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Registering Employee...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
