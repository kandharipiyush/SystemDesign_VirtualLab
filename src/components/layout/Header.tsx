import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import {
  Menu,
  RotateCcw,
  Printer,
  Server,
  Users,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onToggleMobileNav: () => void;
  onOpenReportModal: () => void;
  onOpenProgressModal?: () => void;
  onResetAll?: () => void;
  onResetSimulation?: () => void;
  progressPercent: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onToggleMobileNav,
  onOpenReportModal,
  onOpenProgressModal,
  onResetAll,
  onResetSimulation,
  progressPercent,
}) => {
  const { state, resetSimulation } = useSimulation();

  const [showResetMenu, setShowResetMenu] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resetMenuRef = useRef<HTMLDivElement>(null);

  const connectedCount = state.clients.filter((c) => c.status === 'connected').length;
  const healthyCount = state.servers.filter((s) => s.status === 'healthy').length;

  const sectionTitles: Record<string, string> = {
    overview: '01 · Experiment Overview',
    aim: '02 · Aim & Objectives',
    intro: '03 · Introduction',
    theory: '04 · Distributed Systems Theory',
    architecture: '05 · System Architecture',
    pretest: '06 · Pre-Test Assessment',
    simulation: '07 · Virtual Lab Simulation',
    procedure: '08 · Laboratory Procedure',
    observations: '09 · Observations & Results',
    exercises: '10 · Progressive Exercises',
    posttest: '11 · Post-Test Assessment',
    conclusion: '12 · Conclusion & Summary',
    references: '13 · Academic References',
  };

  // Close reset menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resetMenuRef.current && !resetMenuRef.current.contains(event.target as Node)) {
        setShowResetMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFullReset = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 800);
    setShowResetMenu(false);

    if (onResetAll) {
      onResetAll();
    } else {
      resetSimulation();
    }

    setToastMessage('Complete Lab Reset: All progress, quizzes, and simulation restored to 0% baseline.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleClusterReset = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 800);
    setShowResetMenu(false);

    if (onResetSimulation) {
      onResetSimulation();
    } else {
      resetSimulation();
    }

    setToastMessage('Simulator Reset: WebSocket cluster connections and telemetry restored to initial state.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Academic Affiliation Bar */}
      <div className="bg-blue-900 text-white text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">VIRTUAL NETWORKING LAB</span>
          <span className="hidden md:inline text-blue-300">|</span>
          <span className="hidden md:inline text-blue-200">
            Distributed Systems & Network Computing
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-blue-200">RFC 6455 Simulation</span>
          <span className="bg-blue-800 text-blue-100 px-2 py-0.5 rounded font-semibold">
            Experiment 14
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            title="Open experiment menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
                EXP-14
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Real-Time Pub/Sub WebSocket Gateway
              </h1>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="font-medium text-blue-700">
                {sectionTitles[currentSection] || currentSection}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Live Status */}
        <div className="flex items-center gap-3">
          {/* Quick cluster status badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-700" title="Connected clients">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>{connectedCount} Online</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-slate-700" title="Healthy server nodes">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {healthyCount}/{state.servers.length} Nodes
              </span>
            </div>
          </div>

          {/* Dynamic Progress pill */}
          <button
            onClick={onOpenProgressModal}
            className="hidden md:flex flex-col items-end text-xs group cursor-pointer hover:opacity-90 text-left transition-opacity"
            title="Click to view real-time dynamic progress breakdown"
          >
            <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-blue-700 transition-colors">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="font-medium">Lab Progress: {progressPercent}%</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </button>

          {/* Print Report */}
          <button
            onClick={onOpenReportModal}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Generate print-friendly academic lab report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Interactive Reset / Refresh Lab Menu */}
          <div className="relative" ref={resetMenuRef}>
            <button
              id="header-reset-btn"
              onClick={() => setShowResetMenu(!showResetMenu)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Reset Virtual Lab or Simulator"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  isSpinning ? 'animate-spin text-rose-600' : 'text-slate-600'
                }`}
              />
              <span className="hidden sm:inline">Reset</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Reset Scope Dropdown Popover */}
            {showResetMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 block text-xs">
                    Reset & Refresh Lab Options
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Choose which component of the Virtual Lab to reset:
                  </span>
                </div>

                <div className="py-1 space-y-1 mt-1">
                  {/* Option 1: Full Factory Reset */}
                  <button
                    id="btn-full-reset"
                    onClick={handleFullReset}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-colors group flex items-start gap-2.5"
                  >
                    <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md mt-0.5 group-hover:bg-rose-200">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-rose-900 text-xs flex items-center gap-1">
                        <span>Complete Lab Reset (0%)</span>
                        <span className="text-[9px] px-1 bg-rose-100 text-rose-800 rounded font-mono font-bold">
                          All
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Restores entire lab to clean 0% state: clears simulator cluster, quiz attempts, and exercises.
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Simulator Cluster Reset Only */}
                  <button
                    id="btn-cluster-reset"
                    onClick={handleClusterReset}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors group flex items-start gap-2.5"
                  >
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md mt-0.5 group-hover:bg-blue-200">
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-900 text-xs">
                        Reset Simulator Cluster Only
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Disconnects clients, restarts servers, and clears logs. Preserves your quiz scores and theory progress.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between font-medium shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white hover:text-emerald-200 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
};
