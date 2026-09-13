import React from 'react';
import { AlertOctagon, X, RefreshCw, CheckSquare, Camera, Lightbulb, UserCheck, Sparkles } from 'lucide-react';

export default function UngradableModal({ isOpen, onClose, rejectionReason, recapturingNotice }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950/60 relative flex flex-col gap-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-900/60 text-rose-400 px-2 py-0.5 rounded border border-rose-800">
                HTTP 400 &bull; Quality Gate Rejection
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Ungradable Retinal Acquisition
            </h3>
            <p className="text-xs text-rose-300/90 font-mono mt-0.5">
              {rejectionReason || 'Image rejected due to optical blur or improper illumination.'}
            </p>
          </div>
        </div>

        {/* Operator Guidance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            Standard Recapturing Protocol for Screener
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Patient Alignment:</strong> Ensure patient forehead and chin firmly contact the camera headrest. Re-align pupil center.
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Illumination &amp; Glare:</strong> Dim PHC room lights. Avoid direct overhead glare. Verify flash intensity setting (aim for mean brightness 40-220).
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Focus &amp; Diopter:</strong> Adjust the manual focus wheel until retinal vessel bifurcations are crisp (variance of Laplacian must reach &ge; 80.0).
              </div>
            </div>
          </div>
        </div>

        {/* Recapturing Notice banner */}
        {recapturingNotice && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300">
            {recapturingNotice}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Acknowledge &amp; Recapture Retinal Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
