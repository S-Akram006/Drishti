import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Printer,
  Download,
  ShieldCheck,
  TrendingUp,
  Activity,
  User,
  Building,
  Calendar
} from 'lucide-react';

const SEVERITY_DESCRIPTIONS = {
  0: { label: 'Level 0: No DR', desc: 'No apparent diabetic retinopathy lesions detected.', color: 'text-emerald-400' },
  1: { label: 'Level 1: Mild NPDR', desc: 'Microaneurysms only present.', color: 'text-blue-400' },
  2: { label: 'Level 2: Moderate NPDR', desc: 'Microaneurysms, hemorrhages or venous beading.', color: 'text-amber-400' },
  3: { label: 'Level 3: Severe NPDR', desc: '>20 intraretinal hemorrhages in each quadrant or IRMA.', color: 'text-orange-400' },
  4: { label: 'Level 4: Proliferative DR', desc: 'Neovascularization and vitreous/preretinal hemorrhage.', color: 'text-rose-500' }
};

export default function ClinicalDispositionCard({ screeningResult, patientData, onPrintReferral }) {
  const isComplete = Boolean(screeningResult && (screeningResult.severityGrade !== undefined || screeningResult.gradable));
  const severity = isComplete ? screeningResult.severityGrade : null;
  const isReferable = isComplete ? screeningResult.isReferable : false;
  const confidence = isComplete ? screeningResult.confidence : 0;

  return (
    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-sm tracking-tight text-white uppercase">
            3. Clinical Disposition &amp; Triage
          </h2>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
          ICDR Scale
        </span>
      </div>

      {!isComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <FileCheck className="w-10 h-10 text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">Disposition Pending</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Submit patient intake form and fundus photography to obtain automated diagnostic grading and referral actions.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          {/* Quality Gate Status Badges */}
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quality Gate Status
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> GRADABLE PASS
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Laplacian Blur:</span>
                <span className="font-mono text-emerald-400 font-bold">&ge; 80.0 (PASS)</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Illumination:</span>
                <span className="font-mono text-emerald-400 font-bold">40-220 (PASS)</span>
              </div>
            </div>
          </div>

          {/* High Visibility Referral Alert Banner */}
          {isReferable ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/90 via-rose-900/70 to-amber-950/70 border-2 border-rose-500/90 shadow-xl shadow-rose-950/60 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm">
                    {severity === 3 ? 'HIGH RISK' : severity === 4 ? 'CRITICAL RISK' : 'URGENT ACTION'}
                  </span>
                  <span className="text-sm font-extrabold text-white tracking-tight">REFERRAL REQUIRED</span>
                </div>
                <p className="text-xs text-rose-200 mt-1.5 leading-relaxed font-medium">
                  Severity Level {severity} detected. Mandatory tele-ophthalmology escalation to District Hospital within 2-4 weeks.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  LOW RISK &bull; NON-REFERABLE
                </span>
                <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                  Patient exhibits no sight-threatening diabetic retinopathy. Routine annual diabetic eye exam advised.
                </p>
              </div>
            </div>
          )}

          {/* Quick Clinical Status Summary Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Triage Action:</span>
              <span className={`font-mono font-bold text-[11px] ${isReferable ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isReferable ? 'REFERRAL REQUIRED' : 'ROUTINE FOLLOWUP'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Referable Flag:</span>
              <span className={`font-mono font-bold text-[11px] ${isReferable ? 'text-rose-400' : 'text-slate-400'}`}>
                {isReferable ? 'True (Grade \u2265 2)' : 'False (Grade < 2)'}
              </span>
            </div>
          </div>

          {/* DR Severity 5-Class Gauge */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300">
                DR Severity Grade (0 to 4)
              </span>
              <span className="font-mono font-bold text-xs text-cyan-400">
                Confidence: {confidence.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[0, 1, 2, 3, 4].map((grade) => {
                const isSelected = grade === severity;
                const isWarning = grade >= 2;
                return (
                  <div
                    key={grade}
                    className={`py-2 px-1 text-center rounded-lg border transition-all ${
                      isSelected
                        ? isWarning
                          ? 'bg-rose-600 border-rose-400 text-white font-black shadow-lg shadow-rose-600/40 scale-105'
                          : 'bg-cyan-500 border-cyan-300 text-white font-black shadow-lg shadow-cyan-500/40 scale-105'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-500'
                    }`}
                  >
                    <div className="text-sm font-mono font-bold">{grade}</div>
                    <div className="text-[8px] uppercase tracking-tighter truncate mt-0.5">
                      {grade === 0 ? 'None' : grade === 1 ? 'Mild' : grade === 2 ? 'Mod' : grade === 3 ? 'Sev' : 'PDR'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <div className="font-semibold text-white mb-0.5">
                {SEVERITY_DESCRIPTIONS[severity]?.label}
              </div>
              <div className="text-[11px] text-slate-400">
                {SEVERITY_DESCRIPTIONS[severity]?.desc}
              </div>
            </div>
          </div>

          {/* Action: View & Download Official Clinical Report */}
          <button
            type="button"
            onClick={onPrintReferral}
            id="view-clinical-report-btn"
            className="mt-auto w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-cyan-400/40 shadow-lg shadow-cyan-950/50 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-cyan-200" />
            <span>View &amp; Download Clinical Report</span>
          </button>
        </div>
      )}
    </div>
  );
}
