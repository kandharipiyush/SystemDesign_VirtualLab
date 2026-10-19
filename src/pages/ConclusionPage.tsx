import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Printer,
  Server,
  Layers,
  Radio,
  Zap,
} from 'lucide-react';

interface ConclusionPageProps {
  onNavigate: (sectionId: string) => void;
  onOpenReportModal: () => void;
}

export const ConclusionPage: React.FC<ConclusionPageProps> = ({
  onNavigate,
  onOpenReportModal,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 12</span>
            <h1 className="text-xl font-bold text-slate-900">Laboratory Conclusion & Summary</h1>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Synthesis of empirical findings, architectural trade-offs, and distributed systems principles
          verified during Experiment 14.
        </p>
      </div>

      {/* Main Conclusion Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900">Summary of Key Principles Demonstrated</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Principle 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>1. Persistent Socket Affinity</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              WebSocket connections are stateful TCP streams bound to the operating system socket table of a
              single host. They cannot be transparently moved across servers without closing and renegotiating
              the TCP socket.
            </p>
          </div>

          {/* Principle 2 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Radio className="w-4 h-4 text-rose-600" />
              <span>2. Redis Pub/Sub Backplane</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cross-server broadcasting overcomes the isolated "stateful island" problem. Delegating message
              fan-out to an in-memory Redis message bus provides horizontal scalability without an O(N²) server mesh.
            </p>
          </div>

          {/* Principle 3 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>3. Load Balancing Strategy Impact</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              While Round Robin provides sequential distribution, Least Connections dynamically monitors active
              concurrent socket counts. For persistent sessions with variable lifetimes, Least Connections
              prevents server starvation and imbalance.
            </p>
          </div>

          {/* Principle 4 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>4. Fault Recovery & Transient Semantics</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              When a gateway node crashes, connected clients are dropped abruptly. Because standard Redis Pub/Sub
              provides at-most-once delivery, missed messages are not replayed upon recovery. Resilient clients must
              implement exponential backoff reconnection.
            </p>
          </div>
        </div>

        {/* Simulation Notice Disclaimer */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Academic Modeling Transparency:</span>
          </div>
          <p className="text-blue-950 leading-relaxed">
            This experiment is an interactive educational simulation. It models
            distributed routing policies, Redis Pub/Sub channel semantics, and socket drop events conceptually.
            The results reflect the deterministic behavior of the modeled architecture and should not be cited
            as measured hardware or network infrastructure benchmarks.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('posttest')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Post-Test</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate Final Report</span>
            </button>
            <button
              onClick={() => onNavigate('references')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <span>Academic References</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
