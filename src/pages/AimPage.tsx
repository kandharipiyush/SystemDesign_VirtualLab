import React from 'react';
import { LAB_METADATA } from '../data/academicContent';
import { Target, CheckCircle2, ArrowRight } from 'lucide-react';

interface AimPageProps {
  onNavigate: (sectionId: string) => void;
}

export const AimPage: React.FC<AimPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Target className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 02</span>
            <h1 className="text-xl font-bold text-slate-900">Aim of the Experiment</h1>
          </div>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-800 text-sm leading-relaxed font-medium">
          "{LAB_METADATA.aim}"
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Key Investigation Goals
          </h2>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Persistent Connection Verification:</strong>
                Analyze how full-duplex TCP connections remain pinned to a specific server memory heap, unlike stateless HTTP requests.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Cross-Server Backplane Delivery:</strong>
                Observe how an in-memory Redis message bus (Pub/Sub) enables independent gateway instances to exchange real-time payloads without direct server-to-server mesh connections.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Load Balancing Algorithmic Comparison:</strong>
                Evaluate connection distribution behavior under Round Robin (sequential) vs. Least Connections (active load-aware) strategies.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Fault Tolerance & Transient Semantics:</strong>
                Witness immediate socket termination upon node failure, evaluate client-side reconnection, and analyze the at-most-once delivery constraint of Redis Pub/Sub.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => onNavigate('overview')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            ← Back to Overview
          </button>
          <button
            onClick={() => onNavigate('intro')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <span>Proceed to Introduction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
