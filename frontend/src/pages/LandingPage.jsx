import React, { useState } from 'react';
import { 
  Eye, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Building2, 
  UserCheck, 
  Lock, 
  LogIn, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  MapPin,
  Cpu,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';

export const LandingPage = ({ onLoginSuccess, initialModalOpen = false }) => {
  const [showLoginModal, setShowLoginModal] = useState(initialModalOpen);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      id: 'ADMIN-GOV-01',
      pass: 'admin@drishti2026',
      role: 'admin',
      name: 'Dr. K. Srinivas',
      title: 'District Health Officer',
      phc: 'Medipally District HQ',
      badge: 'District Admin',
      color: 'bg-purple-700 hover:bg-purple-800 text-white'
    },
    {
      id: 'ASHA-HYD-1092',
      pass: 'asha1092',
      role: 'screener',
      name: 'S. Lakshmi',
      title: 'ASHA Operator',
      phc: 'Medipally Sub-Center',
      badge: 'PHC Screener',
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    },
    {
      id: 'ASHA-HYD-1093',
      pass: 'asha1093',
      role: 'screener',
      name: 'P. Sunitha',
      title: 'ASHA Operator',
      phc: 'Boduppal PHC',
      badge: 'PHC Screener',
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    },
    {
      id: 'ASHA-HYD-1094',
      pass: 'asha1094',
      role: 'screener',
      name: 'M. Anitha',
      title: 'ASHA Operator',
      phc: 'Peerzadiguda PHC',
      badge: 'PHC Screener',
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    },
    {
      id: 'ASHA-HYD-1095',
      pass: 'asha1095',
      role: 'screener',
      name: 'K. Radhika',
      title: 'ASHA Operator',
      phc: 'Uppal Urban Health Post',
      badge: 'PHC Screener',
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    },
    {
      id: 'ASHA-HYD-1096',
      pass: 'asha1096',
      role: 'screener',
      name: 'G. Renuka',
      title: 'ASHA Operator',
      phc: 'Ghatkesar CHC',
      badge: 'PHC Screener',
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    }
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!userId || !password) {
      setError('Please enter Employee/Admin ID and Password');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await api.login(userId, password);
      if (res.success && res.user) {
        setShowLoginModal(false);
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (account) => {
    setUserId(account.id);
    setPassword(account.pass);
    setIsLoading(true);
    setError('');
    try {
      const res = await api.login(account.id, account.pass);
      if (res.success && res.user) {
        setShowLoginModal(false);
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Quick login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Tricolor Ribbon Header */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>

      {/* Top Ministry Banner */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 flex items-center justify-center p-0.5 shadow-md shadow-orange-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Eye className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">DRISHTI<span className="text-orange-400">-AI</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  ABDM Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                Ministry of Health & Family Welfare • National Rural Tele-Ophthalmology
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              id="staff-login-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-600/30 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Staff & Officer Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/60">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-orange-400 mb-6 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Ayushman Bharat Digital Mission Tele-Health Initiative</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Explainable Diabetic Retinopathy <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                Tele-Screening for Rural India
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Empowering frontline ASHA workers and Community Health Centers with real-time OpenCV Quality Gates, 
              APTOS-trained ResNet-50 5-stage triage, and transparent Grad-CAM explainability to eradicate preventable diabetic blindness.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  // default quick access: ASHA screener
                  quickLogin(demoAccounts[1]);
                }}
                id="hero-launch-screener-btn"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-700/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Launch PHC Screener Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => {
                  quickLogin(demoAccounts[0]);
                }}
                id="hero-launch-admin-btn"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              >
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>District Admin Oversight</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Cheat-Sheet Card (Judge Friendly Pill Bar) */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-2xl backdrop-blur">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                    <UserCheck className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      Hackathon Evaluation Credentials
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded-full font-semibold">
                        1-Click Instant Login
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click any role below to immediately authenticate and inspect the corresponding portal view.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-2 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Manual Login Form</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Account Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => quickLogin(acc)}
                    disabled={isLoading}
                    className="flex flex-col text-left p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-500 transition-all group relative overflow-hidden text-slate-200 shadow-md"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        acc.role === 'admin' 
                          ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {acc.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                        {acc.id}
                      </span>
                    </div>

                    <div className="font-semibold text-white text-sm group-hover:text-orange-400 transition-colors">
                      {acc.name}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{acc.phc}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">pwd: {acc.pass}</span>
                      <span className="text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Login <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Technical Highlights */}
      <section className="py-16 bg-slate-950/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full">
              Engineered for Low-Resource Environments
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
              A 4-Tier Defensive Tele-Ophthalmology Pipeline
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed to overcome blurred handheld captures, rural connectivity drops, and clinical liability hurdles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Highlight 1: Quality Gate */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">OpenCV Quality Gate</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Real-time blur detection via Laplacian variance analysis (threshold &gt; 100) and illumination checks. Immediately alerts screener for capture re-takes before AI inference.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero ungradable noise passed to triage</span>
              </div>
            </div>

            {/* Highlight 2: 5-Stage ResNet-50 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ResNet-50 5-Stage Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Fine-tuned on APTOS 2019 dataset to categorize fundus scans across the 5 ICDR clinical grades: Normal (0), Mild (1), Moderate (2), Severe (3), and Proliferative (4).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-blue-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standardized ICDR clinical grading</span>
              </div>
            </div>

            {/* Highlight 3: Grad-CAM */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Grad-CAM Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Computes layer-4 gradients to render spatial heatmaps highlighting microaneurysms, hemorrhages, and cotton-wool spots, eliminating black-box AI skepticism.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-purple-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verifiable explainability overlays</span>
              </div>
            </div>

            {/* Highlight 4: Telemedicine Hub */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">District Tele-Routing</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                Instant escalation of Grade 2+ referable cases to Sarojini Devi Eye Hospital and District HQ, generating ABDM-compliant clinical referral passes.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Seamless tertiary hospital linkage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="font-bold text-slate-300">DRISHTI-AI Platform</div>
            <span>•</span>
            <span>Government of Telangana / MoHFW Pilot</span>
            <span>•</span>
            <span>Medipally District Pilot Hub</span>
          </div>
          <div>
            Built for Ayushman Bharat Digital Mission (ABDM) Tele-Ophthalmology
          </div>
        </div>
      </footer>

      {/* Staff & Officer Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Staff & Officer Portal Login</h3>
                  <p className="text-xs text-slate-400">MoHFW DRISHTI-AI Authentication</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Employee ID / Admin ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. ASHA-HYD-1092 or ADMIN-GOV-01"
                    id="login-username-input"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  id="login-password-input"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  id="login-submit-btn"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Authenticate & Enter Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Fill Shortcuts in modal */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">
                Quick Fill Roles:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserId('ADMIN-GOV-01');
                    setPassword('admin@drishti2026');
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800 hover:bg-purple-900"
                >
                  Admin: ADMIN-GOV-01
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserId('ASHA-HYD-1092');
                    setPassword('asha1092');
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                >
                  Screener: ASHA-HYD-1092
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
