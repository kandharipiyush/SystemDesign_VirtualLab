import React from 'react';
import { LAB_METADATA } from '../data/academicContent';
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  Layers,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface OverviewPageProps {
  onNavigate: (sectionId: string) => void;
  progressPercent: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  progressPercent,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white rounded-2xl p-8 shadow-md border border-blue-950 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-600/60 border border-blue-400/40 text-blue-100 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
              Experiment 14 · Distributed Systems
            </span>
            <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold">
              Interactive Virtual Lab
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Real-Time Pub/Sub WebSocket Gateway
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Understand, simulate, and evaluate stateful WebSocket connection scaling across multi-server
            clusters with an in-memory Redis Pub/Sub message backplane, health-aware load balancing, and
            fault-tolerance scenarios.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('simulation')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Virtual Lab Simulation</span>
            </button>

            <button
              onClick={() => onNavigate('aim')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 flex items-center gap-2 transition-all text-sm"
            >
              <span>Begin Guided Curriculum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <div className="w-full h-full border-l border-white/20 grid grid-cols-3 grid-rows-3"></div>
        </div>
      </div>

      {/* Lab Key Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Estimated Duration</span>
            <span className="font-bold text-slate-800 text-sm">{LAB_METADATA.estimatedDuration}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Laboratory Type</span>
            <span className="font-bold text-slate-800 text-sm">Deterministic Simulation (In-Browser)</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Current Progress</span>
            <span className="font-bold text-slate-800 text-sm">{progressPercent}% Completed</span>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Learning Objectives</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {LAB_METADATA.learningObjectives.map((obj, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                {i + 1}
              </span>
              <p className="text-slate-700 leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prerequisites & Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Course Prerequisites</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            {LAB_METADATA.prerequisites.map((pre, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span>{pre}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Laboratory Guidelines</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This experiment requires no backend servers, Redis binaries, Docker daemons, or cloud credentials.
            All distributed system behaviors—including WebSocket handshakes, load balancer cursors, and Redis
            channel broadcasts—are implemented via a typed deterministic simulation engine.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('pretest')}
              className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Take Pre-Test Assessment to calibrate your baseline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
