import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';

import {
  Search,
  Filter,
  Download,
  Trash2,
  Pause,
  Play,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react';

export const EventLogViewer: React.FC = () => {
  const { state, clearLogs } = useSimulation();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [serverFilter, setServerFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState<boolean>(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive unless paused
  useEffect(() => {
    if (!isAutoScrollPaused && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [state.eventLogs, isAutoScrollPaused]);

  // Filter logs
  const filteredLogs = state.eventLogs.filter((log) => {
    if (typeFilter !== 'all' && log.type !== typeFilter) return false;
    if (serverFilter !== 'all' && log.serverId !== serverFilter) return false;
    if (channelFilter !== 'all' && log.channel !== channelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q) ||
        (log.clientId && log.clientId.toLowerCase().includes(q)) ||
        (log.serverId && log.serverId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.eventLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vlab_exp14_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Severity', 'Title', 'Details', 'ServerId', 'ClientId', 'Channel'];
    const rows = state.eventLogs.map((l) => [
      new Date(l.timestamp).toISOString(),
      `"${l.type}"`,
      `"${l.severity}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.serverId || ''}"`,
      `"${l.clientId || ''}"`,
      `"${l.channel || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `vlab_exp14_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-[520px]">
      {/* Header & Controls */}
      <div className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Real-Time Event Stream Log</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredLogs.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trace packet validation, load balancer decisions, Redis fan-out, and socket teardowns.
          </p>
        </div>

        {/* Global log buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setIsAutoScrollPaused(!isAutoScrollPaused)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
              isAutoScrollPaused
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isAutoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isAutoScrollPaused ? <Play className="w-3 h-3 text-amber-700" /> : <Pause className="w-3 h-3" />}
            <span>{isAutoScrollPaused ? 'Resume Scroll' : 'Pause Scroll'}</span>
          </button>

          <button
            onClick={clearLogs}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors"
            title="Clear displayed logs without altering state or metrics"
          >
            <Trash2 className="w-3 h-3 text-slate-500" />
            <span>Clear View</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors"
            title="Export logs as CSV"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors"
            title="Export logs as JSON"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="py-2.5 grid grid-cols-1 sm:grid-cols-4 gap-2 border-b border-slate-100 text-xs shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search events, clients, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-blue-500"
          />
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-blue-500"
          >
            <option value="all">All Event Types</option>
            <option value="client_connect">Client Connections</option>
            <option value="client_disconnect">Client Disconnections</option>
            <option value="routing_assignment">Load Balancer Routes</option>
            <option value="msg_published">Redis PUBLISH</option>
            <option value="broker_distributed">Broker Fan-out</option>
            <option value="msg_delivered">Client Socket Pushes</option>
            <option value="delivery_failed">Delivery Failures</option>
            <option value="server_down">Server Crashes</option>
            <option value="server_recovery">Server Recovery</option>
            <option value="health_check">Health Probes</option>
          </select>
        </div>

        {/* Server Filter */}
        <div>
          <select
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-blue-500"
          >
            <option value="all">All Servers</option>
            {state.servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (:{s.port})
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-blue-500 font-mono"
          >
            <option value="all">All Channels</option>
            {state.channels.map((ch) => (
              <option key={ch} value={ch}>
                #{ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Entries Container */}
      <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Filter className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
            <span>No log events match current filters</span>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const dateStr = new Date(log.timestamp).toLocaleTimeString();

            return (
              <div
                key={`${log.id}-${idx}`}
                className={`p-2.5 rounded-lg border text-xs transition-colors flex items-start gap-2.5 ${
                  log.severity === 'error'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : log.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : log.severity === 'success'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="mt-0.5">{getSeverityIcon(log.severity)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{log.title}</span>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                        {log.type}
                      </span>
                      {log.channel && (
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[10px] font-mono">
                          #{log.channel}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{dateStr}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{log.details}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
