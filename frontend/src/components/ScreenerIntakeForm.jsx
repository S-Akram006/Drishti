import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, RefreshCw, CheckCircle2, Image as ImageIcon, RotateCcw, Edit3 } from 'lucide-react';

export default function ScreenerIntakeForm({ onSubmit, isLoading, currentUser, isScreeningComplete = false, onReset }) {
  // 1. Clean empty defaults (no hardcoded demo values)
  const [abhaId, setAbhaId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleClearForm = () => {
    setAbhaId('');
    setPatientName('');
    setAge('');
    setGender('Male');
    setBloodGlucose('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) onReset();
  };

  const handleFillDemoData = () => {
    setAbhaId('ABHA-9823-1120-9944');
    setPatientName('Ramesh Sharma');
    setAge('52');
    setGender('Male');
    setBloodGlucose('185');
  };

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG or PNG).');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please attach or drop a retinal fundus photograph before initiating AI screening.');
      return;
    }
    if (!abhaId.trim() || !patientName.trim()) {
      alert('Please provide ABHA ID and Patient Full Name.');
      return;
    }

    const formData = new FormData();
    formData.append('fundusImage', selectedFile);
    formData.append('abhaId', abhaId.trim());
    formData.append('patientName', patientName.trim());
    formData.append('age', age.trim());
    formData.append('gender', gender);
    formData.append('bloodGlucoseMgDl', bloodGlucose.trim());
    formData.append('operatorId', currentUser?.userId || 'ASHA-HYD-1092');
    formData.append('phcId', currentUser?.facilityId || 'PHC-MEDIPALLY-01');

    onSubmit(formData, previewUrl, { abhaId, patientName, age, gender, bloodGlucose });
  };

  // Real fundus clinical test samples manifest
  const PRESET_SAMPLES = {
    grade0: {
      url: '/samples/grade0_normal.jpg',
      filename: 'grade0_normal.jpg',
      abha: 'ABHA-1029-4458-1120',
      name: 'Suresh Patel',
      age: '42',
      gender: 'Male',
      glucose: '105'
    },
    grade1: {
      url: '/samples/grade1_mild.jpg',
      filename: 'grade1_mild.jpg',
      abha: 'ABHA-2849-5510-3391',
      name: 'Meera Bai',
      age: '49',
      gender: 'Female',
      glucose: '142'
    },
    grade2: {
      url: '/samples/grade2_moderate.jpg',
      filename: 'grade2_moderate.jpg',
      abha: 'ABHA-9823-1120-9944',
      name: 'Ramesh Sharma',
      age: '52',
      gender: 'Male',
      glucose: '185'
    },
    grade3: {
      url: '/samples/grade3_severe.jpg',
      filename: 'grade3_severe.jpg',
      abha: 'ABHA-6631-4092-1188',
      name: 'Anandi Devi',
      age: '61',
      gender: 'Female',
      glucose: '235'
    },
    grade4: {
      url: '/samples/grade4_proliferative.jpg',
      filename: 'grade4_proliferative.jpg',
      abha: 'ABHA-7711-2098-5542',
      name: 'Mohan Rao',
      age: '67',
      gender: 'Male',
      glucose: '268'
    },
    blurry: {
      url: '/samples/blurry_quality_fail.jpg',
      filename: 'blurry_quality_fail.jpg',
      abha: 'ABHA-4412-8871-3321',
      name: 'Sunita Devi',
      age: '46',
      gender: 'Female',
      glucose: '145'
    }
  };

  const loadPresetSample = async (type) => {
    const preset = PRESET_SAMPLES[type];
    if (!preset) return;

    setAbhaId(preset.abha);
    setPatientName(preset.name);
    setAge(preset.age);
    setGender(preset.gender);
    setBloodGlucose(preset.glucose);

    try {
      const response = await fetch(preset.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const file = new File([blob], preset.filename, { type: 'image/jpeg' });
      // Stage the file only - do not trigger API call
      handleFileChange(file);
    } catch (err) {
      console.error('Failed to load sample fundus file:', err);
      // Fallback placeholder image if local sample is missing
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = type === 'blurry' ? '#8f6855' : '#bf4212';
      ctx.fillRect(0, 0, 400, 400);
      canvas.toBlob((b) => {
        const fallbackFile = new File([b], `${type}_fallback.jpg`, { type: 'image/jpeg' });
        handleFileChange(fallbackFile);
      }, 'image/jpeg', 0.95);
    }
  };

  const hasAnyData = Boolean(abhaId || patientName || age || bloodGlucose || selectedFile);

  return (
    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-sm tracking-tight text-white uppercase">
            1. Screener Intake &amp; Ingestion
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyData && (
            <button
              type="button"
              onClick={handleClearForm}
              id="clear-form-header-btn"
              title="Reset all fields for new patient"
              className="text-[10px] font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear / New</span>
            </button>
          )}
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            Form 8-R
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {/* ABHA ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            ABHA ID / Ayushman Bharat Health Account <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={abhaId}
            onChange={(e) => setAbhaId(e.target.value)}
            placeholder="e.g. 14-digit ABHA Number"
            id="patient-abha-input"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Patient Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Patient Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter Patient Full Name"
            id="patient-name-input"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Age, Gender & Glucose */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age in years"
              id="patient-age-input"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              id="patient-gender-select"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1" title="Blood Glucose mg/dL">
              RBS (mg/dL)
            </label>
            <input
              type="number"
              value={bloodGlucose}
              onChange={(e) => setBloodGlucose(e.target.value)}
              placeholder="e.g. 140 mg/dL"
              id="patient-glucose-input"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Drag & Drop Fundus Uploader */}
        <div className="mt-1">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Retinal Fundus Photograph</span>
            {previewUrl && (
              <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Image Loaded
              </span>
            )}
          </label>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[125px] ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-950/20'
                : previewUrl
                ? 'border-slate-600 bg-slate-900/50'
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {previewUrl ? (
              <div className="flex items-center gap-3 w-full">
                <img
                  src={previewUrl}
                  alt="Fundus Thumbnail"
                  className="w-16 h-16 rounded-lg object-cover border border-slate-600 shadow-md flex-shrink-0"
                />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {selectedFile?.name || 'fundus_photo.jpg'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'Standard Ingestion'}
                  </p>
                  <span className="text-[10px] text-cyan-400 underline mt-1 inline-block">
                    Click to replace
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Drag &amp; drop fundus photo</p>
                <span className="text-[10px] text-slate-400">or click to browse JPEG/PNG</span>
              </div>
            )}
          </div>
        </div>

        {/* Run AI Screening Pipeline - Primary Action Button (Directly below upload area) */}
        <div className="pt-1">
          <button
            type="submit"
            id="run-screening-btn"
            disabled={isLoading || !selectedFile}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-indigo-600 transition-all transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Analyzing Retinal Scan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Run AI Screening Pipeline</span>
              </>
            )}
          </button>

          {/* Clear / New Patient Button */}
          {isScreeningComplete && (
            <button
              type="button"
              onClick={handleClearForm}
              id="clear-new-patient-btn"
              className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear / Intake New Patient</span>
            </button>
          )}

          {!selectedFile && !isScreeningComplete && (
            <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
              * Stage an image above or click a preset below to enable screening
            </p>
          )}
        </div>

        {/* Fast Evaluation Presets & Demo Quick-Fill */}
        <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/80 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Diagnostic Test Presets (Stage Sample)
            </span>
            <button
              type="button"
              onClick={handleFillDemoData}
              id="fill-demo-data-btn"
              title="Populate test patient demographics with one click"
              className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 px-2 py-0.5 rounded flex items-center gap-1 transition-all shadow-sm"
            >
              <Edit3 className="w-2.5 h-2.5 text-cyan-400" />
              <span>Fill Demo Data</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              id="preset-btn-grade0"
              onClick={() => loadPresetSample('grade0')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-emerald-300 border border-emerald-900/50 flex items-center justify-between transition-colors"
            >
              <span>Grade 0: Normal</span>
              <span className="font-mono text-[9px] text-emerald-400">No DR</span>
            </button>
            <button
              type="button"
              id="preset-btn-grade1"
              onClick={() => loadPresetSample('grade1')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-teal-300 border border-teal-900/50 flex items-center justify-between transition-colors"
            >
              <span>Grade 1: Mild</span>
              <span className="font-mono text-[9px] text-teal-400">Early</span>
            </button>
            <button
              type="button"
              id="preset-btn-grade2"
              onClick={() => loadPresetSample('grade2')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-amber-300 border border-amber-900/50 flex items-center justify-between transition-colors"
            >
              <span>Grade 2: Moderate</span>
              <span className="font-mono text-[9px] text-amber-400">Refer</span>
            </button>
            <button
              type="button"
              id="preset-btn-grade3"
              onClick={() => loadPresetSample('grade3')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-orange-300 border border-orange-900/50 flex items-center justify-between transition-colors"
            >
              <span>Grade 3: Severe</span>
              <span className="font-mono text-[9px] text-orange-400">Refer</span>
            </button>
            <button
              type="button"
              id="preset-btn-grade4"
              onClick={() => loadPresetSample('grade4')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-purple-300 border border-purple-900/50 flex items-center justify-between transition-colors"
            >
              <span>Grade 4: Prolif.</span>
              <span className="font-mono text-[9px] text-purple-400">Urgent</span>
            </button>
            <button
              type="button"
              id="preset-btn-blurry"
              onClick={() => loadPresetSample('blurry')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-rose-300 border border-rose-900/50 flex items-center justify-between transition-colors"
            >
              <span>Blurry Gate Test</span>
              <span className="font-mono text-[9px] text-rose-400">400 Bad</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
