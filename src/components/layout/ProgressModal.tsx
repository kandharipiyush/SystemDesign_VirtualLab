import React from 'react';
import type { DynamicProgressReport } from '../../utils/progressEngine';
import {
  CheckCircle2,
  Circle,
  Activity,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ProgressModalProps {
  report: DynamicProgressReport;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  report,
  onClose,
  onNavigate,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'simulation':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'assessment':
        return <HelpCircle className="w-4 h-4 text-indigo-600" />;
      case 'exercise':
        return <Award className="w-4 h-4 text-blue-600" />;
      case 'theory':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSectionForMilestone = (milestoneId: string): string => {
    if (milestoneId.startsWith('sim-')) return 'simulation';
    if (milestoneId === 'test-pre') return 'pretest';
    if (milestoneId === 'test-post') return 'posttest';
    if (milestoneId.startsWith('ex-')) return 'exercises';
    if (milestoneId === 'theory-core') return 'theory';
    if (milestoneId === 'arch-core') return 'architecture';
    if (milestoneId === 'proc-core') return 'procedure';
    if (milestoneId === 'obs-core') return 'observations';
    return 'overview';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Real-Time Dynamic Lab Progress
              </h3>
              <p className="text-slate-500 text-xs">
                Evaluated live from your simulation state, quiz assessments, exercises, and theory.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 font-bold rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Big Overall Progress Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-blue-200 font-semibold block">
              TOTAL LAB ACCREDITATION
            </span>
            <div className="text-2xl font-bold font-mono mt-0.5">
              {report.totalPercent}% Completed
            </div>
            <span className="text-xs text-blue-200 opacity-90 mt-0.5 block">
              {report.completedCount} of {report.totalCount} milestones completed
            </span>
          </div>

          <div className="w-28 bg-white/20 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${report.totalPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 4 Pillars Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulation</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">
              {report.breakdown.simulation.earned}/{report.breakdown.simulation.max} pts
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${(report.breakdown.simulation.earned / report.breakdown.simulation.max) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quizzes</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">
              {report.breakdown.assessment.earned}/{report.breakdown.assessment.max} pts
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{
                  width: `${(report.breakdown.assessment.earned / report.breakdown.assessment.max) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Exercises</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">
              {report.breakdown.exercise.earned}/{report.breakdown.exercise.max} pts
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${(report.breakdown.exercise.earned / report.breakdown.exercise.max) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Theory</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">
              {report.breakdown.theory.earned}/{report.breakdown.theory.max} pts
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${(report.breakdown.theory.earned / report.breakdown.theory.max) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Dynamic Milestone Checklist:
          </div>

          {report.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                m.completed
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5">
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="p-0.5 rounded bg-slate-100">{getCategoryIcon(m.category)}</span>
                    <span className="font-medium text-slate-900 text-xs">
                      {m.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                      +{m.points} pts
                    </span>
                  </div>
                  {!m.completed && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      💡 {m.hint}
                    </p>
                  )}
                </div>
              </div>

              {!m.completed && (
                <button
                  onClick={() => {
                    onNavigate(getSectionForMilestone(m.id));
                    onClose();
                  }}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-semibold shrink-0 flex items-center gap-1"
                >
                  <span>Go to Section</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-xs"
          >
            Close Progress Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
