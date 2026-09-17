import React, { useState, useEffect } from 'react';
import { Eye, ShieldCheck, X, ArrowLeft, Download, Loader2, Check } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function PrintableReferralSlip({ isOpen, onClose, patient, screening, rawImageUrl, gradcamImageUrl }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Bind Escape key listener to dismiss report view back to dashboard/screening
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !screening) return null;

  // Direct client-side PDF generation & download using html2pdf.js
  const handleDownloadReport = () => {
    const element = document.getElementById('printable-slip-content');
    if (!element) return;

    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    const opt = {
      margin: [6, 8, 6, 8],
      filename: `DRISHTI_Screening_${patient?.slipId || patient?.abhaId || 'Report'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Strip elements using oklch or force standard background/text colors on the report
          const clonedElement = clonedDoc.getElementById('printable-slip-content');
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#111827';
          }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      })
      .catch((err) => {
        console.error('html2pdf download error:', err);
      })
      .finally(() => {
        setIsDownloadingPdf(false);
      });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto report-modal-backdrop modal-backdrop"
      onClick={(e) => {
        // Dismiss when clicking the dark backdrop outside modal card
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-4 sm:my-auto report-modal-container flex flex-col">
        {/* Modal Top Navigation Bar (Pinned/Sticky & Hidden in Print) */}
        <div className="no-print sticky -top-5 sm:-top-7 bg-white/95 backdrop-blur-md z-30 flex flex-wrap items-center justify-between gap-3 pb-4 pt-3 mb-6 border-b border-slate-200 -mx-5 sm:-mx-7 px-5 sm:px-7 rounded-t-2xl shadow-sm">
          {/* Prominent, High-Contrast Back to Screening Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="back-to-screening-btn"
              onClick={onClose}
              title="Return to screening intake form (Esc)"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 border border-slate-700 hover:border-cyan-400 group"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Screening</span>
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Official Clinical Referral
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {patient?.abhaId || 'ABHA Screening Record'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Direct Download as Primary Action & Close */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Primary Action Button: Direct Device PDF Download */}
            <button
              type="button"
              id="download-report-btn"
              disabled={isDownloadingPdf}
              onClick={handleDownloadReport}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition-all active:scale-95"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>
                {isDownloadingPdf ? 'Generating PDF...' : downloadSuccess ? 'Downloaded!' : '⬇ Download Report'}
              </span>
            </button>

            {/* Close Button ("✕") */}
            <button
              type="button"
              id="close-report-modal-btn"
              onClick={onClose}
              title="Close Report (Esc)"
              aria-label="Close Report"
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 border border-slate-200 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Document (Strictly 1-Page A4 Printable Sheet) */}
        <div 
          id="printable-slip-content" 
          className="printable-slip report-container clinical-report-sheet space-y-2.5 rounded-xl"
          style={{ backgroundColor: '#ffffff', color: '#111827', lineHeight: '1.2' }}
        >
          {/* Header */}
          <div className="text-center pb-2.5 border-b-2" style={{ borderColor: '#0f172a' }}>
            <div 
              className="inline-block px-3 py-1 rounded text-[11px] font-black tracking-widest uppercase mb-1"
              style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
            >
              Ministry of Health &amp; Family Welfare &bull; Govt. of India
            </div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ color: '#0f172a' }}>
              National Tele-Ophthalmology Screening Referral Slip
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>
              Ayushman Bharat Digital Health Mission (ABDM) &bull; DRISHTI-AI AI-Assisted Triage
            </p>
          </div>

          {/* Metadata Bar */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 rounded-lg border font-mono"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}
          >
            <div>
              <span className="text-[10px] block" style={{ color: '#64748b' }}>SLIP ID</span>
              <strong className="font-bold" style={{ color: '#0f172a' }}>{screening.id?.substring(0, 10) || 'REF-2026-99'}</strong>
            </div>
            <div>
              <span className="text-[10px] block" style={{ color: '#64748b' }}>DATE &amp; TIME</span>
              <strong className="font-bold" style={{ color: '#0f172a' }}>{new Date().toLocaleDateString()}</strong>
            </div>
            <div>
              <span className="text-[10px] block" style={{ color: '#64748b' }}>ORIGIN PHC</span>
              <strong className="font-bold" style={{ color: '#0f172a' }}>Medipally PHC</strong>
            </div>
            <div>
              <span className="text-[10px] block" style={{ color: '#64748b' }}>SCREENER ID</span>
              <strong className="font-bold" style={{ color: '#0f172a' }}>ASHA-HYD-1092</strong>
            </div>
          </div>

          {/* Patient Details */}
          <div>
            <h2 
              className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
              style={{ color: '#334155', borderColor: '#e2e8f0' }}
            >
              Patient Demographic Data
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs patient-grid">
              <div>
                <span className="block" style={{ color: '#64748b' }}>ABHA ID:</span>
                <strong className="font-mono" style={{ color: '#312e81' }}>{patient?.abhaId || 'N/A'}</strong>
              </div>
              <div>
                <span className="block" style={{ color: '#64748b' }}>Patient Name:</span>
                <strong style={{ color: '#0f172a' }}>{patient?.patientName || 'N/A'}</strong>
              </div>
              <div>
                <span className="block" style={{ color: '#64748b' }}>Age / Gender:</span>
                <strong style={{ color: '#0f172a' }}>{patient?.age || 'N/A'} Yrs / {patient?.gender || 'N/A'}</strong>
              </div>
              <div>
                <span className="block" style={{ color: '#64748b' }}>Random Blood Glucose:</span>
                <strong style={{ color: '#0f172a' }}>{patient?.bloodGlucoseMgDl || 'N/A'} mg/dL</strong>
              </div>
              <div>
                <span className="block" style={{ color: '#64748b' }}>Facility Location:</span>
                <strong style={{ color: '#0f172a' }}>Tier-3 Rural Primary Health Centre</strong>
              </div>
            </div>
          </div>

          {/* AI Clinical Diagnosis */}
          <div 
            className="p-3.5 rounded-xl border-2 clinical-triage-grid"
            style={{ backgroundColor: '#f8fafc', borderColor: '#0f172a', color: '#0f172a' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between" style={{ color: '#0f172a' }}>
              <span>DRISHTI-AI Automated Retinal Evaluation</span>
              <span className="text-xs font-mono font-bold" style={{ color: '#4338ca' }}>
                ResNet-50 Confidence: {screening?.confidence ? `${screening.confidence.toFixed(1)}%` : 'N/A'}
              </span>
            </h2>

            <div className="flex items-center gap-4 my-1.5">
              <div 
                className="p-2.5 rounded-lg text-center min-w-[95px]"
                style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
              >
                <span className="text-[10px] uppercase font-bold block" style={{ color: '#94a3b8' }}>SEVERITY</span>
                <span className="text-lg font-mono font-black" style={{ color: '#ffffff' }}>GRADE {screening?.severityGrade}</span>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#0f172a' }}>
                  {screening?.severityGrade === 0
                    ? 'No Diabetic Retinopathy'
                    : screening?.severityGrade === 1
                    ? 'Mild Non-Proliferative DR'
                    : screening?.severityGrade === 2
                    ? 'Moderate Non-Proliferative DR (Referable)'
                    : screening?.severityGrade === 3
                    ? 'Severe Non-Proliferative DR (Urgent Referable)'
                    : 'Proliferative Diabetic Retinopathy (Sight Threatening)'}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                  Quality Gate: Laplacian Variance &ge; 80.0 (Sharp), Mean Brightness &in; [40, 220] (Gradable).
                </p>
              </div>
            </div>

            {/* Referable Banner with explicit hex styles */}
            <div 
              className="p-2 rounded-lg mt-2 text-xs font-bold border"
              style={
                screening?.isReferable
                  ? { backgroundColor: '#ffe4e6', color: '#881337', borderColor: '#fca5a5' }
                  : { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' }
              }
            >
              {screening?.isReferable ? (
                <span>&bull; DISPOSITION: REFERRAL TO DISTRICT EYE HOSPITAL REQUIRED WITHIN 14-28 DAYS</span>
              ) : (
                <span>&bull; DISPOSITION: NON-REFERABLE &bull; RE-SCREEN IN 12 MONTHS AT LOCAL PHC</span>
              )}
            </div>
          </div>

          {/* Grad-CAM & Fundus Thumbnail in print */}
          {gradcamImageUrl && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#334155' }}>
                Grad-CAM Layer4 Retinal Heatmap Evidence
              </h2>
              <div className="flex gap-4 fundus-cam-pair report-image-preview">
                {rawImageUrl && (
                  <div className="w-1/2">
                    <img 
                      src={rawImageUrl} 
                      alt="Raw Scan" 
                      crossOrigin="anonymous" 
                      className="w-full max-h-[120px] h-28 object-contain rounded border" 
                      style={{ maxHeight: '120px', objectFit: 'contain', borderColor: '#cbd5e1' }}
                    />
                    <span className="text-[10px] block text-center mt-0.5" style={{ color: '#64748b' }}>Raw Fundus Image</span>
                  </div>
                )}
                <div className="w-1/2">
                  <img 
                    src={gradcamImageUrl} 
                    alt="Grad-CAM" 
                    crossOrigin="anonymous" 
                    className="w-full max-h-[120px] h-28 object-contain rounded border" 
                    style={{ maxHeight: '120px', objectFit: 'contain', borderColor: '#cbd5e1' }}
                  />
                  <span className="text-[10px] block text-center mt-0.5" style={{ color: '#64748b' }}>Grad-CAM Activation Map (layer4)</span>
                </div>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div 
            className="pt-3 border-t grid grid-cols-2 gap-8 text-xs signature-block report-footer"
            style={{ borderColor: '#cbd5e1' }}
          >
            <div>
              <div className="h-8 border-b border-dashed" style={{ borderColor: '#94a3b8' }}></div>
              <span className="font-semibold block mt-1" style={{ color: '#334155' }}>ASHA Screener Operator Signature</span>
              <span className="text-[10px]" style={{ color: '#64748b' }}>ASHA-HYD-1092 &bull; Medipally PHC</span>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-dashed" style={{ borderColor: '#94a3b8' }}></div>
              <span className="font-semibold block mt-1" style={{ color: '#334155' }}>District Ophthalmologist Signature / Stamp</span>
              <span className="text-[10px]" style={{ color: '#64748b' }}>District Eye Care Centre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
