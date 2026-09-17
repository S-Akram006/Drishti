import React, { useState, useEffect } from 'react';
import { Eye, ShieldCheck, Printer, X, ArrowLeft, Download, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PrintableReferralSlip({ isOpen, onClose, patient, screening, rawImageUrl, gradcamImageUrl }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
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

  const handlePrint = () => {
    window.print();
  };

  // Direct client-side PDF generation & download
  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('printable-slip');
    if (!reportElement) return;

    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2, // 2x resolution for sharp diagnostic text and retinal images
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: reportElement.scrollWidth || 800,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const calculatedHeight = (canvas.height * usableWidth) / canvas.width;

      if (calculatedHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, calculatedHeight);
      } else {
        // Multi-page handling if content exceeds single A4 page
        let heightRemaining = calculatedHeight;
        let yPos = margin;

        pdf.addImage(imgData, 'PNG', margin, yPos, usableWidth, calculatedHeight);
        heightRemaining -= (pageHeight - margin * 2);

        while (heightRemaining > 0) {
          yPos = heightRemaining - calculatedHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, yPos, usableWidth, calculatedHeight);
          heightRemaining -= (pageHeight - margin * 2);
        }
      }

      const fileName = `DRISHTI_Report_${patient?.abhaId || 'Screening'}.pdf`;
      pdf.save(fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Direct PDF generation failed, triggering print fallback:', err);
      // Fallback: trigger print dialog with print-isolated styles
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Direct client-side PNG Image download
  const handleDownloadImage = async () => {
    const reportElement = document.getElementById('printable-slip');
    if (!reportElement) return;

    setIsDownloadingImage(true);
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `DRISHTI_Report_${patient?.abhaId || 'Screening'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image download failed:', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto report-modal-backdrop"
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

          {/* Action Buttons: Direct Download, Print Fallback, and Close */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Primary Action Button: Direct Device PDF Download */}
            <button
              type="button"
              id="download-report-btn"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition-all active:scale-95"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>
                {isDownloadingPdf ? 'Generating...' : downloadSuccess ? 'Downloaded!' : '⬇ Download Report'}
              </span>
            </button>

            {/* Direct Image Download Option */}
            <button
              type="button"
              id="download-image-btn"
              disabled={isDownloadingImage}
              onClick={handleDownloadImage}
              title="Download Report as PNG Image"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
            >
              {isDownloadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="hidden sm:inline">PNG</span>
            </button>

            {/* Print Fallback Button */}
            <button
              type="button"
              id="print-report-btn"
              onClick={handlePrint}
              title="Print via browser or Save to PDF (Ctrl+P)"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
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

        {/* The Printable Document */}
        <div id="printable-slip" className="space-y-6">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="inline-block px-3 py-1 bg-slate-100 rounded text-[11px] font-black tracking-widest text-slate-800 uppercase mb-1">
              Ministry of Health &amp; Family Welfare &bull; Govt. of India
            </div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              National Tele-Ophthalmology Screening Referral Slip
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Ayushman Bharat Digital Health Mission (ABDM) &bull; DRISHTI-AI AI-Assisted Triage
            </p>
          </div>

          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">SLIP ID</span>
              <strong className="text-slate-900 font-bold">{screening.id?.substring(0, 10) || 'REF-2026-99'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">DATE &amp; TIME</span>
              <strong className="text-slate-900 font-bold">{new Date().toLocaleDateString()}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">ORIGIN PHC</span>
              <strong className="text-slate-900 font-bold">Medipally PHC</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SCREENER ID</span>
              <strong className="text-slate-900 font-bold">ASHA-HYD-1092</strong>
            </div>
          </div>

          {/* Patient Details */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
              Patient Demographic Data
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">ABHA ID:</span>
                <strong className="font-mono text-indigo-900">{patient?.abhaId || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <strong className="text-slate-900">{patient?.patientName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Age / Gender:</span>
                <strong className="text-slate-900">{patient?.age || 'N/A'} Yrs / {patient?.gender || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Random Blood Glucose:</span>
                <strong className="text-slate-900">{patient?.bloodGlucoseMgDl || 'N/A'} mg/dL</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Facility Location:</span>
                <strong className="text-slate-900">Tier-3 Rural Primary Health Centre</strong>
              </div>
            </div>
          </div>

          {/* AI Clinical Diagnosis */}
          <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center justify-between">
              <span>DRISHTI-AI Automated Retinal Evaluation</span>
              <span className="text-xs font-mono font-bold text-indigo-700">
                ResNet-50 Confidence: {screening?.confidence ? `${screening.confidence.toFixed(1)}%` : 'N/A'}
              </span>
            </h2>

            <div className="flex items-center gap-4 my-2">
              <div className="p-3 bg-slate-900 text-white rounded-lg text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SEVERITY</span>
                <span className="text-xl font-mono font-black">GRADE {screening?.severityGrade}</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
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
                <p className="text-xs text-slate-600 mt-0.5">
                  Quality Gate: Laplacian Variance &ge; 80.0 (Sharp), Mean Brightness &in; [40, 220] (Gradable).
                </p>
              </div>
            </div>

            {/* Referable Banner */}
            <div className={`p-2.5 rounded-lg mt-3 text-xs font-bold ${
              screening?.isReferable ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Grad-CAM Layer4 Retinal Heatmap Evidence
              </h2>
              <div className="flex gap-4">
                {rawImageUrl && (
                  <div className="w-1/2">
                    <img src={rawImageUrl} alt="Raw Scan" crossOrigin="anonymous" className="w-full h-36 object-contain rounded border border-slate-300" />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">Raw Fundus Image</span>
                  </div>
                )}
                <div className="w-1/2">
                  <img src={gradcamImageUrl} alt="Grad-CAM" crossOrigin="anonymous" className="w-full h-36 object-contain rounded border border-slate-300" />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">Grad-CAM Activation Map (layer4)</span>
                </div>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400"></div>
              <span className="font-semibold text-slate-700 block mt-1">ASHA Screener Operator Signature</span>
              <span className="text-[10px] text-slate-500">ASHA-HYD-1092 &bull; Medipally PHC</span>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400"></div>
              <span className="font-semibold text-slate-700 block mt-1">District Ophthalmologist Signature / Stamp</span>
              <span className="text-[10px] text-slate-500">District Eye Care Centre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
