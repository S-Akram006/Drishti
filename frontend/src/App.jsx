import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScreenerIntakeForm from './components/ScreenerIntakeForm';
import DualFundusViewer from './components/DualFundusViewer';
import ClinicalDispositionCard from './components/ClinicalDispositionCard';
import UngradableModal from './components/UngradableModal';
import TelemedicineQueueDrawer from './components/TelemedicineQueueDrawer';
import PrintableReferralSlip from './components/PrintableReferralSlip';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './utils/api';

export default function App() {
  // Authentication & View State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('drishti_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    try {
      const saved = localStorage.getItem('drishti_user');
      const user = saved ? JSON.parse(saved) : null;
      if (path === '/admin') return user?.role === 'admin' ? 'admin' : 'landing';
      if (path === '/screen') return user ? 'screen' : 'landing';
      if (user) {
        return user.role === 'admin' ? 'admin' : 'screen';
      }
      return 'landing';
    } catch {
      return 'landing';
    }
  });

  const [backendHealth, setBackendHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [queueRefreshKey, setQueueRefreshKey] = useState(0);

  // Quality gate failure modal state
  const [ungradableModalOpen, setUngradableModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [recapturingNotice, setRecapturingNotice] = useState('');

  // Referral slip print modal state
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Poll backend health on mount
  const checkHealth = async () => {
    try {
      const data = await api.checkHealth();
      setBackendHealth(data);
    } catch (err) {
      setBackendHealth({ status: 'unreachable', error: err.message });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Listen to browser popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        if (currentUser?.role === 'admin') setCurrentView('admin');
        else setCurrentView('landing');
      } else if (path === '/screen') {
        if (currentUser) setCurrentView('screen');
        else setCurrentView('landing');
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('drishti_user', JSON.stringify(user));
    if (user.role === 'admin') {
      setCurrentView('admin');
      window.history.pushState({}, '', '/admin');
    } else {
      setCurrentView('screen');
      window.history.pushState({}, '', '/screen');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('drishti_user');
    setCurrentUser(null);
    setCurrentView('landing');
    window.history.pushState({}, '', '/');
  };

  const navigateToScreen = () => {
    setCurrentView('screen');
    window.history.pushState({}, '', '/screen');
  };

  const navigateToAdmin = () => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
      window.history.pushState({}, '', '/admin');
    } else {
      alert('Access restricted to District Health Officers and Administrators.');
    }
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', '/');
  };

  const handleResetScreening = () => {
    setScreeningResult(null);
    setPatientData(null);
    setRawImageUrl(null);
  };

  // Handle screening submission
  const handleScreeningSubmit = async (formData, previewUrl, intakeMetadata) => {
    setIsLoading(true);
    setRawImageUrl(previewUrl);
    setPatientData(intakeMetadata);

    try {
      const response = await api.screenPatient(formData);

      if (response.success && response.gradable) {
        setScreeningResult(response.screening);
        setPatientData(response.patient);
        setQueueRefreshKey((k) => k + 1);
      }
    } catch (err) {
      // Catch Quality Gate rejection (HTTP 400)
      if (err.response && err.response.status === 400) {
        const data = err.response.data || {};
        setRejectionReason(data.rejectionReason || 'Image failed optical quality checks (blurry or bad lighting).');
        setRecapturingNotice(data.recapturingNotice || '');
        setUngradableModalOpen(true);
        setScreeningResult(null);
      } else {
        alert('Screening error: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render Page Based on Current View
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onLoginSuccess={handleLoginSuccess} 
        initialModalOpen={false} 
      />
    );
  }

  if (currentView === 'admin') {
    // Protected Admin view
    if (currentUser?.role !== 'admin') {
      return (
        <LandingPage 
          onLoginSuccess={handleLoginSuccess} 
          initialModalOpen={true} 
        />
      );
    }
    return (
      <AdminDashboard 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigateToScreen={navigateToScreen}
      />
    );
  }

  // Screener Portal View (`/screen`)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        backendHealth={backendHealth} 
        onRefreshHealth={checkHealth}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateToAdmin={currentUser?.role === 'admin' ? navigateToAdmin : null}
        onNavigateToLanding={navigateToLanding}
      />

      {/* Main 3-Column Clinical Dashboard */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Screener Intake Form (3.5 cols) */}
          <section className="lg:col-span-4 xl:col-span-3.5 flex flex-col">
            <ScreenerIntakeForm 
              onSubmit={handleScreeningSubmit} 
              isLoading={isLoading} 
              currentUser={currentUser}
              isScreeningComplete={Boolean(screeningResult)}
              onReset={handleResetScreening}
            />
          </section>

          {/* Center Column: Dual Fundus & Explainability Viewer (5 cols) */}
          <section className="lg:col-span-5 xl:col-span-5 flex flex-col">
            <DualFundusViewer
              rawImageUrl={rawImageUrl}
              gradcamImageUrl={screeningResult?.gradcamImageBase64}
              isScreeningComplete={Boolean(screeningResult)}
              severityGrade={screeningResult?.severityGrade}
            />
          </section>

          {/* Right Column: Clinical Disposition & Referral Card (3.5 cols) */}
          <section className="lg:col-span-3 xl:col-span-3.5 flex flex-col">
            <ClinicalDispositionCard
              screeningResult={screeningResult}
              patientData={patientData}
              onPrintReferral={() => setPrintModalOpen(true)}
            />
          </section>
        </div>
      </main>

      {/* Bottom Drawer: District Hospital Telemedicine Queue */}
      <TelemedicineQueueDrawer
        refreshTrigger={queueRefreshKey}
        onCaseApproved={() => {
          checkHealth();
        }}
      />

      {/* Ungradable Error Modal (HTTP 400 Quality Gate Failure) */}
      <UngradableModal
        isOpen={ungradableModalOpen}
        onClose={() => setUngradableModalOpen(false)}
        rejectionReason={rejectionReason}
        recapturingNotice={recapturingNotice}
      />

      {/* Printable Government Telemedicine Referral Slip */}
      <PrintableReferralSlip
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        patient={patientData}
        screening={screeningResult}
        rawImageUrl={rawImageUrl}
        gradcamImageUrl={screeningResult?.gradcamImageBase64}
      />
    </div>
  );
}
