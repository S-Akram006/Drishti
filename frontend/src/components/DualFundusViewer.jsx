import React, { useState } from 'react';
import { Eye, Layers, ZoomIn, Info, HelpCircle, SplitSquareVertical } from 'lucide-react';

export default function DualFundusViewer({ rawImageUrl, gradcamImageUrl, isScreeningComplete, severityGrade }) {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'overlay'
  const [overlayOpacity, setOverlayOpacity] = useState(65);

  return (
    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col h-full">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-sm tracking-tight text-white uppercase">
            2. Dual Fundus &amp; Explainability Inspection
          </h2>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
              viewMode === 'overlay'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Alpha Blend
          </button>
        </div>
      </div>

      {/* Main Viewing Canvas */}
      <div className="flex-1 flex flex-col min-h-[380px]">
        {!rawImageUrl ? (
          <div className="flex-1 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">Awaiting Fundus Acquisition</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Upload a digital fundus photograph from the screener intake form to inspect optical structures and compute Grad-CAM activation maps.
            </p>
          </div>
        ) : viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* Raw Scan Container */}
            <div className="flex flex-col bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/80">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Raw Fundus Photo
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Original Capture</span>
              </div>
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden aspect-square sm:aspect-auto">
                <img
                  src={rawImageUrl}
                  alt="Raw Fundus Retinal Scan"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Grad-CAM Explainability Container */}
            <div className="flex flex-col bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/80">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  ResNet-50 Grad-CAM (layer4)
                </span>
                <span className="text-[10px] text-cyan-400/80 font-mono">XAI Attention</span>
              </div>
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden aspect-square sm:aspect-auto">
                {gradcamImageUrl ? (
                  <img
                    src={gradcamImageUrl}
                    alt="Grad-CAM Activation Map"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <Layers className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                    <span className="text-xs">Inference pending...</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Click "Run AI Screening Pipeline"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Overlay Alpha Mode */
          <div className="flex-1 flex flex-col bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/80">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Synchronized Superimposed Inspection
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Heatmap Alpha:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(e.target.value)}
                  className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-cyan-400">{overlayOpacity}%</span>
              </div>
            </div>
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px]">
              <img
                src={rawImageUrl}
                alt="Base Fundus"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {gradcamImageUrl && (
                <img
                  src={gradcamImageUrl}
                  alt="Grad-CAM Overlay"
                  style={{ opacity: overlayOpacity / 100 }}
                  className="absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity"
                />
              )}
            </div>
          </div>
        )}

        {/* Explainability Guidance Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Clinical Explainability Note:</strong> Warmer hues (red &amp; yellow) in the Grad-CAM representation denote retinal coordinates exerting highest gradient magnitude on the ResNet-50 final convolutional layer (<code className="text-cyan-400">layer4</code>), indicative of microaneurysms, hemorrhages, or neovascularization.
          </p>
        </div>
      </div>
    </div>
  );
}
