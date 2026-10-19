import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
              <span>Virtual Labs · Distributed Systems</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Experiment 14: Real-Time Pub/Sub WebSocket Gateway. An interactive, browser-based
              laboratory simulation designed for computer engineering and distributed networking
              courses.
            </p>
          </div>

          <div>
            <div className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
              Architecture Standards
            </div>
            <ul className="space-y-1 text-[11px] text-slate-500">
              <li>RFC 6455 — The WebSocket Protocol</li>
              <li>Redis In-Memory Pub/Sub Message Bus</li>
              <li>Layer 4/7 Reverse Proxy Load Balancing</li>
              <li>At-Most-Once vs. Durable Stream Semantics</li>
            </ul>
          </div>

          <div>
            <div className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulation Transparency</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <strong>Educational Simulation Notice:</strong> This website executes a fully
              deterministic distributed systems model inside the client browser. It illustrates
              actual routing policies, Pub/Sub fan-out, and failure scenarios conceptually without
              requiring a backend server, Docker, or live cloud services.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            Educational Virtual Laboratory for Distributed Systems. Distributed under
            Academic Open Access.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">React + TypeScript + Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
