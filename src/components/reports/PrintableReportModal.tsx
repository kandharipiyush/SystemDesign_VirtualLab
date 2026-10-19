import React from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import { LAB_METADATA } from '../../data/academicContent';
import {
  Printer,
  X,
  Download,
} from 'lucide-react';

interface PrintableReportModalProps {
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({ onClose }) => {
  const { state } = useSimulation();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      experiment: 'Experiment 14: Real-Time Pub/Sub WebSocket Gateway',
      generatedAt: new Date().toISOString(),
      metadata: LAB_METADATA,
      clusterState: {
        clients: state.clients,
        servers: state.servers,
        routingStrategy: state.routingStrategy,
        channels: state.channels,
      },
      stats: state.stats,
      observations: state.observations,
      recentEventLogs: state.eventLogs.slice(0, 30),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vlab_exp14_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const connectedCount = state.clients.filter((c) => c.status === 'connected').length;
  const healthyCount = state.servers.filter((s) => s.status === 'healthy').length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-4">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Laboratory Experiment Report</h3>
              <p className="text-xs text-slate-500">
                Ready for printing to PDF or exporting as academic laboratory submission.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-8 font-sans text-slate-800 space-y-6 printable-content">
          {/* Institution Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">
              {LAB_METADATA.institution}
            </div>
            <div className="text-xs text-slate-500 font-medium">{LAB_METADATA.course}</div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Laboratory Report: Experiment 14
            </h1>
            <h2 className="text-base font-semibold text-blue-800 mt-0.5">
              {LAB_METADATA.title}
            </h2>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              Generated: {new Date().toLocaleString()} · Environment: Deterministic In-Browser Simulation
            </div>
          </div>

          {/* Section 1: Aim */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
              1. Aim & Objective
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{LAB_METADATA.aim}</p>
          </div>

          {/* Section 2: Architecture & Setup Summary */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
              2. System Topology & Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-[10px] text-slate-500 block">Routing Strategy</span>
                <span className="font-bold text-slate-800 font-mono">
                  {state.routingStrategy === 'round-robin' ? 'Round Robin' : 'Least Connections'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-[10px] text-slate-500 block">Active Clients</span>
                <span className="font-bold text-slate-800 font-mono">
                  {connectedCount} of {state.clients.length}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-[10px] text-slate-500 block">Healthy Servers</span>
                <span className="font-bold text-slate-800 font-mono">
                  {healthyCount} of {state.servers.length}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border rounded-lg">
                <span className="text-[10px] text-slate-500 block">Redis Channels</span>
                <span className="font-bold text-slate-800 font-mono">
                  {state.channels.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Telemetry & Metrics Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
              3. Telemetry & Quantitative Results
            </h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2 border-b">Metric Parameter</th>
                  <th className="p-2 border-b">Recorded Value</th>
                  <th className="p-2 border-b">Significance in Distributed System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-medium">Total Messages Published</td>
                  <td className="p-2 font-mono font-bold text-blue-800">{state.stats.publishedCount}</td>
                  <td className="p-2 text-slate-500">Frames sent by client to gateway node and published to Redis</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Successful Deliveries</td>
                  <td className="p-2 font-mono font-bold text-emerald-700">{state.stats.deliveredCount}</td>
                  <td className="p-2 text-slate-500">Recipient socket frames successfully pushed to local clients</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Failed / Dropped Deliveries</td>
                  <td className="p-2 font-mono font-bold text-rose-700">{state.stats.failedDeliveriesCount}</td>
                  <td className="p-2 text-slate-500">Deliveries aborted due to disconnected clients or crashed nodes</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Average Simulated Latency</td>
                  <td className="p-2 font-mono font-bold">
                    {state.stats.publishedCount > 0
                      ? Math.round(state.stats.totalLatenciesSum / state.stats.publishedCount)
                      : 24}{' '}
                    ms
                  </td>
                  <td className="p-2 text-slate-500">Simulated TCP framing and in-memory Redis hop latency</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Server Connection Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
              4. Cluster Node Allocation Matrix
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2 border-b">Node ID</th>
                  <th className="p-2 border-b">Port</th>
                  <th className="p-2 border-b">Status</th>
                  <th className="p-2 border-b">Active Connections</th>
                  <th className="p-2 border-b">Allocated Client IDs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.servers.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2 font-semibold text-slate-800">{s.name}</td>
                    <td className="p-2 font-mono">:{s.port}</td>
                    <td className="p-2 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-bold">{s.activeConnectionIds.length}</td>
                    <td className="p-2 font-mono text-[11px] text-slate-600">
                      {s.activeConnectionIds.length > 0
                        ? s.activeConnectionIds
                            .map((cid) => state.clients.find((c) => c.id === cid)?.name || cid)
                            .join(', ')
                        : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: Auto-Generated Observations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
              5. Automated Dynamic Observations
            </h3>
            {state.observations.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border">
                No advanced multi-server experiments or fault events recorded yet. Perform cross-server
                messaging or server failure tests in the simulation to populate verified observations.
              </p>
            ) : (
              <div className="space-y-2">
                {state.observations.map((obs) => (
                  <div key={obs.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-blue-900 uppercase text-[10px] font-mono block mb-0.5">
                      [{obs.category.toUpperCase()}] Verified Observation:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{obs.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Conclusion */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2">
              6. Laboratory Conclusion & Inferences
            </h3>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p>
                1. <strong>Persistent Socket Integrity:</strong> The experiment confirmed that
                WebSocket connections remain persistently bound to the specific server instance that
                accepted the HTTP 101 Upgrade handshake.
              </p>
              <p>
                2. <strong>Decoupled Pub/Sub Backplane:</strong> Cross-server communication was
                successfully achieved without N-to-N mesh topology by delegating message fan-out to the
                simulated Redis Pub/Sub backplane.
              </p>
              <p>
                3. <strong>Stateful Fault Recovery:</strong> Unlike stateless HTTP microservices,
                WebSocket server crashes terminate active sockets immediately. Recovery requires
                client-side exponential backoff and health-aware load balancing.
              </p>
              <p className="text-[11px] text-slate-500 italic">
                * Note: This academic report is produced by an educational frontend simulation and reflects
                deterministic distributed state logic rather than live server hardware.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t flex justify-between text-xs text-slate-500">
            <div>
              <span className="block font-semibold text-slate-700">Student Signature:</span>
              <span className="block mt-4 border-b border-slate-400 w-36"></span>
            </div>
            <div>
              <span className="block font-semibold text-slate-700">Faculty / Evaluator Signature:</span>
              <span className="block mt-4 border-b border-slate-400 w-36"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
