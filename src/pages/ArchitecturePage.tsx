import React from 'react';
import { InteractiveArchitecture } from '../components/architecture/InteractiveArchitecture';
import { Layers, ArrowRight, ArrowLeft, Activity } from 'lucide-react';

interface ArchitecturePageProps {
  onNavigate: (sectionId: string) => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 05</span>
            <h1 className="text-xl font-bold text-slate-900">System Architecture & Packet Routing</h1>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          The diagram below models the distributed architecture matching standard industry gateways (such as
          FastAPI + Redis or Node.js + Redis). Interact with any component tier to inspect its operational
          parameters, connection queues, and live state.
        </p>
      </div>

      {/* The Central Interactive Architecture Diagram */}
      <InteractiveArchitecture />

      {/* Architectural Sequence Explanation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Message Routing Sequence Step-by-Step
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-blue-800 font-mono text-[11px] block">Step 1: Frame Ingress</span>
            <p className="text-slate-600 leading-relaxed">
              Client transmits a WebSocket text/binary frame over the pre-established TCP stream to its assigned
              gateway node.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-amber-800 font-mono text-[11px] block">Step 2: Gateway PUBLISH</span>
            <p className="text-slate-600 leading-relaxed">
              Gateway node validates sender authentication and payload syntax, then executes a Redis PUBLISH to the
              target topic channel.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-rose-800 font-mono text-[11px] block">Step 3: Redis Fan-out</span>
            <p className="text-slate-600 leading-relaxed">
              Redis memory broker pushes the message to all healthy cluster instances subscribed to that channel.
              Offline nodes are skipped.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-emerald-800 font-mono text-[11px] block">Step 4: Local Sockets</span>
            <p className="text-slate-600 leading-relaxed">
              Each recipient gateway looks up its local connection manager and pushes the frame out to all eligible
              active clients.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => onNavigate('theory')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Theory</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('simulation')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Jump to Simulation</span>
            </button>
            <button
              onClick={() => onNavigate('pretest')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <span>Take Pre-Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
