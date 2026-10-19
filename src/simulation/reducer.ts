import type { SimulationState, SimulationAction, EventLogItem } from './types';
import { createInitialState } from './initialState';
import { selectServer } from './loadBalancer';
import { processPublishMessage } from './messageBroker';
import { generateLogId } from './utils';

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  const now = Date.now();

  switch (action.type) {
    case 'CONNECT_CLIENT': {
      const client = state.clients.find((c) => c.id === action.payload.clientId);
      if (!client || client.status === 'connected') return state;

      const decision = selectServer(state.servers, state.routingStrategy, state.roundRobinCursor);

      if (!decision.selectedServer) {
        const errorLog: EventLogItem = {
          id: generateLogId('conn-err'),
          timestamp: now,
          type: 'client_connect',
          severity: 'error',
          title: 'Connection Refused',
          details: `Load Balancer rejected connection for ${client.name}: ${decision.reason}`,
          clientId: client.id,
        };
        return {
          ...state,
          clients: state.clients.map((c) =>
            c.id === client.id ? { ...c, status: 'failed', assignedServerId: null } : c
          ),
          eventLogs: [errorLog, ...state.eventLogs],
        };
      }

      const assignedServer = decision.selectedServer;
      const logs: EventLogItem[] = [
        {
          id: generateLogId('route'),
          timestamp: now,
          type: 'routing_assignment',
          severity: 'info',
          title: 'Load Balancer Route',
          details: `Incoming connection from ${client.name} routed to ${assignedServer.name} via [${
            state.routingStrategy === 'round-robin' ? 'Round Robin' : 'Least Connections'
          }]. ${decision.reason}`,
          clientId: client.id,
          serverId: assignedServer.id,
        },
        {
          id: generateLogId('conn'),
          timestamp: now + 1,
          type: 'client_connect',
          severity: 'success',
          title: 'WebSocket Handshake 101',
          details: `${client.name} upgraded HTTP to persistent WebSocket connection on ${assignedServer.name} (Port :${assignedServer.port}).`,
          clientId: client.id,
          serverId: assignedServer.id,
        },
      ];

      const nextClients = state.clients.map((c) =>
        c.id === client.id
          ? {
              ...c,
              status: 'connected' as const,
              assignedServerId: assignedServer.id,
              reconnectAttempts: 0,
            }
          : c
      );

      const nextServers = state.servers.map((s) =>
        s.id === assignedServer.id
          ? {
              ...s,
              activeConnectionIds: Array.from(new Set([...s.activeConnectionIds, client.id])),
            }
          : s
      );

      const nextRoutingAssignments = {
        ...state.stats.routingAssignments,
        [assignedServer.id]: (state.stats.routingAssignments[assignedServer.id] || 0) + 1,
      };

      return {
        ...state,
        clients: nextClients,
        servers: nextServers,
        roundRobinCursor: decision.nextCursor,
        eventLogs: [...logs, ...state.eventLogs],
        stats: {
          ...state.stats,
          routingAssignments: nextRoutingAssignments,
        },
      };
    }

    case 'DISCONNECT_CLIENT': {
      const client = state.clients.find((c) => c.id === action.payload.clientId);
      if (!client || client.status === 'disconnected') return state;

      const server = state.servers.find((s) => s.id === client.assignedServerId);

      const log: EventLogItem = {
        id: generateLogId('disconn'),
        timestamp: now,
        type: 'client_disconnect',
        severity: 'info',
        title: 'Client Disconnected',
        details: `${client.name} terminated WebSocket session on ${server ? server.name : 'server'}. Local connection table updated.`,
        clientId: client.id,
        serverId: server?.id,
      };

      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === client.id ? { ...c, status: 'disconnected', assignedServerId: null } : c
        ),
        servers: state.servers.map((s) =>
          s.id === client.assignedServerId
            ? { ...s, activeConnectionIds: s.activeConnectionIds.filter((id) => id !== client.id) }
            : s
        ),
        eventLogs: [log, ...state.eventLogs],
      };
    }

    case 'RECONNECT_CLIENT': {
      const client = state.clients.find((c) => c.id === action.payload.clientId);
      if (!client) return state;

      // Clean old server binding if present
      const cleanServers = state.servers.map((s) => ({
        ...s,
        activeConnectionIds: s.activeConnectionIds.filter((id) => id !== client.id),
      }));

      const decision = selectServer(cleanServers, state.routingStrategy, state.roundRobinCursor);

      if (!decision.selectedServer) {
        const errorLog: EventLogItem = {
          id: generateLogId('reconn-err'),
          timestamp: now,
          type: 'client_reconnected',
          severity: 'error',
          title: 'Reconnection Failed',
          details: `Could not reconnect ${client.name}: No healthy cluster instances available.`,
          clientId: client.id,
        };
        return {
          ...state,
          servers: cleanServers,
          clients: state.clients.map((c) =>
            c.id === client.id
              ? { ...c, status: 'failed', assignedServerId: null, reconnectAttempts: (c.reconnectAttempts || 0) + 1 }
              : c
          ),
          eventLogs: [errorLog, ...state.eventLogs],
        };
      }

      const assignedServer = decision.selectedServer;
      const logs: EventLogItem[] = [
        {
          id: generateLogId('reconn'),
          timestamp: now,
          type: 'client_reconnected',
          severity: 'success',
          title: 'Client Reconnected',
          details: `${client.name} successfully re-established WebSocket session with ${assignedServer.name} via ${decision.reason}.`,
          clientId: client.id,
          serverId: assignedServer.id,
        },
      ];

      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === client.id
            ? { ...c, status: 'connected', assignedServerId: assignedServer.id, reconnectAttempts: 0 }
            : c
        ),
        servers: cleanServers.map((s) =>
          s.id === assignedServer.id
            ? { ...s, activeConnectionIds: [...s.activeConnectionIds, client.id] }
            : s
        ),
        roundRobinCursor: decision.nextCursor,
        eventLogs: [...logs, ...state.eventLogs],
        stats: {
          ...state.stats,
          routingAssignments: {
            ...state.stats.routingAssignments,
            [assignedServer.id]: (state.stats.routingAssignments[assignedServer.id] || 0) + 1,
          },
        },
      };
    }

    case 'CONNECT_ALL_CLIENTS': {
      let tempState = { ...state };
      for (const client of tempState.clients) {
        if (client.status !== 'connected') {
          tempState = simulationReducer(tempState, {
            type: 'CONNECT_CLIENT',
            payload: { clientId: client.id },
          });
        }
      }
      return tempState;
    }

    case 'DISCONNECT_ALL_CLIENTS': {
      let tempState = { ...state };
      for (const client of tempState.clients) {
        if (client.status === 'connected') {
          tempState = simulationReducer(tempState, {
            type: 'DISCONNECT_CLIENT',
            payload: { clientId: client.id },
          });
        }
      }
      return tempState;
    }

    case 'SET_ROUTING_STRATEGY': {
      const newStrategy = action.payload.strategy;
      if (newStrategy === state.routingStrategy) return state;

      const log: EventLogItem = {
        id: generateLogId('strat'),
        timestamp: now,
        type: 'routing_assignment',
        severity: 'info',
        title: 'Routing Policy Changed',
        details: `Load Balancer switched policy to ${
          newStrategy === 'round-robin' ? 'Round Robin (Sequential)' : 'Least Connections (Adaptive Load)'
        }. Existing active connections are undisturbed.`,
      };

      return {
        ...state,
        routingStrategy: newStrategy,
        eventLogs: [log, ...state.eventLogs],
      };
    }

    case 'STOP_SERVER': {
      const server = state.servers.find((s) => s.id === action.payload.serverId);
      if (!server || server.status === 'offline') return state;

      const affectedClients = state.clients.filter((c) => c.assignedServerId === server.id);

      const logs: EventLogItem[] = [
        {
          id: generateLogId('server-down'),
          timestamp: now,
          type: 'server_down',
          severity: 'error',
          title: `${server.name} Crashed / Stopped`,
          details: `Instance offline. Terminated ${affectedClients.length} active client connection(s). Redis Pub/Sub unsubscribe initiated.`,
          serverId: server.id,
        },
      ];

      affectedClients.forEach((c) => {
        logs.push({
          id: generateLogId(`client-drop-${c.id}`),
          timestamp: now + 1,
          type: 'client_disconnect',
          severity: 'warning',
          title: `Connection Terminated (${c.name})`,
          details: `WebSocket connection to ${server.name} was aborted due to server outage. Client is now Disconnected.`,
          clientId: c.id,
          serverId: server.id,
        });
      });

      const nextObservations = [...state.observations];
      if (!nextObservations.some((o) => o.category === 'fault' && o.text.includes(server.name))) {
        nextObservations.push({
          id: `obs-fault-${now}`,
          timestamp: now,
          category: 'fault',
          text: `Fault Tolerance Event: When ${server.name} failed, its ${affectedClients.length} connected client(s) were immediately disconnected. Proves that WebSockets are stateful point-to-point connections.`,
        });
      }

      return {
        ...state,
        servers: state.servers.map((s) =>
          s.id === server.id ? { ...s, status: 'offline', activeConnectionIds: [] } : s
        ),
        clients: state.clients.map((c) =>
          c.assignedServerId === server.id ? { ...c, status: 'disconnected', assignedServerId: null } : c
        ),
        eventLogs: [...logs, ...state.eventLogs],
        observations: nextObservations,
      };
    }

    case 'START_SERVER': {
      const server = state.servers.find((s) => s.id === action.payload.serverId);
      if (!server || server.status === 'healthy') return state;

      const log: EventLogItem = {
        id: generateLogId('server-up'),
        timestamp: now,
        type: 'server_recovery',
        severity: 'success',
        title: `${server.name} Recovered & Healthy`,
        details: `Instance rebooted on :${server.port}. Resubscribed to Redis channels [${server.subscribedChannels.join(
          ', '
        )}]. Ready to accept new load-balanced clients. Note: Disconnected clients must reconnect.`,
        serverId: server.id,
      };

      const nextObservations = [...state.observations];
      if (!nextObservations.some((o) => o.category === 'fault' && o.text.includes('restarted'))) {
        nextObservations.push({
          id: `obs-recov-${now}`,
          timestamp: now,
          category: 'fault',
          text: `Recovery Observation: ${server.name} recovered and resumed Redis subscriptions. Previously disconnected clients did not automatically reconnect until explicitly prompted.`,
        });
      }

      return {
        ...state,
        servers: state.servers.map((s) =>
          s.id === server.id ? { ...s, status: 'healthy', lastHeartbeat: now } : s
        ),
        eventLogs: [log, ...state.eventLogs],
        observations: nextObservations,
      };
    }

    case 'RESTART_SERVER': {
      const stoppedState = simulationReducer(state, {
        type: 'STOP_SERVER',
        payload: { serverId: action.payload.serverId },
      });
      return simulationReducer(stoppedState, {
        type: 'START_SERVER',
        payload: { serverId: action.payload.serverId },
      });
    }

    case 'ADD_SERVER': {
      const { id, name, port } = action.payload;
      if (state.servers.some((s) => s.id === id)) return state;

      const newServer = {
        id,
        name,
        port,
        status: 'healthy' as const,
        activeConnectionIds: [],
        subscribedChannels: [...state.channels],
        messagesReceivedFromBroker: 0,
        messagesDeliveredToClients: 0,
        lastHeartbeat: now,
      };

      const log: EventLogItem = {
        id: generateLogId('add-server'),
        timestamp: now,
        type: 'server_recovery',
        severity: 'success',
        title: `Cluster Scaled: ${name} Added`,
        details: `Added new WebSocket Gateway node on simulated port :${port}. Subscribed to all Pub/Sub channels.`,
        serverId: id,
      };

      return {
        ...state,
        servers: [...state.servers, newServer],
        stats: {
          ...state.stats,
          routingAssignments: {
            ...state.stats.routingAssignments,
            [id]: 0,
          },
        },
        eventLogs: [log, ...state.eventLogs],
      };
    }

    case 'REMOVE_SERVER': {
      if (state.servers.length <= 2) return state; // keep at least 2 servers for core lab
      const stopped = simulationReducer(state, {
        type: 'STOP_SERVER',
        payload: { serverId: action.payload.serverId },
      });
      return {
        ...stopped,
        servers: stopped.servers.filter((s) => s.id !== action.payload.serverId),
      };
    }

    case 'TRIGGER_HEALTH_CHECK': {
      const updatedServers = state.servers.map((s) =>
        s.status === 'healthy' ? { ...s, lastHeartbeat: now } : s
      );

      const log: EventLogItem = {
        id: generateLogId('hb'),
        timestamp: now,
        type: 'health_check',
        severity: 'info',
        title: 'Cluster Health Monitor Ping',
        details: `Health check probe executed across ${state.servers.length} nodes. Healthy nodes: ${
          updatedServers.filter((s) => s.status === 'healthy').length
        }. Offline nodes: ${updatedServers.filter((s) => s.status !== 'healthy').length}.`,
      };

      return {
        ...state,
        servers: updatedServers,
        eventLogs: [log, ...state.eventLogs],
      };
    }

    case 'PUBLISH_MESSAGE': {
      const result = processPublishMessage(
        state,
        action.payload.senderId,
        action.payload.channel,
        action.payload.content
      );

      if ('error' in result) {
        const errorLog: EventLogItem = {
          id: generateLogId('pub-err'),
          timestamp: now,
          type: 'delivery_failed',
          severity: 'error',
          title: 'Publish Error',
          details: result.error,
          clientId: action.payload.senderId,
          channel: action.payload.channel,
        };
        return {
          ...state,
          eventLogs: [errorLog, ...state.eventLogs],
        };
      }

      return result.nextState;
    }

    case 'ADD_CLIENT': {
      if (state.clients.length >= 10) return state;
      const clientCount = state.clients.length + 1;
      const id = `client-${Date.now().toString(36).substring(3, 7)}`;
      const name = action.payload.name.trim() || `Client ${String.fromCharCode(64 + clientCount)}`;
      const deviceType = action.payload.deviceType || 'web';

      const newClient = {
        id,
        name,
        deviceType,
        status: 'disconnected' as const,
        assignedServerId: null,
        subscribedChannels: ['chat-room', 'notifications'],
        sentMessagesCount: 0,
        receivedMessagesCount: 0,
      };

      const log: EventLogItem = {
        id: generateLogId('add-client'),
        timestamp: now,
        type: 'client_connect',
        severity: 'info',
        title: 'New Client Registered',
        details: `Created simulated client ${name} (${deviceType}). Ready to connect.`,
        clientId: id,
      };

      return {
        ...state,
        clients: [...state.clients, newClient],
        eventLogs: [log, ...state.eventLogs],
      };
    }

    case 'REMOVE_CLIENT': {
      const client = state.clients.find((c) => c.id === action.payload.clientId);
      if (!client) return state;

      const disconnectedState = simulationReducer(state, {
        type: 'DISCONNECT_CLIENT',
        payload: { clientId: client.id },
      });

      return {
        ...disconnectedState,
        clients: disconnectedState.clients.filter((c) => c.id !== client.id),
      };
    }

    case 'EDIT_CLIENT_NAME': {
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.clientId ? { ...c, name: action.payload.name.trim() || c.name } : c
        ),
      };
    }

    case 'CLIENT_SUBSCRIBE_CHANNEL': {
      const { clientId, channel } = action.payload;
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === clientId && !c.subscribedChannels.includes(channel)
            ? { ...c, subscribedChannels: [...c.subscribedChannels, channel] }
            : c
        ),
      };
    }

    case 'CLIENT_UNSUBSCRIBE_CHANNEL': {
      const { clientId, channel } = action.payload;
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === clientId
            ? { ...c, subscribedChannels: c.subscribedChannels.filter((ch) => ch !== channel) }
            : c
        ),
      };
    }

    case 'CLEAR_LOGS': {
      // CLEAR DISPLAYED LOGS WITHOUT RESETING METRICS OR STATE!
      return {
        ...state,
        eventLogs: [
          {
            id: generateLogId('cleared'),
            timestamp: now,
            type: 'sim_reset',
            severity: 'info',
            title: 'Display Log Cleared',
            details: 'Event log view cleared. Underlying counters, active connections, and cluster states are preserved.',
          },
        ],
      };
    }

    case 'SET_ANIMATION_STEP': {
      return {
        ...state,
        activeAnimation: action.payload.activeAnimation,
      };
    }

    case 'SET_PAUSED': {
      return {
        ...state,
        isPaused: action.payload.isPaused,
      };
    }

    case 'SET_ANIMATION_SPEED': {
      return {
        ...state,
        animationSpeed: action.payload.speed,
      };
    }

    case 'RESET_SIMULATION': {
      return createInitialState();
    }

    default:
      return state;
  }
}
