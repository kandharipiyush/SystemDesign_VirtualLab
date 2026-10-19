import React, { useState } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import {
  Send,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Radio,
  User,
  CheckCircle2,
} from 'lucide-react';

export const MessageConsole: React.FC = () => {
  const { state, publishMessage } = useSimulation();

  const connectedClients = state.clients.filter((c) => c.status === 'connected');
  const [selectedSenderId, setSelectedSenderId] = useState<string>(
    connectedClients[0]?.id || state.clients[0]?.id || ''
  );
  const [selectedChannel, setSelectedChannel] = useState<string>('chat-room');
  const [messageContent, setMessageContent] = useState<string>('Hello from distributed client!');

  const activeSender = state.clients.find((c) => c.id === selectedSenderId);
  const assignedServer = state.servers.find((s) => s.id === activeSender?.assignedServerId);

  const canSend =
    activeSender &&
    activeSender.status === 'connected' &&
    assignedServer &&
    assignedServer.status === 'healthy' &&
    messageContent.trim().length > 0;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    publishMessage(selectedSenderId, selectedChannel, messageContent.trim());
  };

  const templates = [
    'Hello from distributed client!',
    'Real-time sync test payload',
    'Cluster notification: telemetry update',
    'Heartbeat ping check #42',
  ];

  // Calculate projected recipients
  const healthySubscribedServers = state.servers.filter(
    (s) => s.status === 'healthy' && s.subscribedChannels.includes(selectedChannel)
  );

  const projectedRecipients = state.clients.filter(
    (c) =>
      c.status === 'connected' &&
      c.assignedServerId &&
      healthySubscribedServers.some((s) => s.id === c.assignedServerId) &&
      c.subscribedChannels.includes(selectedChannel) &&
      c.id !== selectedSenderId
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-600 text-white">
            <MessageSquare className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Message Dispatch Console</h3>
            <p className="text-xs text-slate-500">
              Transmit frames over WebSocket; origin gateway publishes to simulated Redis backplane.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSend} className="mt-4 space-y-4 text-xs">
        {/* Top Controls: Sender and Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Transmitting Client (Sender):</span>
            </label>
            <select
              value={selectedSenderId}
              onChange={(e) => setSelectedSenderId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-blue-500 font-medium"
            >
              {state.clients.map((c) => {
                const srv = state.servers.find((s) => s.id === c.assignedServerId);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status.toUpperCase()}
                    {srv ? ` on ${srv.name}` : ''})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-rose-600" />
              <span>Redis Pub/Sub Target Channel:</span>
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-blue-500 font-medium font-mono"
            >
              {state.channels.map((ch) => (
                <option key={ch} value={ch}>
                  channel:{ch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sender Status Banner */}
        <div className="p-2.5 rounded-lg border text-xs flex items-center justify-between bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeSender?.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            ></span>
            <span className="text-slate-700">
              Sender Status:{' '}
              <strong className="text-slate-900 font-mono">{activeSender?.status.toUpperCase()}</strong>
              {assignedServer && (
                <>
                  {' '}
                  via{' '}
                  <strong className="text-blue-700 font-mono">
                    {assignedServer.name} (:{assignedServer.port})
                  </strong>
                </>
              )}
            </span>
          </div>

          {activeSender?.status !== 'connected' ? (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Must connect client first</span>
            </span>
          ) : assignedServer?.status !== 'healthy' ? (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Assigned server is offline</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Projected Recipients: {projectedRecipients.length} client(s)
              </span>
            </span>
          )}
        </div>

        {/* Quick Message Templates */}
        <div>
          <span className="text-slate-500 text-[11px] block mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Preset Experiment Payloads:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessageContent(tpl)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] border border-slate-200 transition-colors"
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input & Submit */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type WebSocket frame payload..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-blue-500 font-medium text-xs"
            maxLength={100}
          />
          <button
            type="submit"
            disabled={!canSend}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              canSend
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Frame</span>
          </button>
        </div>
      </form>
    </div>
  );
};
