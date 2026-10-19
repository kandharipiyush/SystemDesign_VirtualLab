import React, { useState } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import { ClientManager } from './ClientManager';
import { ServerClusterPanel } from './ServerClusterPanel';
import { MessageConsole } from './MessageConsole';
import { MetricsDashboard } from './MetricsDashboard';
import { EventLogViewer } from './EventLogViewer';
import { InteractiveArchitecture } from '../architecture/InteractiveArchitecture';
import { ComparisonExperimentPanel } from './ComparisonExperimentPanel';
import {
  RotateCcw,
  Pause,
  Play,
  Gauge,
  Layers,
  HelpCircle,
  Eye,
  Activity,
  Scale,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export type ExperimentMode = 'round-robin' | 'least-connections' | 'comparison';

export const SimulationWorkspace: React.FC = () => {
  const {
    state,
    resetSimulation,
    setPaused,
    setAnimationSpeed,
    setRoutingStrategy,
    connectClient,
    connectAll,
    disconnectClient,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'interactive_lab' | 'topology_view'>('interactive_lab');
  const [experimentMode, setExperimentMode] = useState<ExperimentMode>('round-robin');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [resetToastMessage, setResetToastMessage] = useState<string | null>(null);

  // Healthy servers list for mode calculations
  const healthyServers = state.servers.filter((s) => s.status === 'healthy');
  const rrNextIndex = healthyServers.length > 0 ? state.roundRobinCursor % healthyServers.length : 0;
  const rrNextServer = healthyServers[rrNextIndex] || null;

  // Least connections target server
  const sortedByLoad = [...healthyServers].sort((a, b) => {
    const diff = a.activeConnectionIds.length - b.activeConnectionIds.length;
    if (diff !== 0) return diff;
    return a.port - b.port;
  });
  const lcNextServer = sortedByLoad[0] || null;

  // Handle switching experiment mode
  const handleSelectMode = (mode: ExperimentMode) => {
    setExperimentMode(mode);
    if (mode === 'round-robin') {
      setRoutingStrategy('round-robin');
    } else if (mode === 'least-connections') {
      setRoutingStrategy('least-connections');
    }
  };

  // Immediate, reliable Reset Lab handler
  const handleResetLab = () => {
    resetSimulation();
    setResetToastMessage('Simulator reset: Cluster, clients, and metrics restored to baseline.');
    setTimeout(() => {
      setResetToastMessage(null);
    }, 3000);
  };

  // Helper actions for interactive protocol testing
  const handleConnectNext = () => {
    const disconnectedClient = state.clients.find((c) => c.status !== 'connected');
    if (disconnectedClient) {
      connectClient(disconnectedClient.id);
    }
  };

  const handleCreateLoadImbalance = () => {
    // Connect client-a, client-b, client-c then disconnect client-a to induce imbalance
    connectClient('client-a');
    connectClient('client-b');
    connectClient('client-c');
    setTimeout(() => {
      disconnectClient('client-a');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Master Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800 text-sm">Simulation Engine Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
            <span>RFC 6455 Gateway</span>
            <span>·</span>
            <span className="font-mono text-blue-700">Redis Pub/Sub</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* View Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setActiveTab('interactive_lab')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'interactive_lab'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Lab Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('topology_view')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'topology_view'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Topology</span>
            </button>
          </div>

          {/* Quick Strategy Indicator / Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={state.routingStrategy}
              onChange={(e) => {
                const s = e.target.value as any;
                setRoutingStrategy(s);
                if (s === 'round-robin') setExperimentMode('round-robin');
                if (s === 'least-connections') setExperimentMode('least-connections');
              }}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="round-robin">Round Robin</option>
              <option value="least-connections">Least Connections</option>
            </select>
          </div>

          {/* Animation Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={state.animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="0.5">0.5x Slow</option>
              <option value="1">1.0x Normal</option>
              <option value="2">2.0x Fast</option>
            </select>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setPaused(!state.isPaused)}
            className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
              state.isPaused
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={state.isPaused ? 'Resume simulations' : 'Pause background timers'}
          >
            {state.isPaused ? <Play className="w-3 h-3 text-amber-700" /> : <Pause className="w-3 h-3" />}
            <span>{state.isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Working Reset Simulation Button (Instant feedback without blocking dialog) */}
          <button
            id="btn-reset-lab"
            onClick={handleResetLab}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 font-medium flex items-center gap-1 transition-colors"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset Lab</span>
          </button>

          {/* Help Modal Trigger */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="How to use the simulator"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instant Reset Toast Notification */}
      {resetToastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{resetToastMessage}</span>
          </div>
          <button
            onClick={() => setResetToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      {activeTab === 'topology_view' ? (
        <InteractiveArchitecture />
      ) : (
        <div className="space-y-6">
          {/* THREE SELECTABLE LOAD BALANCING EXPERIMENT MODES */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-xl p-4 text-white shadow-md border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                    EXPERIMENT PROTOCOL SUITE
                  </span>
                  <span className="text-xs text-slate-400">Select an active investigation mode:</span>
                </div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Load Balancing Experiment Protocols</span>
                </h2>
              </div>

              {/* Mode Selection Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Mode 1 Button */}
                <button
                  id="tab-mode-round-robin"
                  onClick={() => handleSelectMode('round-robin')}
                  className={`px-3 py-2 rounded-lg text-left transition-all border ${
                    experimentMode === 'round-robin'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md ring-2 ring-blue-400/30'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <RotateCcw className="w-3.5 h-3.5 text-blue-200" />
                    <span>1. Round Robin</span>
                  </div>
                  <span className="text-[10px] text-blue-200 block mt-0.5 opacity-90">
                    O(1) Cyclic Sequential
                  </span>
                </button>

                {/* Mode 2 Button */}
                <button
                  id="tab-mode-least-connections"
                  onClick={() => handleSelectMode('least-connections')}
                  className={`px-3 py-2 rounded-lg text-left transition-all border ${
                    experimentMode === 'least-connections'
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md ring-2 ring-indigo-400/30'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <TrendingDown className="w-3.5 h-3.5 text-indigo-200" />
                    <span>2. Least Connections</span>
                  </div>
                  <span className="text-[10px] text-indigo-200 block mt-0.5 opacity-90">
                    Adaptive Socket-Table
                  </span>
                </button>

                {/* Mode 3 Button */}
                <button
                  id="tab-mode-comparison"
                  onClick={() => handleSelectMode('comparison')}
                  className={`px-3 py-2 rounded-lg text-left transition-all border ${
                    experimentMode === 'comparison'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md ring-2 ring-purple-400/30'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Scale className="w-3.5 h-3.5 text-purple-200" />
                    <span>3. Dual Comparison</span>
                  </div>
                  <span className="text-[10px] text-purple-200 block mt-0.5 opacity-90">
                    Side-by-Side Analysis
                  </span>
                </button>
              </div>
            </div>

            {/* Mode 1 Context Banner: Round Robin */}
            {experimentMode === 'round-robin' && (
              <div className="mt-4 pt-3 border-t border-white/10 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-200">Active Routing: Round Robin (Cyclic Ring)</span>
                    <span className="px-2 py-0.2 bg-blue-500/30 text-blue-100 rounded text-[10px] font-mono">
                      Formula: Server = S[cursor % {healthyServers.length || 1}]
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Distributes connections cyclically without inspecting existing socket duration. Best for uniform, short-lived requests.
                  </p>
                </div>

                {/* Ring Cursor Indicator & Helpers */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-black/30 border border-white/15 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-slate-400">Next Target:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {rrNextServer ? `${rrNextServer.name} (: ${rrNextServer.port})` : 'None (Cluster Offline)'}
                    </span>
                  </div>

                  <button
                    onClick={handleConnectNext}
                    className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Connect next available client to observe sequential assignment"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Connect Next Client</span>
                  </button>

                  <button
                    onClick={() => connectAll()}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Connect All (4)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2 Context Banner: Least Connections */}
            {experimentMode === 'least-connections' && (
              <div className="mt-4 pt-3 border-t border-white/10 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-200">Active Routing: Least Connections (Load-Aware)</span>
                    <span className="px-2 py-0.2 bg-indigo-500/30 text-indigo-100 rounded text-[10px] font-mono">
                      Formula: Server = argmin |S.activeConnections|
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Dynamically evaluates active socket tables. Steers new handshakes to the gateway instance with the fewest current sessions.
                  </p>
                </div>

                {/* Load Comparator Indicator & Helpers */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-black/30 border border-white/15 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-slate-400">Least-Loaded Target:</span>
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      {lcNextServer
                        ? `${lcNextServer.name} (${lcNextServer.activeConnectionIds.length} conns)`
                        : 'None (Cluster Offline)'}
                    </span>
                  </div>

                  <button
                    onClick={handleConnectNext}
                    className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Route next incoming client to least-loaded node"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Connect Next Client</span>
                  </button>

                  <button
                    onClick={handleCreateLoadImbalance}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-amber-200 rounded-lg text-xs font-semibold transition-colors"
                    title="Connect 3 then disconnect 1 to demonstrate dynamic leveling"
                  >
                    <span>Induce Asymmetry</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3 Context Banner: Dual Comparison */}
            {experimentMode === 'comparison' && (
              <div className="mt-4 pt-3 border-t border-white/10 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-200">Active Protocol: Dual Comparison Benchmark</span>
                    <span className="px-2 py-0.2 bg-purple-500/30 text-purple-100 rounded text-[10px] font-mono">
                      Round Robin vs Least Connections
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Running dual-algorithmic execution across identical arrival events. Side-by-side distribution, max imbalance (Δ), and decision logs shown below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* If Mode 3 is selected, show the rich Side-by-Side Comparison Panel */}
          {experimentMode === 'comparison' && (
            <ComparisonExperimentPanel
              servers={state.servers}
              onApplyToLiveCluster={(strat) => {
                setRoutingStrategy(strat);
                setExperimentMode(strat);
              }}
            />
          )}

          {/* Row 1: Live WebSocket Server Cluster (Full Width for ample breathing room) */}
          <ServerClusterPanel />

          {/* Row 2: Live Message Console + Client Registry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Message Console (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <MessageConsole />
            </div>

            {/* Right: Client Manager (7 cols) */}
            <div className="lg:col-span-7">
              <ClientManager />
            </div>
          </div>

          {/* Row 3: Real-time Telemetry Dashboard */}
          <MetricsDashboard />

          {/* Row 4: Event Stream Log */}
          <EventLogViewer />
        </div>
      )}

      {/* Interactive Quick Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">Simulator Quick Start Guide</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 leading-relaxed text-slate-600">
              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900">
                <strong className="block font-semibold mb-1">Three Dedicated Experiment Modes:</strong>
                Use the top Experiment Protocol suite to toggle between <strong>Mode 1 (Round Robin)</strong>, <strong>Mode 2 (Least Connections)</strong>, and <strong>Mode 3 (Side-by-Side Dual Comparison)</strong>.
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">1. Round Robin Mode:</strong>
                Observe sequential modular ring traversal. Connect clients to see alternating allocation. Crash a node to observe the ring skip offline instances.
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">2. Least Connections Mode:</strong>
                Observe dynamic socket table inspection. Steers incoming handshakes to the server with fewest active sockets, eliminating load hotspots.
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">3. Dual Comparison Mode:</strong>
                Run side-by-side benchmark runs with identical workload arrival traces. Compare server socket distributions, load variance, and decision audit logs.
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">4. Redis Pub/Sub & Fault Injection:</strong>
                Publish messages to test cross-server distribution via Redis. Crash and restart server nodes at any time to verify system resilience.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Got It, Let's Experiment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
