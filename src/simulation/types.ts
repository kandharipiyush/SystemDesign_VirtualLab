export type ClientStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export type ServerStatus = 'healthy' | 'offline' | 'recovering';

export type RoutingStrategy = 'round-robin' | 'least-connections';

export type EventSeverity = 'info' | 'success' | 'warning' | 'error';

export type EventType =
  | 'client_connect'
  | 'client_disconnect'
  | 'client_reconnected'
  | 'routing_assignment'
  | 'msg_validated'
  | 'msg_published'
  | 'broker_distributed'
  | 'msg_delivered'
  | 'delivery_failed'
  | 'server_down'
  | 'server_recovery'
  | 'health_check'
  | 'channel_subscription'
  | 'sim_reset';

export interface Client {
  id: string;
  name: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  status: ClientStatus;
  assignedServerId: string | null;
  subscribedChannels: string[];
  sentMessagesCount: number;
  receivedMessagesCount: number;
  lastMessageReceived?: string;
  reconnectAttempts?: number;
}

export interface ServerInstance {
  id: string;
  name: string;
  port: number;
  status: ServerStatus;
  activeConnectionIds: string[];
  subscribedChannels: string[];
  messagesReceivedFromBroker: number;
  messagesDeliveredToClients: number;
  lastHeartbeat: number;
}

export interface SimMessage {
  id: string;
  senderId: string;
  senderName: string;
  channel: string;
  content: string;
  timestamp: number;
  originServerId: string;
  deliveredClientIds: string[];
  failedClientIds: string[];
  simulatedLatencyMs: number;
}

export interface EventLogItem {
  id: string;
  timestamp: number;
  type: EventType;
  severity: EventSeverity;
  title: string;
  details: string;
  serverId?: string;
  clientId?: string;
  channel?: string;
}

export interface SimulationStats {
  publishedCount: number;
  deliveredCount: number;
  failedDeliveriesCount: number;
  routingAssignments: Record<string, number>; // serverId -> count
  totalLatenciesSum: number;
  activityHistory: {
    time: string;
    published: number;
    delivered: number;
    failed: number;
  }[];
}

export interface ExperimentObservation {
  id: string;
  timestamp: number;
  text: string;
  category: 'connection' | 'messaging' | 'routing' | 'fault';
}

export interface SimulationState {
  clients: Client[];
  servers: ServerInstance[];
  channels: string[];
  routingStrategy: RoutingStrategy;
  roundRobinCursor: number;
  messages: SimMessage[];
  eventLogs: EventLogItem[];
  isPaused: boolean;
  animationSpeed: number; // 1 = 1x, 0.5 = slow, 2 = fast
  activeAnimation: {
    id: string;
    step: 'client_to_server' | 'server_to_broker' | 'broker_to_servers' | 'servers_to_clients' | 'complete';
    message: SimMessage;
    timestamp: number;
  } | null;
  stats: SimulationStats;
  observations: ExperimentObservation[];
}

export type SimulationAction =
  | { type: 'ADD_CLIENT'; payload: { name: string; deviceType?: 'web' | 'mobile' | 'desktop' } }
  | { type: 'REMOVE_CLIENT'; payload: { clientId: string } }
  | { type: 'EDIT_CLIENT_NAME'; payload: { clientId: string; name: string } }
  | { type: 'CONNECT_CLIENT'; payload: { clientId: string } }
  | { type: 'DISCONNECT_CLIENT'; payload: { clientId: string } }
  | { type: 'RECONNECT_CLIENT'; payload: { clientId: string } }
  | { type: 'CONNECT_ALL_CLIENTS' }
  | { type: 'DISCONNECT_ALL_CLIENTS' }
  | { type: 'SET_ROUTING_STRATEGY'; payload: { strategy: RoutingStrategy } }
  | { type: 'STOP_SERVER'; payload: { serverId: string } }
  | { type: 'START_SERVER'; payload: { serverId: string } }
  | { type: 'RESTART_SERVER'; payload: { serverId: string } }
  | { type: 'ADD_SERVER'; payload: { id: string; name: string; port: number } }
  | { type: 'REMOVE_SERVER'; payload: { serverId: string } }
  | { type: 'TRIGGER_HEALTH_CHECK' }
  | { type: 'PUBLISH_MESSAGE'; payload: { senderId: string; channel: string; content: string } }
  | { type: 'CLIENT_SUBSCRIBE_CHANNEL'; payload: { clientId: string; channel: string } }
  | { type: 'CLIENT_UNSUBSCRIBE_CHANNEL'; payload: { clientId: string; channel: string } }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_ANIMATION_STEP'; payload: { activeAnimation: SimulationState['activeAnimation'] } }
  | { type: 'SET_PAUSED'; payload: { isPaused: boolean } }
  | { type: 'SET_ANIMATION_SPEED'; payload: { speed: number } }
  | { type: 'RESET_SIMULATION' };
