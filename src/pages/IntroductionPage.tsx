import React from 'react';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Server,
  Zap,
  Clock,
} from 'lucide-react';

interface IntroductionPageProps {
  onNavigate: (sectionId: string) => void;
}

export const IntroductionPage: React.FC<IntroductionPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 03</span>
            <h1 className="text-xl font-bold text-slate-900">Introduction to Real-Time Gateways</h1>
          </div>
        </div>

        {/* Narrative text */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          <p>
            In contemporary network applications—such as collaborative document editors, financial trading
            platforms, real-time telemetry dashboards, and multi-user chat applications—instantaneous
            bidirectional communication is essential.
          </p>

          <p>
            Historically, web browsers relied on traditional <strong>HTTP Short Polling</strong> or{' '}
            <strong>Long Polling</strong>. Under these models, the client repeatedly opens short-lived TCP
            connections to inquire if new data has arrived on the server. Because HTTP is inherently half-duplex
            and client-driven, each polling request incurs heavy HTTP request-response headers (frequently 500
            to 1000 bytes per request) even when zero new events exist. This creates tremendous network bandwidth
            waste, strains server CPU thread pools, and imposes artificial latency equal to the polling interval.
          </p>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Traditional HTTP Polling (Legacy)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-800">
                <li>• Repeated short-lived TCP 3-way handshakes</li>
                <li>• Heavy header bloat (500–1000 bytes per poll)</li>
                <li>• High latency tied to client polling intervals</li>
                <li>• Inefficient thread/connection utilization</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Persistent WebSockets (Modern Standard)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-800">
                <li>• Single persistent TCP connection after HTTP 101</li>
                <li>• Lightweight framing headers (only 2 to 10 bytes)</li>
                <li>• Sub-millisecond true bidirectional push</li>
                <li>• Server can push spontaneously without client asking</li>
              </ul>
            </div>
          </div>

          <h2 className="text-base font-bold text-slate-900 pt-2">
            The Distributed Dilemma: Scaling Stateful Connections
          </h2>

          <p>
            While a single WebSocket server works well for small numbers of users, production distributed
            systems require horizontal scaling across multiple server instances behind a reverse proxy / load
            balancer. However, this introduces a classic distributed systems dilemma:
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl not-prose my-4">
            <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>The "Stateful Island" Problem:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Suppose <strong>Client A</strong> connects to <strong>Server 1</strong>, and{' '}
              <strong>Client B</strong> connects to <strong>Server 2</strong>. Because WebSocket connections
              are stateful socket descriptors pinned to individual server memory, Server 1 has no reference to
              Client B's TCP socket. When Client A emits a message intended for all room participants, how does
              it reach Client B?
            </p>
          </div>

          <p>
            The standard architectural solution is an in-memory <strong>Redis Pub/Sub Backplane</strong>. When
            any gateway node receives an incoming WebSocket message, it validates the payload and issues a Redis{' '}
            <code>PUBLISH</code> command. Redis fans out the message to all registered cluster nodes in
            microseconds. Each receiving server checks its local connection manager and pushes the frame to its
            locally connected clients.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => onNavigate('aim')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Aim</span>
          </button>
          <button
            onClick={() => onNavigate('theory')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <span>Proceed to Theory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
