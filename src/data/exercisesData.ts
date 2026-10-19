import type { SimulationState } from '../simulation/types';

export interface ExerciseItem {
  id: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  tagline: string;
  instructions: string;
  predictionQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  hints: string[];
  tasks: {
    id: string;
    label: string;
    isCompleted: (state: SimulationState) => boolean;
  }[];
  expectedOutcome: string;
}

export const EXERCISES: ExerciseItem[] = [
  {
    id: 'ex-1',
    level: 'Beginner',
    title: 'Exercise 1: Client Cluster Distribution',
    tagline: 'Connect at least 3 clients and verify balanced server assignments',
    instructions:
      'In this task, connect at least three clients using the default Round Robin strategy. Inspect the active connection table on Server 1 and Server 2 to ensure the load balancer distributes the persistent TCP sockets across both healthy instances.',
    predictionQuestion: {
      prompt: 'If you connect 3 clients sequentially starting from Server 1 under Round Robin, what will be the distribution?',
      options: [
        'All 3 clients on Server 1, Server 2 has 0',
        'Server 1 will have 2 clients, and Server 2 will have 1 client',
        'Server 1 will have 1 client, and Server 2 will have 2 clients',
        'All 3 clients will be refused connection',
      ],
      correctIndex: 1,
      explanation:
        'Round Robin alternates assignments: Client 1 -> Server 1, Client 2 -> Server 2, Client 3 -> Server 1. Hence Server 1 holds 2 connections and Server 2 holds 1.',
    },
    hints: [
      'Click the "Connect" button on Client A, Client B, and Client C in the Simulation Workspace.',
      'Notice how the Load Balancer cursor advances after each connection.',
      'Check the Server Cluster card: Server 1 should display 2 active connections, and Server 2 should display 1.',
    ],
    tasks: [
      {
        id: 't1-1',
        label: 'Connect at least 3 clients to the cluster',
        isCompleted: (state) => state.clients.filter((c) => c.status === 'connected').length >= 3,
      },
      {
        id: 't1-2',
        label: 'Ensure both Server 1 and Server 2 have at least 1 active connection',
        isCompleted: (state) =>
          (state.servers.find((s) => s.id === 'server-1')?.activeConnectionIds.length || 0) >= 1 &&
          (state.servers.find((s) => s.id === 'server-2')?.activeConnectionIds.length || 0) >= 1,
      },
    ],
    expectedOutcome:
      'Connections are distributed cleanly across the cluster nodes without manual server binding.',
  },
  {
    id: 'ex-2',
    level: 'Intermediate',
    title: 'Exercise 2: Multi-Channel Pub/Sub Isolation',
    tagline: 'Verify that clients only receive broadcasts for subscribed channels',
    instructions:
      'Demonstrate channel isolation. Ensure that Client A and Client B are connected. Verify that Client C or Client D (which are not subscribed to "chat-room" or "notifications" respectively) do not receive broadcasts sent to channels they have not joined.',
    predictionQuestion: {
      prompt: 'If Client D is subscribed only to "notifications" and Client A publishes to "chat-room", what will happen to Client D?',
      options: [
        'Client D will receive the message because all clients receive all WebSocket traffic.',
        'Client D will receive an error dialog on its screen.',
        'Client D will NOT receive the message because Redis and the gateway filter by channel.',
        'Client D will automatically be disconnected from the cluster.',
      ],
      correctIndex: 2,
      explanation:
        'Redis Pub/Sub and the WebSocket gateway enforce channel filtering. Only clients explicitly subscribed to the designated channel receive the framed payload.',
    },
    hints: [
      'Connect Client A and Client D.',
      'Client D by default is subscribed to "notifications" and "system-events", but NOT "chat-room".',
      'Send a message from Client A on the "chat-room" channel.',
      'Verify that Client D received messages counter remains 0.',
    ],
    tasks: [
      {
        id: 't2-1',
        label: 'Connect Client A and Client D simultaneously',
        isCompleted: (state) => {
          const ca = state.clients.find((c) => c.id === 'client-a');
          const cd = state.clients.find((c) => c.id === 'client-d');
          return ca?.status === 'connected' && cd?.status === 'connected';
        },
      },
      {
        id: 't2-2',
        label: 'Publish at least one message on the "chat-room" channel',
        isCompleted: (state) => state.messages.some((m) => m.channel === 'chat-room'),
      },
      {
        id: 't2-3',
        label: 'Confirm Client D received count is 0 for chat-room',
        isCompleted: (state) => {
          const cd = state.clients.find((c) => c.id === 'client-d');
          const chatMsgs = state.messages.filter((m) => m.channel === 'chat-room');
          return chatMsgs.length > 0 && (cd?.receivedMessagesCount || 0) === 0;
        },
      },
    ],
    expectedOutcome:
      'Channel isolation is preserved. Messages published to "chat-room" never bleed into clients subscribed only to other topics.',
  },
  {
    id: 'ex-3',
    level: 'Advanced',
    title: 'Exercise 3: Fault Injection & Failure Analysis',
    tagline: 'Crash a server, verify connection termination, and test failover reconnection',
    instructions:
      'Perform a controlled fault injection experiment. Connect clients across both servers, crash Server 1, observe the failed delivery metrics when a message is published, and then reconnect the dropped client to the surviving healthy server.',
    predictionQuestion: {
      prompt: 'When Server 1 is stopped, what happens to messages published during the outage after Server 1 is brought back online?',
      options: [
        'Redis Pub/Sub replays all missed messages in chronological order.',
        'The messages are lost forever because Redis Pub/Sub has at-most-once delivery semantics.',
        'The browser re-requests the messages using HTTP GET.',
        'The load balancer stores the messages in its RAM buffer.',
      ],
      correctIndex: 1,
      explanation:
        'Standard Redis Pub/Sub does not buffer or persist messages for offline subscribers. Any messages published during downtime are dropped permanently with respect to that server.',
    },
    hints: [
      'Connect Client A (assigned to Server 1) and Client B (assigned to Server 2).',
      'Click "Stop" on Server 1 to simulate a hardware or process crash.',
      'Publish a message from Client B and note the failed delivery metric incrementing.',
      'Click "Reconnect" on Client A to migrate its connection to Server 2.',
    ],
    tasks: [
      {
        id: 't3-1',
        label: 'Simulate server crash: Stop Server 1 while active',
        isCompleted: (state) => state.servers.find((s) => s.id === 'server-1')?.status === 'offline',
      },
      {
        id: 't3-2',
        label: 'Record at least one failed delivery during server outage',
        isCompleted: (state) => state.stats.failedDeliveriesCount > 0,
      },
      {
        id: 't3-3',
        label: 'Reconnect disconnected client to surviving healthy server',
        isCompleted: (state) => {
          const s1 = state.servers.find((s) => s.id === 'server-1');
          const s2 = state.servers.find((s) => s.id === 'server-2');
          const clientA = state.clients.find((c) => c.id === 'client-a');
          return s1?.status === 'offline' && s2?.status === 'healthy' && clientA?.status === 'connected' && clientA?.assignedServerId === 'server-2';
        },
      },
    ],
    expectedOutcome:
      'Fault tolerance mechanisms are confirmed: socket teardown on crash, at-most-once transient loss observed, and successful client failover to the surviving node.',
  },
];
