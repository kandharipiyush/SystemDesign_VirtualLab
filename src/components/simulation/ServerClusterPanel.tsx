import React from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import {
  Server,
  Power,
  RotateCcw,
  Plus,
  Trash2,
  Activity,
  Radio,
  Cpu,
} from 'lucide-react';

export const ServerClusterPanel: React.FC = () => {
  const { state, stopServer, startServer, restartServer, addServer, removeServer, triggerHealthCheck } =
    useSimulation();

  const handleAddServer3 = () => {
    addServer('server-3', 'WebSocket Server 3', 8003);
  };

  const hasServer3 = state.servers.some((s) => s.id === 'server-3');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">WebSocket Server Cluster</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {state.servers.filter((s) => s.status === 'healthy').length} / {state.servers.length} Healthy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent gateway instances terminating persistent TCP sessions and interfacing with Redis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerHealthCheck}
            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            title="Execute simulated cluster health probe"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Health Probe</span>
          </button>

          {!hasServer3 && state.servers.length < 3 && (
            <button
              onClick={handleAddServer3}
              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Scale Cluster (Add Node 3)</span>
            </button>
          )}
        </div>
      </div>

      {/* Servers list */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.servers.map((server) => {
          const isHealthy = server.status === 'healthy';

          return (
            <div
              key={server.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isHealthy
                  ? 'border-slate-200 bg-white shadow-xs hover:border-blue-300'
                  : 'border-rose-200 bg-rose-50/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`p-2 rounded-lg shrink-0 ${
                        isHealthy ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      <Server className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{server.name}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">Port :{server.port}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      ></span>
                      <span>{isHealthy ? 'HEALTHY' : 'OFFLINE'}</span>
                    </span>

                    {server.id === 'server-3' && (
                      <button
                        onClick={() => removeServer(server.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded"
                        title="Remove optional 3rd node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subsystems & Metrics */}
                <div className="mt-3.5 space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-slate-600 gap-2">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1.5 shrink-0">
                      <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Active TCP Sockets:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {server.activeConnectionIds.length} Clients
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 gap-2">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1.5 shrink-0">
                      <Radio className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Redis Pub/Sub Received:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {server.messagesReceivedFromBroker} msgs
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 gap-2">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1.5 shrink-0">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Frames Pushed to Clients:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {server.messagesDeliveredToClients} frames
                    </span>
                  </div>
                </div>

                {/* Active Connections Tag Chips */}
                <div className="mt-3 text-[11px]">
                  <span className="text-slate-400 text-[10px] block mb-1">Local Socket Descriptors:</span>
                  <div className="flex flex-wrap gap-1 min-h-[24px]">
                    {server.activeConnectionIds.length > 0 ? (
                      server.activeConnectionIds.map((cid) => {
                        const cl = state.clients.find((c) => c.id === cid);
                        return (
                          <span
                            key={cid}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]"
                          >
                            {cl?.name || cid}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No active sockets</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                {isHealthy ? (
                  <>
                    <button
                      onClick={() => restartServer(server.id)}
                      className="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      title="Graceful reboot simulation"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restart</span>
                    </button>
                    <button
                      onClick={() => stopServer(server.id)}
                      className="text-xs font-semibold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      title="Simulate crash or shutdown"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Crash Node</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startServer(server.id)}
                    className="text-xs font-semibold px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap shrink-0"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Boot / Recover</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
