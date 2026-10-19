import React, { useState, useEffect, useMemo } from 'react';
import { SimulationProvider, useSimulation } from './simulation/SimulationContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { PrintableReportModal } from './components/reports/PrintableReportModal';
import { ProgressModal } from './components/layout/ProgressModal';
import { calculateDynamicProgress } from './utils/progressEngine';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { AimPage } from './pages/AimPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { TheoryPage } from './pages/TheoryPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { PreTestPage } from './pages/PreTestPage';
import { SimulationPage } from './pages/SimulationPage';
import { ProcedurePage } from './pages/ProcedurePage';
import { ObservationsPage } from './pages/ObservationsPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { PostTestPage } from './pages/PostTestPage';
import { ConclusionPage } from './pages/ConclusionPage';
import { ReferencesPage } from './pages/ReferencesPage';

import {
  getStudentProgress,
  markSectionComplete,
  resetAllProgress,
} from './utils/storage';
import { X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { state, resetSimulation } = useSimulation();
  const [currentSection, setCurrentSection] = useState<string>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progress, setProgress] = useState(() => getStudentProgress());

  // Automatically mark visited sections
  useEffect(() => {
    const updated = markSectionComplete(currentSection);
    setProgress(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  const handleSelectSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    setMobileNavOpen(false);
  };

  const handleFullLabReset = () => {
    resetAllProgress();
    resetSimulation();
    setProgress(getStudentProgress());
    setCurrentSection('overview');
  };

  // Dynamic multi-dimensional progress calculated live from simulation, quizzes, exercises, and theory
  const progressReport = useMemo(() => {
    return calculateDynamicProgress(state, progress);
  }, [state, progress]);

  const progressPercent = progressReport.totalPercent;

  const renderActivePage = () => {
    switch (currentSection) {
      case 'overview':
        return <OverviewPage onNavigate={handleSelectSection} progressPercent={progressPercent} />;
      case 'aim':
        return <AimPage onNavigate={handleSelectSection} />;
      case 'intro':
        return <IntroductionPage onNavigate={handleSelectSection} />;
      case 'theory':
        return <TheoryPage onNavigate={handleSelectSection} />;
      case 'architecture':
        return <ArchitecturePage onNavigate={handleSelectSection} />;
      case 'pretest':
        return (
          <PreTestPage
            onNavigate={handleSelectSection}
            onComplete={() => setProgress(getStudentProgress())}
          />
        );
      case 'simulation':
        return <SimulationPage onNavigate={handleSelectSection} />;
      case 'procedure':
        return <ProcedurePage onNavigate={handleSelectSection} />;
      case 'observations':
        return (
          <ObservationsPage
            onNavigate={handleSelectSection}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        );
      case 'exercises':
        return <ExercisesPage onNavigate={handleSelectSection} />;
      case 'posttest':
        return (
          <PostTestPage
            onNavigate={handleSelectSection}
            onComplete={() => setProgress(getStudentProgress())}
          />
        );
      case 'conclusion':
        return (
          <ConclusionPage
            onNavigate={handleSelectSection}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        );
      case 'references':
        return (
          <ReferencesPage
            onNavigate={handleSelectSection}
            onResetProgress={handleFullLabReset}
          />
        );
      default:
        return <OverviewPage onNavigate={handleSelectSection} progressPercent={progressPercent} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <Header
        currentSection={currentSection}
        onToggleMobileNav={() => setMobileNavOpen(true)}
        onOpenReportModal={() => setShowReportModal(true)}
        onOpenProgressModal={() => setShowProgressModal(true)}
        onResetAll={handleFullLabReset}
        onResetSimulation={resetSimulation}
        progressPercent={progressPercent}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden lg:block shrink-0 sticky top-[72px] h-[calc(100vh-72px)]">
          <Sidebar
            currentSection={currentSection}
            onSelectSection={handleSelectSection}
            completedSections={progress.completedSections}
            progressPercent={progressPercent}
            onResetProgress={handleFullLabReset}
            onOpenProgressModal={() => setShowProgressModal(true)}
          />
        </div>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            ></div>
            <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="p-3 border-b flex justify-between items-center bg-slate-50">
                <span className="font-bold text-xs text-blue-900">Lab Menu</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  currentSection={currentSection}
                  onSelectSection={handleSelectSection}
                  completedSections={progress.completedSections}
                  progressPercent={progressPercent}
                  onResetProgress={handleFullLabReset}
                  onOpenProgressModal={() => setShowProgressModal(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6">
          {renderActivePage()}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Dynamic Progress Breakdown Modal */}
      {showProgressModal && (
        <ProgressModal
          report={progressReport}
          onClose={() => setShowProgressModal(false)}
          onNavigate={handleSelectSection}
        />
      )}

      {/* Printable Report Modal */}
      {showReportModal && (
        <PrintableReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
};

export default App;
