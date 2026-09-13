import React, { useState, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Inbox,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { api } from '../utils/api';

export default function TelemedicineQueueDrawer({ onCaseApproved, refreshTrigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTelemedicineQueue();
      if (res.success) {
        setQueue(res.queue || []);
      }
    } catch (err) {
      console.warn('Could not fetch queue:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Polling every 15s
    const timer = setInterval(fetchQueue, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      fetchQueue();
    }
  }, [refreshTrigger]);

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    setApprovingId(id);
    try {
      await api.reviewCase(id, {
        reviewStatus: 'referred_district_hospital',
        specialistNotes: 'Referral confirmed by District Ophthalmologist for laser intervention.'
      });
      await fetchQueue();
      if (onCaseApproved) onCaseApproved(id);
    } catch (err) {
      alert('Failed to approve case: ' + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 shadow-2xl">
      {/* Drawer Toggle Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 border-t-2 border-indigo-500/80 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-850 select-none shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                District Hospital Telemedicine Queue
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                {queue.length} Pending Specialist Action
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live referrals escalated from rural Primary Health Centres (PHC Medipally)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fetchQueue(); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
            <span>{isOpen ? 'Minimize Queue' : 'Expand Queue Table'}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Drawer Content Table */}
      {isOpen && (
        <div className="bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 max-h-80 overflow-y-auto p-4 sm:p-6 animate-slideUp">
          {queue.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No pending specialist referrals in the triage queue.</p>
              <span className="text-[10px] text-slate-600">All referred patients have been reviewed or discharged.</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Patient / ABHA ID</th>
                    <th className="py-3 px-4">Origin PHC</th>
                    <th className="py-3 px-4">AI Severity Grade</th>
                    <th className="py-3 px-4">Model Confidence</th>
                    <th className="py-3 px-4">Submission Time</th>
                    <th className="py-3 px-4 text-right">Ophthalmologist Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queue.map((item) => {
                    const patient = item.patientId || {};
                    return (
                      <tr key={item._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">
                            {patient.patientName || 'Unknown Patient'}
                          </div>
                          <div className="font-mono text-[10px] text-cyan-400">
                            {patient.abhaId || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 font-medium">
                            {patient.phcFacilityId || 'PHC-MEDIPALLY'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 border border-rose-800 text-rose-300">
                            Grade {item.severityGrade} (Referable)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {item.confidence ? `${item.confidence.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={approvingId === item._id}
                            onClick={(e) => handleApprove(item._id, e)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95"
                          >
                            {approvingId === item._id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>Approve Referral</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
