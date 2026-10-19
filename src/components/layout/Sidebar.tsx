import React from 'react';
import {
  Home,
  Target,
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
  FileCheck,
  Activity,
  ListOrdered,
  FileSpreadsheet,
  Award,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSelectSection: (sectionId: string) => void;
  completedSections: string[];
  progressPercent?: number;
  onResetProgress: () => void;
  onOpenProgressModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  completedSections,
  progressPercent: propProgressPercent,
  onResetProgress,
  onOpenProgressModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home, code: '01' },
    { id: 'aim', label: 'Aim', icon: Target, code: '02' },
    { id: 'intro', label: 'Introduction', icon: BookOpen, code: '03' },
    { id: 'theory', label: 'Theory', icon: Cpu, code: '04' },
    { id: 'architecture', label: 'Architecture', icon: Layers, code: '05' },
    { id: 'pretest', label: 'Pre-Test', icon: HelpCircle, code: '06' },
    { id: 'simulation', label: 'Virtual Simulation', icon: Activity, code: '07', highlight: true },
    { id: 'procedure', label: 'Procedure', icon: ListOrdered, code: '08' },
    { id: 'observations', label: 'Observations & Results', icon: FileSpreadsheet, code: '09' },
    { id: 'exercises', label: 'Exercises', icon: Award, code: '10' },
    { id: 'posttest', label: 'Post-Test', icon: FileCheck, code: '11' },
    { id: 'conclusion', label: 'Conclusion', icon: CheckCircle2, code: '12' },
    { id: 'references', label: 'References', icon: ExternalLink, code: '13' },
  ];

  const completedCount = completedSections.length;
  const progressPercent =
    typeof propProgressPercent === 'number'
      ? propProgressPercent
      : Math.round((completedCount / navItems.length) * 100);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Sidebar Lab Title Banner */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            VL
          </div>
          <div>
            <div className="text-[10px] font-bold text-blue-900 tracking-wider uppercase">
              Virtual Labs
            </div>
            <div className="text-xs font-semibold text-slate-800">
              Distributed Systems
            </div>
          </div>
        </div>

        {/* Experiment Pill */}
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-blue-900 font-mono">Experiment 14</span>
            <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-semibold">
              Pub/Sub Gateway
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
            Real-Time WebSocket Gateway
          </div>
        </div>

        {/* Dynamic Progress bar (Clickable) */}
        <div
          onClick={onOpenProgressModal}
          className="mt-3 space-y-1 cursor-pointer group"
          title="Click to view real-time dynamic progress breakdown"
        >
          <div className="flex justify-between text-[11px] text-slate-500 group-hover:text-blue-700 font-medium transition-colors">
            <span>Progress: {progressPercent}%</span>
            <span className="font-mono text-[10px]">
              {progressPercent === 100 ? 'Complete' : 'Dynamic Score'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full group-hover:bg-blue-700"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Sections Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          Experiment Sections
        </div>

        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          const isDone = completedSections.includes(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                  : item.highlight
                  ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-blue-600'
                      : item.highlight
                      ? 'text-blue-700'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {isDone && !isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-blue-200 text-blue-900 font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {item.code}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer in Sidebar */}
      <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-mono text-[10px]">v1.4.0</span>
        <button
          onClick={() => {
            if (window.confirm('Reset all section progress, quiz scores, and simulator state?')) {
              onResetProgress();
            }
          }}
          className="text-slate-400 hover:text-rose-600 flex items-center gap-1"
          title="Reset all laboratory progress"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>
    </aside>
  );
};
