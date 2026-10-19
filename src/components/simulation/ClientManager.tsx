import React, { useState } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import {
  Laptop,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  Plug,
  Unplug,
  RefreshCw,
  Edit2,
  Check,
  X,
  Tag,
} from 'lucide-react';

export const ClientManager: React.FC = () => {
  const {
    state,
    connectClient,
    disconnectClient,
    reconnectClient,
    connectAll,
    disconnectAll,
    addClient,
    removeClient,
    editClientName,
    subscribeClient,
    unsubscribeClient,
  } = useSimulation();

  const [newClientName, setNewClientName] = useState('');
  const [newClientDevice, setNewClientDevice] = useState<'web' | 'mobile' | 'desktop'>('web');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.clients.length >= 10) return;
    addClient(newClientName.trim() || `Client ${String.fromCharCode(65 + state.clients.length)}`, newClientDevice);
    setNewClientName('');
    setIsAdding(false);
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = (id: string) => {
    editClientName(id, editingName);
    setEditingId(null);
  };

  const connectedCount = state.clients.filter((c) => c.status === 'connected').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Simulated Client Registry</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
              {connectedCount} / {state.clients.length} Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage WebSocket endpoints, toggle channels, and evaluate load balancing. Max 10 clients.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={connectAll}
            className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="Connect all disconnected clients"
          >
            <Plug className="w-3.5 h-3.5 shrink-0" />
            <span>Connect All</span>
          </button>
          <button
            onClick={disconnectAll}
            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="Disconnect all clients"
          >
            <Unplug className="w-3.5 h-3.5 shrink-0" />
            <span>Disconnect All</span>
          </button>
          {state.clients.length < 10 && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs bg-blue-600 text-white hover:bg-blue-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Client Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddClient} className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder={`Client ${String.fromCharCode(65 + state.clients.length)}`}
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-blue-500 w-full sm:w-48"
              maxLength={20}
              autoFocus
            />
            <select
              value={newClientDevice}
              onChange={(e) => setNewClientDevice(e.target.value as any)}
              className="px-2 py-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-blue-500 text-xs"
            >
              <option value="web">Web Browser (Chrome/Firefox)</option>
              <option value="mobile">Mobile App (iOS/Android)</option>
              <option value="desktop">Desktop Client (Electron)</option>
            </select>
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Clients Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {state.clients.map((client) => {
          const assignedServer = state.servers.find((s) => s.id === client.assignedServerId);
          const isConnected = client.status === 'connected';

          return (
            <div
              key={client.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isConnected
                  ? 'border-blue-200 bg-white shadow-xs'
                  : client.status === 'failed'
                  ? 'border-rose-200 bg-rose-50/50'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isConnected ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {client.deviceType === 'mobile' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : client.deviceType === 'desktop' ? (
                        <Monitor className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </span>

                    {editingId === client.id ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-1.5 py-0.5 text-xs border rounded w-28 font-medium text-slate-800"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(client.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-900 truncate">{client.name}</span>
                        <button
                          onClick={() => handleStartEdit(client.id, client.name)}
                          className="text-slate-400 hover:text-slate-600 shrink-0"
                          title="Edit name"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isConnected
                          ? 'bg-emerald-100 text-emerald-800'
                          : client.status === 'failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isConnected ? 'bg-emerald-500' : client.status === 'failed' ? 'bg-rose-500' : 'bg-slate-400'
                        }`}
                      ></span>
                      <span>{client.status.toUpperCase()}</span>
                    </span>

                    {state.clients.length > 2 && (
                      <button
                        onClick={() => removeClient(client.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors shrink-0"
                        title="Remove client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment & Counters */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[10px]">Assigned Server:</span>
                    <span className="font-semibold text-slate-700 truncate block">
                      {assignedServer ? (
                        <span className="text-blue-700 font-mono text-[11px]">
                          {assignedServer.name} (:{assignedServer.port})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Message Traffic:</span>
                    <span className="font-mono text-slate-600 font-semibold text-[11px] whitespace-nowrap">
                      {client.sentMessagesCount} Sent · {client.receivedMessagesCount} Recv
                    </span>
                  </div>
                </div>

                {/* Channel Subscriptions */}
                <div className="mt-2.5 text-xs">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                    <Tag className="w-2.5 h-2.5" />
                    <span>Subscribed Topics:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {state.channels.map((ch) => {
                      const isSubscribed = client.subscribedChannels.includes(ch);
                      return (
                        <button
                          key={ch}
                          onClick={() =>
                            isSubscribed ? unsubscribeClient(client.id, ch) : subscribeClient(client.id, ch)
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors whitespace-nowrap ${
                            isSubscribed
                              ? 'bg-blue-100 text-blue-800 border border-blue-300 font-semibold'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                          }`}
                          title={isSubscribed ? 'Click to unsubscribe' : 'Click to subscribe'}
                        >
                          #{ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                {isConnected ? (
                  <button
                    onClick={() => disconnectClient(client.id)}
                    className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Unplug className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => connectClient(client.id)}
                      className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap shrink-0"
                    >
                      <Plug className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                    <button
                      onClick={() => reconnectClient(client.id)}
                      className="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      title="Force reconnect through load balancer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reconnect</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
