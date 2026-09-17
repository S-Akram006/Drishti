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
        windowWidth: 800 // locks capture width so flex columns never wrap vertically
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

        {/* The Printable Document (Strictly 1-Page A4 Printable Sheet with hardcoded inline styles) */}
        <div 
          id="printable-slip-content" 
          className="printable-slip report-container clinical-report-sheet"
          style={{ 
            backgroundColor: '#ffffff', 
            color: '#0b0f19', 
            lineHeight: '1.2',
            width: '100%',
            maxWidth: '760px',
            margin: '0 auto',
            padding: '16px',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Header & Title: Centered, black text (#0b0f19), clean margins */}
          <div style={{ textAlign: 'center', paddingBottom: '10px', borderBottom: '2px solid #0b0f19', marginBottom: '12px' }}>
            <div 
              style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: '#f1f5f9', color: '#1e293b', borderRadius: '4px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}
            >
              Ministry of Health &amp; Family Welfare &bull; Govt. of India
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', color: '#0b0f19', margin: '2px 0' }}>
              National Tele-Ophthalmology Screening Referral Slip
            </h1>
            <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0', fontWeight: '500' }}>
              Ayushman Bharat Digital Health Mission (ABDM) &bull; DRISHTI-AI AI-Assisted Triage
            </p>
          </div>

          {/* Metadata Bar */}
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontFamily: 'monospace', color: '#0b0f19', marginBottom: '12px' }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>SLIP ID</span>
              <strong style={{ color: '#0b0f19', fontWeight: '700' }}>{screening.id?.substring(0, 10) || 'REF-2026-99'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>DATE &amp; TIME</span>
              <strong style={{ color: '#0b0f19', fontWeight: '700' }}>{new Date().toLocaleDateString()}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>ORIGIN PHC</span>
              <strong style={{ color: '#0b0f19', fontWeight: '700' }}>Medipally PHC</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>SCREENER ID</span>
              <strong style={{ color: '#0b0f19', fontWeight: '700' }}>ASHA-HYD-1092</strong>
            </div>
          </div>

          {/* Demographic Grid: 3 columns with display: flex; justify-content: space-between; */}
          <div style={{ marginBottom: '12px' }}>
            <h2 
              style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}
            >
              Patient Demographic Data
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', fontSize: '11px', gap: '8px' }}>
              <div style={{ width: '31%' }}>
                <span style={{ color: '#64748b', display: 'block' }}>ABHA ID:</span>
                <strong style={{ fontFamily: 'monospace', color: '#312e81' }}>{patient?.abhaId || 'N/A'}</strong>
              </div>
              <div style={{ width: '31%' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Patient Name:</span>
                <strong style={{ color: '#0b0f19' }}>{patient?.patientName || 'N/A'}</strong>
              </div>
              <div style={{ width: '31%' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Age / Gender:</span>
                <strong style={{ color: '#0b0f19' }}>{patient?.age || 'N/A'} Yrs / {patient?.gender || 'N/A'}</strong>
              </div>
              <div style={{ width: '31%' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Random Blood Glucose:</span>
                <strong style={{ color: '#0b0f19' }}>{patient?.bloodGlucoseMgDl || 'N/A'} mg/dL</strong>
              </div>
              <div style={{ width: '64%' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Facility Location:</span>
                <strong style={{ color: '#0b0f19' }}>Tier-3 Rural Primary Health Centre</strong>
              </div>
            </div>
          </div>

          {/* AI Evaluation Box: Border: 1px solid #1e293b; Background: #ffffff; */}
          <div 
            style={{ border: '1px solid #1e293b', backgroundColor: '#ffffff', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}
          >
            {/* Title & confidence on one line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0b0f19' }}>
                DRISHTI-AI Automated Retinal Evaluation
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#4338ca' }}>
                ResNet-50 Confidence: {screening?.confidence ? `${screening.confidence.toFixed(1)}%` : 'N/A'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '6px 0' }}>
              {/* "SEVERITY GRADE X" Badge: background: #0f172a; color: #ffffff; padding: 8px 12px; border-radius: 6px; display: inline-block; */}
              <div 
                style={{ background: '#0f172a', color: '#ffffff', padding: '8px 12px', borderRadius: '6px', display: 'inline-block', textAlign: 'center', minWidth: '100px' }}
              >
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '700', color: '#94a3b8', display: 'block' }}>SEVERITY</span>
                <span style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: '900', color: '#ffffff' }}>GRADE {screening?.severityGrade}</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b0f19' }}>
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
                <p style={{ fontSize: '10px', color: '#475569', margin: '2px 0 0 0' }}>
                  Quality Gate: Laplacian Variance &ge; 80.0 (Sharp), Mean Brightness &in; [40, 220] (Gradable).
                </p>
              </div>
            </div>

            {/* Referable Banner */}
            <div 
              style={{
                padding: '8px',
                borderRadius: '6px',
                marginTop: '8px',
                fontSize: '11px',
                fontWeight: '700',
                border: '1px solid',
                ...(screening?.isReferable
                  ? { backgroundColor: '#ffe4e6', color: '#881337', borderColor: '#fca5a5' }
                  : { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' })
              }}
            >
              {screening?.isReferable ? (
                <span>&bull; DISPOSITION: REFERRAL TO DISTRICT EYE HOSPITAL REQUIRED WITHIN 14-28 DAYS</span>
              ) : (
                <span>&bull; DISPOSITION: NON-REFERABLE &bull; RE-SCREEN IN 12 MONTHS AT LOCAL PHC</span>
              )}
            </div>
          </div>

          {/* Heatmap Section: Force side-by-side display */}
          {gradcamImageUrl && (
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#334155', marginBottom: '6px' }}>
                Grad-CAM Layer4 Retinal Heatmap Evidence
              </h2>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '16px' }}>
                {rawImageUrl && (
                  <div style={{ width: '48%', textAlign: 'center' }}>
                    <img 
                      src={rawImageUrl} 
                      alt="Raw Scan" 
                      crossOrigin="anonymous" 
                      style={{ maxHeight: '130px', width: 'auto', objectFit: 'contain', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'block', margin: '0 auto' }}
                    />
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '4px' }}>Raw Fundus Image</span>
                  </div>
                )}
                <div style={{ width: '48%', textAlign: 'center' }}>
                  <img 
                    src={gradcamImageUrl} 
                    alt="Grad-CAM" 
                    crossOrigin="anonymous" 
                    style={{ maxHeight: '130px', width: 'auto', objectFit: 'contain', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'block', margin: '0 auto' }}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '4px' }}>Grad-CAM Activation Map (layer4)</span>
                </div>
              </div>
            </div>
          )}

          {/* Signatures Section: display: flex; justify-content: space-between; */}
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '11px' }}
          >
            <div style={{ width: '45%' }}>
              <div style={{ height: '32px', borderBottom: '1px dashed #94a3b8' }}></div>
              <span style={{ fontWeight: '600', color: '#334155', display: 'block', marginTop: '4px' }}>ASHA Screener Operator Signature</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>ASHA-HYD-1092 &bull; Medipally PHC</span>
            </div>
            <div style={{ width: '45%', textAlign: 'right' }}>
              <div style={{ height: '32px', borderBottom: '1px dashed #94a3b8' }}></div>
              <span style={{ fontWeight: '600', color: '#334155', display: 'block', marginTop: '4px' }}>District Ophthalmologist Signature / Stamp</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>District Eye Care Centre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
