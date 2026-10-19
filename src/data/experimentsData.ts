export interface GuidedExperiment {
  id: string;
  number: number;
  title: string;
  tagline: string;
  aim: string;
  theorySummary: string;
  prerequisites: string[];
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    actionLabel?: string;
    actionType?: string;
  }[];
  expectedOutcome: string;
  verificationFnName: string;
}

export const EXPERIMENTS: GuidedExperiment[] = [
  {
    id: 'exp-1',
    number: 1,
    title: 'Basic WebSocket Communication',
    tagline: 'Understand persistent client-server bidirectional communication',
    aim: 'To observe and verify the establishment of a persistent, bidirectional WebSocket connection between simulated clients and a gateway server, verifying message transmission without HTTP page refresh.',
    theorySummary: 'Unlike HTTP request-response, a WebSocket establishes an upgraded persistent TCP channel allowing sub-millisecond, full-duplex message framing without connection renegotiation.',
    prerequisites: ['Basic understanding of TCP handshakes and client-server state.'],
    steps: [
      {
        stepNumber: 1,
        title: 'Connect Client A',
        description: 'Navigate to the Simulation Workspace or use the action below to connect Client A to the cluster.',
        actionLabel: 'Connect Client A',
        actionType: 'CONNECT_CLIENT_A',
      },
      {
        stepNumber: 2,
        title: 'Connect Client B',
        description: 'Establish a second concurrent client session for Client B.',
        actionLabel: 'Connect Client B',
        actionType: 'CONNECT_CLIENT_B',
      },
      {
        stepNumber: 3,
        title: 'Inspect Connection State',
        description: 'Verify both clients are marked "Connected" with an assigned server and active port.',
      },
      {
        stepNumber: 4,
        title: 'Send a Message from Client A',
        description: 'Select Client A as sender, pick the "chat-room" channel, and transmit a message.',
        actionLabel: 'Send Sample Message',
        actionType: 'SEND_MESSAGE_A',
      },
      {
        stepNumber: 5,
        title: 'Verify In Event Stream',
        description: 'Observe the live event stream for Frame Validated, PUBLISH Executed, and Client Delivery entries.',
      },
    ],
    expectedOutcome: 'Client A and Client B establish persistent sessions. A single message payload is framed, validated, and delivered seamlessly without tearing down connections.',
    verificationFnName: 'verifyExp1',
  },
  {
    id: 'exp-2',
    number: 2,
    title: 'Cross-Server Pub/Sub Broadcasting',
    tagline: 'Demonstrate message distribution between separate server instances via Redis',
    aim: 'To trace how a message transmitted to WebSocket Server 1 is broadcast across an in-memory Redis Pub/Sub backplane and delivered to a client pinned to WebSocket Server 2.',
    theorySummary: 'Because WebSocket servers maintain isolated in-memory client connection tables, a decoupled Redis Pub/Sub backplane is required so servers can fan out messages across the entire cluster.',
    prerequisites: ['Publish/Subscribe messaging concepts and topic subscriptions.'],
    steps: [
      {
        stepNumber: 1,
        title: 'Ensure Cross-Server Allocation',
        description: 'Connect Client A to Server 1, and Client B to Server 2 under Round Robin routing.',
        actionLabel: 'Auto-Configure Cross-Server Clients',
        actionType: 'SETUP_CROSS_SERVER',
      },
      {
        stepNumber: 2,
        title: 'Verify Channel Subscriptions',
        description: 'Confirm that both Server 1 and Server 2 are subscribed to the "chat-room" channel.',
      },
      {
        stepNumber: 3,
        title: 'Publish from Client A on Server 1',
        description: 'Emit a message from Client A targeted at the "chat-room" channel.',
        actionLabel: 'Publish Cross-Server Message',
        actionType: 'PUBLISH_CROSS_SERVER_MSG',
      },
      {
        stepNumber: 4,
        title: 'Trace Redis Backplane Fan-out',
        description: 'Observe the animated packet path: Client A -> Server 1 -> Redis Backplane -> Server 2 -> Client B.',
      },
    ],
    expectedOutcome: 'Client B receives the message via Server 2, despite Client A connecting solely to Server 1. The event stream confirms publication on the Redis backplane and delivery to the peer server.',
    verificationFnName: 'verifyExp2',
  },
  {
    id: 'exp-3',
    number: 3,
    title: 'Load Balancing: Round Robin vs Least Connections',
    tagline: 'Observe connection distribution under different routing policies',
    aim: 'To evaluate how Round Robin and Least Connections routing strategies allocate incoming persistent WebSocket handshakes and handle server load disparities.',
    theorySummary: 'Round Robin allocates connections sequentially regardless of active connection duration, whereas Least Connections dynamically evaluates concurrent active socket counts to prevent overloading.',
    prerequisites: ['Load balancing theory and reverse proxy scheduling algorithms.'],
    steps: [
      {
        stepNumber: 1,
        title: 'Reset & Set Round Robin',
        description: 'Select Round Robin routing strategy and verify clean cluster state.',
        actionLabel: 'Set Round Robin & Reset',
        actionType: 'SETUP_ROUND_ROBIN',
      },
      {
        stepNumber: 2,
        title: 'Connect 4 Clients Sequentially',
        description: 'Connect Client A, B, C, and D. Observe alternating 2-2 server distribution (Server 1: 2, Server 2: 2).',
        actionLabel: 'Connect All 4 Clients',
        actionType: 'CONNECT_ALL_4',
      },
      {
        stepNumber: 3,
        title: 'Disconnect Client A (Creating Load Asymmetry)',
        description: 'Disconnect Client A from Server 1 so Server 1 has 1 connection while Server 2 has 2 connections.',
        actionLabel: 'Disconnect Client A',
        actionType: 'DISCONNECT_CLIENT_A',
      },
      {
        stepNumber: 4,
        title: 'Switch to Least Connections',
        description: 'Switch routing policy to Least Connections. Note that existing connections do NOT move.',
        actionLabel: 'Switch to Least Connections',
        actionType: 'SET_LEAST_CONN',
      },
      {
        stepNumber: 5,
        title: 'Connect New Client',
        description: 'Reconnect Client A. Observe that Least Connections intelligently routes it to Server 1 (which had fewer connections).',
        actionLabel: 'Reconnect Client A to Least Loaded Server',
        actionType: 'RECONNECT_CLIENT_A',
      },
    ],
    expectedOutcome: 'Least Connections routes new connections to the server with fewest active sockets, demonstrating dynamic balance preservation without interrupting existing connections.',
    verificationFnName: 'verifyExp3',
  },
  {
    id: 'exp-4',
    number: 4,
    title: 'Server Failure, Fault Tolerance & Recovery',
    tagline: 'Understand the impact of server crash on stateful sockets and transient messaging',
    aim: 'To simulate a sudden node crash, observe abrupt client disconnections, evaluate transient message loss during downtime, and test health-aware client reconnection.',
    theorySummary: 'Stateful WebSocket connections are severed when their host crashes. Furthermore, standard Redis Pub/Sub does not buffer or replay messages published while a node is offline.',
    prerequisites: ['High availability concepts, heartbeat monitoring, and at-most-once delivery semantics.'],
    steps: [
      {
        stepNumber: 1,
        title: 'Establish Distributed Cluster Connections',
        description: 'Connect multiple clients across both Server 1 and Server 2.',
        actionLabel: 'Prepare Active Cluster',
        actionType: 'PREPARE_CLUSTER',
      },
      {
        stepNumber: 2,
        title: 'Simulate Crash of Server 1',
        description: 'Stop Server 1. Observe that clients connected to Server 1 are immediately marked Disconnected.',
        actionLabel: 'Crash Server 1',
        actionType: 'CRASH_SERVER_1',
      },
      {
        stepNumber: 3,
        title: 'Publish Message During Outage',
        description: 'Send a message from an online client. Observe that offline Server 1 and disconnected clients do NOT receive it.',
        actionLabel: 'Publish During Outage',
        actionType: 'PUBLISH_OUTAGE_MSG',
      },
      {
        stepNumber: 4,
        title: 'Reconnect Affected Clients',
        description: 'Trigger reconnection for disconnected clients. Observe that the load balancer routes them exclusively to healthy Server 2.',
        actionLabel: 'Reconnect Clients to Healthy Node',
        actionType: 'RECONNECT_AFFECTED',
      },
      {
        stepNumber: 5,
        title: 'Reboot Server 1',
        description: 'Restart Server 1 and observe that missed messages are NOT replayed (transient Redis Pub/Sub behavior).',
        actionLabel: 'Recover Server 1',
        actionType: 'REBOOT_SERVER_1',
      },
    ],
    expectedOutcome: 'Clients on crashed nodes lose connection; new connections bypass offline nodes; messages published during downtime are never replayed; reconnection seamlessly restores connectivity to surviving nodes.',
    verificationFnName: 'verifyExp4',
  },
];
