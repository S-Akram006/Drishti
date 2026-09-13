import React from 'react';
import { Eye, ShieldCheck, Printer, X } from 'lucide-react';

export default function PrintableReferralSlip({ isOpen, onClose, patient, screening, rawImageUrl, gradcamImageUrl }) {
  if (!isOpen || !screening) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Government Telemedicine Referral Document Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
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
                    <img src={rawImageUrl} alt="Raw Scan" className="w-full h-36 object-contain rounded border border-slate-300" />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">Raw Fundus Image</span>
                  </div>
                )}
                <div className="w-1/2">
                  <img src={gradcamImageUrl} alt="Grad-CAM" className="w-full h-36 object-contain rounded border border-slate-300" />
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
