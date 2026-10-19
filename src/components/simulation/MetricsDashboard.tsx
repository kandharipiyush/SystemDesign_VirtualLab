import React from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import {
  Users,
  Server,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  TrendingUp,
} from 'lucide-react';

export const MetricsDashboard: React.FC = () => {
  const { state } = useSimulation();

  const totalClients = state.clients.length;
  const connectedClients = state.clients.filter((c) => c.status === 'connected').length;
  const healthyServers = state.servers.filter((s) => s.status === 'healthy').length;
  const publishedCount = state.stats.publishedCount;
  const deliveredCount = state.stats.deliveredCount;
  const failedCount = state.stats.failedDeliveriesCount;

  const avgLatency =
    publishedCount > 0
      ? Math.round(state.stats.totalLatenciesSum / publishedCount)
      : 24;

  const totalDeliveriesAttempted = deliveredCount + failedCount;
  const deliverySuccessRate =
    totalDeliveriesAttempted > 0
      ? Math.round((deliveredCount / totalDeliveriesAttempted) * 100)
      : 100;

  // Max connections for scale
  const maxConn = Math.max(1, ...state.servers.map((s) => s.activeConnectionIds.length));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Cluster Telemetry & Metrics</h3>
            <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
              Live State Derived
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Observability metrics computed directly from in-memory cluster events and connection tables.
          </p>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Connected Clients */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Clients Online</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900">{connectedClients}</span>
            <span className="text-xs text-slate-400 font-mono">/ {totalClients}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Active TCP streams</span>
        </div>

        {/* Healthy Servers */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Gateway Nodes</span>
            <Server className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900">{healthyServers}</span>
            <span className="text-xs text-slate-400 font-mono">/ {state.servers.length}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-1">
            {healthyServers === state.servers.length ? 'All Healthy' : 'Degraded Cluster'}
          </span>
        </div>

        {/* Messages Published */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Published</span>
            <Send className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{publishedCount}</div>
          <span className="text-[10px] text-slate-500 block mt-1">Redis PUBLISH calls</span>
        </div>

        {/* Deliveries Count */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Delivered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{deliveredCount}</div>
          <span className="text-[10px] text-slate-500 block mt-1">Client socket pushes</span>
        </div>

        {/* Failed Deliveries */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Failed / Dropped</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">{failedCount}</div>
          <span className="text-[10px] text-slate-500 block mt-1">Offline drops (At-most-once)</span>
        </div>

        {/* Simulated Latency */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Simulated Latency</span>
            <Clock className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-800">{avgLatency} ms</div>
          <span className="text-[10px] text-purple-600 font-semibold block mt-1">Simulated model</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Chart 1: Per-Server Connection Distribution */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800">Connection Distribution per Server Node</h4>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Strategy: {state.routingStrategy === 'round-robin' ? 'Round Robin' : 'Least Conn'}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {state.servers.map((s) => {
              const count = s.activeConnectionIds.length;
              const percent = maxConn > 0 ? (count / maxConn) * 100 : 0;
              const isHealthy = s.status === 'healthy';

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      ></span>
                      {s.name} (Port :{s.port})
                    </span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {count} active sockets ({isHealthy ? 'Online' : 'Offline'})
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isHealthy ? 'bg-blue-600' : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Historical Routing Dispatches:</span>
            <span className="font-mono font-medium">
              {Object.entries(state.stats.routingAssignments)
                .map(([sid, cnt]) => `${sid.replace('server-', 'S')}: ${cnt}`)
                .join(' | ')}
            </span>
          </div>
        </div>

        {/* Chart 2: Message Flow Activity History */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800">Message Volume & Delivery Reliability</h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              Success Rate: {deliverySuccessRate}%
            </span>
          </div>

          <div className="pt-2">
            {/* SVG Activity Trend */}
            <div className="h-28 w-full bg-slate-50 rounded-lg p-2 flex items-end gap-1.5 border border-slate-100">
              {state.stats.activityHistory.map((item, idx) => {
                const maxVal = Math.max(1, ...state.stats.activityHistory.map((h) => h.published + h.delivered));
                const pubHeight = Math.min(100, (item.published / maxVal) * 100);
                const delHeight = Math.min(100, (item.delivered / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="w-full flex items-end justify-center gap-0.5 h-20">
                      <div
                        className="w-1.5 bg-blue-500 rounded-t transition-all"
                        style={{ height: `${pubHeight}%` }}
                        title={`Published: ${item.published}`}
                      ></div>
                      <div
                        className="w-1.5 bg-emerald-500 rounded-t transition-all"
                        style={{ height: `${delHeight}%` }}
                        title={`Delivered: ${item.delivered}`}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">{item.time}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                <span>Messages Published</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Frames Delivered</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                <span>Failed Drops ({failedCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
