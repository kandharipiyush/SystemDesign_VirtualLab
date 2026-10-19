import type {
  SimulationState,
  SimMessage,
  EventLogItem,
  ExperimentObservation,
} from './types';
import { generateLogId } from './utils';

export interface PublishResult {
  nextState: SimulationState;
  message: SimMessage;
  logs: EventLogItem[];
}

export function processPublishMessage(
  state: SimulationState,
  senderId: string,
  channel: string,
  content: string
): PublishResult | { error: string } {
  const sender = state.clients.find((c) => c.id === senderId);
  if (!sender) {
    return { error: 'Sender client not found in simulation registry.' };
  }

  if (sender.status !== 'connected' || !sender.assignedServerId) {
    return { error: `Client ${sender.name} is currently ${sender.status}. Messages can only be sent over an active WebSocket connection.` };
  }

  const originServer = state.servers.find((s) => s.id === sender.assignedServerId);
  if (!originServer || originServer.status !== 'healthy') {
    return { error: `Assigned server ${originServer ? originServer.name : 'Unknown'} is currently offline. WebSocket connection broken.` };
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return { error: 'Cannot send an empty message payload.' };
  }

  const now = Date.now();
  const simulatedLatencyMs = Math.floor(18 + Math.random() * 24); // 18-42ms simulated latency

  const msgId = `msg-${now}-${Math.random().toString(36).substring(2, 6)}`;
  const logs: EventLogItem[] = [];

  // Step 1: Validation Log
  logs.push({
    id: generateLogId('val'),
    timestamp: now,
    type: 'msg_validated',
    severity: 'info',
    title: 'Frame Validated',
    details: `${sender.name} framed message [${channel}]: "${trimmedContent}". Validated by ${originServer.name}.`,
    clientId: sender.id,
    serverId: originServer.id,
    channel,
  });

  // Step 2: Publish to Redis backplane
  logs.push({
    id: generateLogId('pub'),
    timestamp: now + 2,
    type: 'msg_published',
    severity: 'success',
    title: 'Redis PUBLISH Executed',
    details: `${originServer.name} executed PUBLISH channel:${channel} payload (${trimmedContent.length} bytes).`,
    serverId: originServer.id,
    channel,
  });

  // Step 3: Broker fanout to subscribed healthy servers
  const subscribedServers = state.servers.filter(
    (s) => s.status === 'healthy' && s.subscribedChannels.includes(channel)
  );

  const offlineSubscribedServers = state.servers.filter(
    (s) => s.status !== 'healthy' && s.subscribedChannels.includes(channel)
  );

  logs.push({
    id: generateLogId('broker'),
    timestamp: now + 5,
    type: 'broker_distributed',
    severity: 'info',
    title: 'Redis Backplane Fan-out',
    details: `Broker routed broadcast to ${subscribedServers.length} healthy server instance(s): [${subscribedServers.map((s) => s.name).join(', ')}].`,
    channel,
  });

  if (offlineSubscribedServers.length > 0) {
    logs.push({
      id: generateLogId('skip'),
      timestamp: now + 6,
      type: 'delivery_failed',
      severity: 'warning',
      title: 'Transient Delivery Skipped',
      details: `Redis broadcast skipped offline servers: [${offlineSubscribedServers.map((s) => s.name).join(', ')}]. Redis Pub/Sub does not buffer for offline nodes!`,
      channel,
    });
  }

  // Step 4: Server instance delivery to local clients
  const deliveredClientIds: string[] = [];
  const failedClientIds: string[] = [];
  let isCrossServer = false;

  subscribedServers.forEach((server) => {
    // Find clients connected to this server and subscribed to the channel
    const eligibleClients = state.clients.filter(
      (c) =>
        c.assignedServerId === server.id &&
        c.status === 'connected' &&
        c.subscribedChannels.includes(channel)
    );

    eligibleClients.forEach((client) => {
      if (client.id === sender.id) {
        // Sender acknowledgment (no duplicate broadcast loop)
        deliveredClientIds.push(client.id);
      } else {
        deliveredClientIds.push(client.id);
        if (server.id !== originServer.id) {
          isCrossServer = true;
        }
        logs.push({
          id: generateLogId(`deliv-${client.id}`),
          timestamp: now + 10,
          type: 'msg_delivered',
          severity: 'success',
          title: `Delivered to ${client.name}`,
          details: `${server.name} pushed WebSocket frame to ${client.name} (Client origin: ${server.name === originServer.id ? 'Local' : 'Cross-server via Redis Pub/Sub'}).`,
          clientId: client.id,
          serverId: server.id,
          channel,
        });
      }
    });
  });

  // Check clients subscribed to channel that were disconnected or on offline servers
  const undeliveredClients = state.clients.filter(
    (c) =>
      c.id !== sender.id &&
      c.subscribedChannels.includes(channel) &&
      (!deliveredClientIds.includes(c.id))
  );

  undeliveredClients.forEach((c) => {
    failedClientIds.push(c.id);
    logs.push({
      id: generateLogId(`fail-${c.id}`),
      timestamp: now + 12,
      type: 'delivery_failed',
      severity: 'warning',
      title: `Undelivered to ${c.name}`,
      details: `${c.name} did not receive broadcast: ${
        c.status !== 'connected'
          ? `Client is ${c.status}`
          : 'Assigned server is offline/unreachable'
      }.`,
      clientId: c.id,
      channel,
    });
  });

  const createdMessage: SimMessage = {
    id: msgId,
    senderId: sender.id,
    senderName: sender.name,
    channel,
    content: trimmedContent,
    timestamp: now,
    originServerId: originServer.id,
    deliveredClientIds,
    failedClientIds,
    simulatedLatencyMs,
  };

  // Update client message counts
  const nextClients = state.clients.map((c) => {
    if (c.id === sender.id) {
      return {
        ...c,
        sentMessagesCount: c.sentMessagesCount + 1,
      };
    }
    if (deliveredClientIds.includes(c.id)) {
      return {
        ...c,
        receivedMessagesCount: c.receivedMessagesCount + 1,
        lastMessageReceived: `[${channel}] ${sender.name}: ${trimmedContent}`,
      };
    }
    return c;
  });

  // Update server message counters
  const nextServers = state.servers.map((s) => {
    if (s.id === originServer.id) {
      return {
        ...s,
        messagesReceivedFromBroker: s.messagesReceivedFromBroker + 1,
        messagesDeliveredToClients:
          s.messagesDeliveredToClients +
          deliveredClientIds.filter((cid) => {
            const cl = state.clients.find((x) => x.id === cid);
            return cl && cl.assignedServerId === s.id;
          }).length,
      };
    }
    if (subscribedServers.some((sub) => sub.id === s.id)) {
      return {
        ...s,
        messagesReceivedFromBroker: s.messagesReceivedFromBroker + 1,
        messagesDeliveredToClients:
          s.messagesDeliveredToClients +
          deliveredClientIds.filter((cid) => {
            const cl = state.clients.find((x) => x.id === cid);
            return cl && cl.assignedServerId === s.id;
          }).length,
      };
    }
    return s;
  });

  // Generate automated dynamic observation
  const newObservations: ExperimentObservation[] = [...state.observations];
  if (isCrossServer) {
    const obsId = `obs-cross-${now}`;
    if (!newObservations.some((o) => o.category === 'messaging' && o.text.includes('cross-server'))) {
      newObservations.push({
        id: obsId,
        timestamp: now,
        category: 'messaging',
        text: `Cross-server messaging verified: Message from ${sender.name} (on ${originServer.name}) successfully reached subscriber(s) on peer servers through Redis Pub/Sub channel [${channel}].`,
      });
    }
  }

  if (failedClientIds.length > 0) {
    const obsId = `obs-fail-${now}`;
    if (!newObservations.some((o) => o.category === 'fault' && o.text.includes('transient drop'))) {
      newObservations.push({
        id: obsId,
        timestamp: now,
        category: 'fault',
        text: `Transient loss observed: ${failedClientIds.length} subscriber(s) missed messages due to disconnected state or offline server. Confirmed that Redis Pub/Sub is at-most-once with no persistent replay.`,
      });
    }
  }

  // Update stats
  const timeStr = new Date(now).toTimeString().substring(0, 5);
  const nextActivity = [...state.stats.activityHistory];
  const lastActivity = nextActivity[nextActivity.length - 1];

  if (lastActivity && lastActivity.time === timeStr) {
    lastActivity.published += 1;
    lastActivity.delivered += deliveredClientIds.length;
    lastActivity.failed += failedClientIds.length;
  } else {
    nextActivity.push({
      time: timeStr,
      published: 1,
      delivered: deliveredClientIds.length,
      failed: failedClientIds.length,
    });
    if (nextActivity.length > 12) {
      nextActivity.shift();
    }
  }

  const nextStats = {
    ...state.stats,
    publishedCount: state.stats.publishedCount + 1,
    deliveredCount: state.stats.deliveredCount + deliveredClientIds.length,
    failedDeliveriesCount: state.stats.failedDeliveriesCount + failedClientIds.length,
    totalLatenciesSum: state.stats.totalLatenciesSum + simulatedLatencyMs,
    activityHistory: nextActivity,
  };

  const nextState: SimulationState = {
    ...state,
    clients: nextClients,
    servers: nextServers,
    messages: [createdMessage, ...state.messages],
    eventLogs: [...logs, ...state.eventLogs],
    stats: nextStats,
    observations: newObservations,
    activeAnimation: {
      id: msgId,
      step: 'client_to_server',
      message: createdMessage,
      timestamp: now,
    },
  };

  return { nextState, message: createdMessage, logs };
}
