import React from 'react';
import { useSimulation } from '../simulation/SimulationContext';
import type { Client, ServerInstance, ExperimentObservation } from '../simulation/types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Sparkles,
} from 'lucide-react';

interface ObservationsPageProps {
  onNavigate: (sectionId: string) => void;
  onOpenReportModal: () => void;
}

export const ObservationsPage: React.FC<ObservationsPageProps> = ({
  onNavigate,
  onOpenReportModal,
}) => {
  const { state } = useSimulation();

  const connectedCount = state.clients.filter((c: Client) => c.status === 'connected').length;
  const healthyCount = state.servers.filter((s: ServerInstance) => s.status === 'healthy').length;

  const handleExportCSV = () => {
    const headers = ['Metric', 'Current_Value'];
    const rows = [
      ['Connected_Clients', connectedCount],
      ['Healthy_Servers', healthyCount],
      ['Messages_Published', state.stats.publishedCount],
      ['Successful_Deliveries', state.stats.deliveredCount],
      ['Failed_Deliveries', state.stats.failedDeliveriesCount],
      ['Routing_Strategy', state.routingStrategy],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vlab_exp14_observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 09</span>
              <h1 className="text-xl font-bold text-slate-900">Observations & Analytical Results</h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data, connection matrices, and findings dynamically computed from your active simulation sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Printable Report</span>
          </button>
        </div>
      </div>

      {/* Primary Observations Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-400 block text-[10px]">Active WebSocket Sockets</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {connectedCount} / {state.clients.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Persistent TCP streams</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-400 block text-[10px]">Published to Redis</span>
          <span className="text-2xl font-bold font-mono text-blue-800 mt-1 block">
            {state.stats.publishedCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Redis PUBLISH commands</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-400 block text-[10px]">Successful Client Deliveries</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
            {state.stats.deliveredCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Recipient socket frames</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-400 block text-[10px]">Failed Deliveries</span>
          <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
            {state.stats.failedDeliveriesCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">At-most-once drops</span>
        </div>
      </div>

      {/* Auto-Generated Empirical Observations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Automated Dynamic Findings
          </h3>
        </div>

        {state.observations.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">No empirical findings logged yet.</p>
            <p>
              Perform experiments in the simulation (e.g. publish a cross-server message or stop a server
              during message transmission) to generate verified scientific observations.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('simulation')}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to Virtual Simulation
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {state.observations.map((obs: ExperimentObservation) => (
              <div
                key={obs.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-blue-800">
                  <span>[{obs.category.toUpperCase()}] OBSERVATION</span>
                  <span className="text-slate-400">{new Date(obs.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-sans">{obs.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Server Allocation Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Current Node Allocation Matrix
          </h3>
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            Routing Mode: {state.routingStrategy === 'round-robin' ? 'Round Robin' : 'Least Conn'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border-b">Server Node</th>
                <th className="p-3 border-b">Port</th>
                <th className="p-3 border-b">Health State</th>
                <th className="p-3 border-b">Active Sockets</th>
                <th className="p-3 border-b">Allocated Clients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.servers.map((s: ServerInstance) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">{s.name}</td>
                  <td className="p-3 font-mono">:{s.port}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-700">
                    {s.activeConnectionIds.length}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    {s.activeConnectionIds.length > 0
                      ? s.activeConnectionIds
                          .map((cid: string) => state.clients.find((c: Client) => c.id === cid)?.name || cid)
                          .join(', ')
                      : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
