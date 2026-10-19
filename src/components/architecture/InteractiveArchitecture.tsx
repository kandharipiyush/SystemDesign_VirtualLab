import React, { useState } from 'react';
import { useSimulation } from '../../simulation/SimulationContext';
import {
  Server,
  Smartphone,
  Laptop,
  Monitor,
  Cpu,
  Layers,
  Activity,
  Radio,
  ArrowDown,
  Info,
  X,
  Zap,
} from 'lucide-react';

export const InteractiveArchitecture: React.FC = () => {
  const { state, setRoutingStrategy } = useSimulation();
  const [selectedComponent, setSelectedComponent] = useState<{
    title: string;
    type: string;
    role: string;
    status: string;
    metrics: string[];
    details: string;
  } | null>(null);

  const healthyServers = state.servers.filter((s) => s.status === 'healthy');
  const connectedClients = state.clients.filter((c) => c.status === 'connected');
  const isAnimating = !!state.activeAnimation;
  const currentStep = state.activeAnimation?.step;

  const handleInspect = (comp: typeof selectedComponent) => {
    setSelectedComponent(comp);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      {/* Header bar of Diagram */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">
              System Topology
            </span>
            <span className="text-xs text-slate-500 font-mono">RFC 6455 + Redis Backplane</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Real-Time Pub/Sub WebSocket Gateway Architecture
          </h3>
          <p className="text-xs text-slate-500">
            Click on any tier or component to inspect live state, routing cursor, and telemetry.
          </p>
        </div>

        {/* Live Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700">Healthy / Up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-700">Node Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-slate-700">Packet In Flight</span>
          </div>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="mt-6 flex flex-col items-center space-y-6 max-w-4xl mx-auto">
        {/* TIER 1: CLIENTS TIER */}
        <div
          onClick={() =>
            handleInspect({
              title: 'Client Tier (Edge Devices)',
              type: 'Client Endpoints',
              role: 'Initiates persistent WebSocket TCP connections after HTTP 101 Upgrade.',
              status: `${connectedClients.length} of ${state.clients.length} connected`,
              metrics: [
                `Total Registered Clients: ${state.clients.length}`,
                `Active WebSocket Sockets: ${connectedClients.length}`,
                `Subscribed Channels: ${state.channels.join(', ')}`,
              ],
              details:
                'Clients represent end-user browsers, mobile apps, or desktop clients. Each holds a single persistent full-duplex TCP stream to its assigned gateway server instance.',
            })
          }
          className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
            isAnimating && (currentStep === 'client_to_server' || currentStep === 'servers_to_clients')
              ? 'border-blue-500 bg-blue-50/60 shadow-md ring-2 ring-blue-200'
              : 'border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Laptop className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tier 1: Client Endpoints
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
              {connectedClients.length} Active / {state.clients.length} Total
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {state.clients.map((client) => {
              const isSender = state.activeAnimation?.message.senderId === client.id;
              const isRecipient = state.activeAnimation?.message.deliveredClientIds.includes(client.id);

              return (
                <div
                  key={client.id}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    client.status === 'connected'
                      ? isSender
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                        : isRecipient && isAnimating
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                        : 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-100/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800">
                      {client.deviceType === 'mobile' ? (
                        <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      ) : client.deviceType === 'desktop' ? (
                        <Monitor className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{client.name}</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        client.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    ></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between items-center">
                    <span>
                      {client.assignedServerId ? (
                        <span className="text-blue-700 font-semibold">
                          {state.servers.find((s) => s.id === client.assignedServerId)?.name.replace('WebSocket ', '')}
                        </span>
                      ) : (
                        'Disconnected'
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {client.sentMessagesCount}↑ {client.receivedMessagesCount}↓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONNECTOR ARROW 1 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-0.5 h-6 transition-colors ${
              isAnimating && (currentStep === 'client_to_server' || currentStep === 'servers_to_clients')
                ? 'bg-blue-600 scale-125'
                : 'bg-slate-300'
            }`}
          ></div>
          <div className="relative">
            <ArrowDown
              className={`w-4 h-4 transition-colors ${
                isAnimating && currentStep === 'client_to_server'
                  ? 'text-blue-600 animate-bounce'
                  : 'text-slate-400'
              }`}
            />
            {isAnimating && currentStep === 'client_to_server' && (
              <span className="absolute -right-24 -top-1 px-1.5 py-0.5 text-[10px] bg-blue-600 text-white rounded font-mono shadow-xs">
                WS Frame →
              </span>
            )}
          </div>
        </div>

        {/* TIER 2: NETWORK LOAD BALANCER */}
        <div
          onClick={() =>
            handleInspect({
              title: 'Network Load Balancer (NGINX / HAProxy)',
              type: 'Reverse Proxy & Layer 4/7 Load Balancer',
              role: 'Distributes incoming TCP handshakes across healthy gateway nodes.',
              status: `Strategy: ${state.routingStrategy === 'round-robin' ? 'Round Robin' : 'Least Connections'}`,
              metrics: [
                `Active Strategy: ${state.routingStrategy.toUpperCase()}`,
                `Round Robin Cursor: Index ${state.roundRobinCursor}`,
                `Healthy Targets: ${healthyServers.length} of ${state.servers.length}`,
                `Total Routed: ${Object.values(state.stats.routingAssignments).reduce((a, b) => a + b, 0)}`,
              ],
              details:
                'Inspects incoming HTTP 101 Upgrade requests and delegates the TCP stream to an active server instance. When a server goes offline, it automatically isolates the failed node.',
            })
          }
          className="w-full max-w-xl p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl shadow-md border border-blue-950 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold tracking-wide">Network Load Balancer</h4>
                <p className="text-[11px] text-blue-200">Reverse Proxy & Health-Aware Connection Router</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRoutingStrategy(state.routingStrategy === 'round-robin' ? 'least-connections' : 'round-robin');
                }}
                className="text-xs bg-blue-700/80 hover:bg-blue-600 text-white font-medium px-2.5 py-1 rounded-md border border-blue-500/40 transition-colors"
                title="Click to toggle routing algorithm"
              >
                {state.routingStrategy === 'round-robin' ? 'Mode: Round Robin' : 'Mode: Least Conn'}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-blue-800/60 text-xs">
            <div className="bg-blue-950/60 p-2 rounded border border-blue-800/40">
              <span className="text-[10px] text-blue-300 block">Routing Algorithm</span>
              <span className="font-semibold text-white">
                {state.routingStrategy === 'round-robin' ? 'Round Robin (Seq)' : 'Least Connections'}
              </span>
            </div>
            <div className="bg-blue-950/60 p-2 rounded border border-blue-800/40">
              <span className="text-[10px] text-blue-300 block">Healthy Backends</span>
              <span className="font-semibold text-emerald-400">
                {healthyServers.length} / {state.servers.length} Available
              </span>
            </div>
            <div className="bg-blue-950/60 p-2 rounded border border-blue-800/40">
              <span className="text-[10px] text-blue-300 block">Round Robin Cursor</span>
              <span className="font-semibold text-amber-300 font-mono">
                Index {state.roundRobinCursor} ({state.servers[state.roundRobinCursor % state.servers.length]?.name || 'N/A'})
              </span>
            </div>
          </div>
        </div>

        {/* CONNECTOR ARROW 2 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-0.5 h-6 transition-colors ${
              isAnimating && (currentStep === 'server_to_broker' || currentStep === 'broker_to_servers')
                ? 'bg-blue-600 scale-125'
                : 'bg-slate-300'
            }`}
          ></div>
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* TIER 3: WEBSOCKET SERVER CLUSTER */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-slate-800 text-white">
                <Server className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tier 2: WebSocket Gateway Cluster
              </span>
            </div>
            <span className="text-xs text-slate-500">Each node maintains local connection descriptors</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.servers.map((server) => {
              const isOrigin = state.activeAnimation?.message.originServerId === server.id;
              const isSubscribedTarget =
                isAnimating &&
                currentStep === 'broker_to_servers' &&
                server.status === 'healthy';

              return (
                <div
                  key={server.id}
                  onClick={() =>
                    handleInspect({
                      title: server.name,
                      type: 'WebSocket Gateway Node',
                      role: 'Terminates client TCP connections, manages subscriptions, and interfaces with Redis.',
                      status: server.status.toUpperCase(),
                      metrics: [
                        `Port: :${server.port}`,
                        `Active Connections: ${server.activeConnectionIds.length}`,
                        `Redis Publications Received: ${server.messagesReceivedFromBroker}`,
                        `Client Frames Pushed: ${server.messagesDeliveredToClients}`,
                        `Subscribed Channels: ${server.subscribedChannels.join(', ')}`,
                      ],
                      details:
                        'Maintains an in-memory client connection manager table. It does not know about clients on other servers, relying on Redis Pub/Sub for cross-server message replication.',
                    })
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    server.status === 'healthy'
                      ? isOrigin && isAnimating
                        ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-200'
                        : isSubscribedTarget
                        ? 'border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white shadow-xs hover:border-blue-300'
                      : 'border-rose-200 bg-rose-50/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          server.status === 'healthy' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <Server className="w-4 h-4" />
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{server.name}</h5>
                        <span className="text-[10px] text-slate-500 font-mono">Port :{server.port}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        server.status === 'healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          server.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {server.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Internal Subsystems */}
                  <div className="mt-3 space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-blue-500" />
                        <span>Connection Manager:</span>
                      </span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {server.activeConnectionIds.length} Sockets
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-purple-500" />
                        <span>Pub/Sub Subscriptions:</span>
                      </span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {server.status === 'healthy' ? `${server.subscribedChannels.length} Channels` : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-500" />
                        <span>Heartbeat Health:</span>
                      </span>
                      <span className="font-semibold font-mono text-[10px] text-emerald-700">
                        {server.status === 'healthy' ? 'OK (200 /healthz)' : 'FAIL (Unresponsive)'}
                      </span>
                    </div>
                  </div>

                  {/* Connected Client Chips */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Pinned Clients:</span>
                    <div className="flex gap-1">
                      {server.activeConnectionIds.length > 0 ? (
                        server.activeConnectionIds.map((cid) => {
                          const clientObj = state.clients.find((c) => c.id === cid);
                          return (
                            <span
                              key={cid}
                              className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]"
                            >
                              {clientObj?.name || cid}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">No active sockets</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONNECTOR ARROW 3 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-0.5 h-6 transition-colors ${
              isAnimating && (currentStep === 'server_to_broker' || currentStep === 'broker_to_servers')
                ? 'bg-rose-500 scale-125'
                : 'bg-slate-300'
            }`}
          ></div>
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* TIER 4: REDIS PUB/SUB BACKPLANE */}
        <div
          onClick={() =>
            handleInspect({
              title: 'Redis Pub/Sub In-Memory Backplane',
              type: 'Distributed Message Broker (Backplane)',
              role: 'Fans out messages published by one gateway instance to all other subscribed instances.',
              status: 'READY (In-Memory Broadcast)',
              metrics: [
                `Active Channels: ${state.channels.join(', ')}`,
                `Messages Handled: ${state.stats.publishedCount}`,
                `Delivery Successes: ${state.stats.deliveredCount}`,
                `Delivery Failures: ${state.stats.failedDeliveriesCount}`,
                `Avg Simulated Latency: ~28 ms`,
              ],
              details:
                'Redis Pub/Sub operates in memory without writing messages to disk. It uses at-most-once delivery: if a server instance is offline during PUBLISH, the message is not retained or queued for replay.',
            })
          }
          className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${
            isAnimating && (currentStep === 'server_to_broker' || currentStep === 'broker_to_servers')
              ? 'border-rose-500 bg-rose-50/70 shadow-lg ring-2 ring-rose-300'
              : 'border-rose-200 bg-gradient-to-r from-rose-50 via-white to-rose-50 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs">
                <Radio className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Redis Pub/Sub Message Backplane</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-rose-100 text-rose-800 font-mono rounded">
                    At-Most-Once Fan-out
                  </span>
                </h4>
                <p className="text-xs text-slate-500">Cross-Server In-Memory Pub/Sub Routing Backbone</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                PUBLISH / SUBSCRIBE
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {state.channels.map((channel) => {
              const isChannelActive =
                state.activeAnimation?.message.channel === channel && isAnimating;

              return (
                <div
                  key={channel}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    isChannelActive
                      ? 'bg-rose-100 border-rose-400 text-rose-950 font-semibold shadow-xs ring-1 ring-rose-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-rose-900">
                      channel:{channel}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Subscribers: {state.servers.filter((s) => s.status === 'healthy').length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {channel === 'chat-room'
                      ? 'Bi-directional multi-user room broadcast'
                      : channel === 'notifications'
                      ? 'System-wide push notifications'
                      : 'Cluster telemetry & node events'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Flow Sequence Breadcrumbs */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Deterministic Message Flow Sequence:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span
              className={`px-2 py-0.5 rounded ${
                currentStep === 'client_to_server' ? 'bg-blue-600 text-white font-bold' : 'bg-white border'
              }`}
            >
              1. Client WS Send
            </span>
            <span>→</span>
            <span
              className={`px-2 py-0.5 rounded ${
                currentStep === 'server_to_broker' ? 'bg-amber-600 text-white font-bold' : 'bg-white border'
              }`}
            >
              2. Server Frame Validation & Redis PUBLISH
            </span>
            <span>→</span>
            <span
              className={`px-2 py-0.5 rounded ${
                currentStep === 'broker_to_servers' ? 'bg-rose-600 text-white font-bold' : 'bg-white border'
              }`}
            >
              3. Redis Broker Broadcast to Healthy Servers
            </span>
            <span>→</span>
            <span
              className={`px-2 py-0.5 rounded ${
                currentStep === 'servers_to_clients' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border'
              }`}
            >
              4. Server Local Client Fan-out
            </span>
          </div>
        </div>
      </div>

      {/* Component Inspector Modal / Drawer */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Info className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{selectedComponent.title}</h4>
                  <span className="text-xs text-blue-600 font-medium">{selectedComponent.type}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block">Primary Architectural Role:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{selectedComponent.role}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block">Current Status:</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-medium">
                  {selectedComponent.status}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Live Metrics & State:</span>
                <ul className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                  {selectedComponent.metrics.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block">Distributed Systems Context:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{selectedComponent.details}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
