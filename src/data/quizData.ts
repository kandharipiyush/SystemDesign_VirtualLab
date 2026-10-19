export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'protocol' | 'pubsub' | 'loadbalancer' | 'fault_tolerance';
}

export const QUESTION_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary advantage of WebSockets over traditional HTTP short polling?',
    options: [
      'They permanently store every message in an on-disk relational database.',
      'They enable persistent, bidirectional, full-duplex communication over a single TCP connection.',
      'They eliminate the need for server instances and infrastructure.',
      'They automatically compress images and media files using GPU acceleration.',
    ],
    correctIndex: 1,
    explanation:
      'WebSockets establish a single persistent TCP connection following an initial HTTP upgrade handshake, eliminating repeated header overhead and request latency inherent in HTTP polling.',
    category: 'protocol',
  },
  {
    id: 'q2',
    question: 'In a multi-server WebSocket architecture, what is the primary role of Redis Pub/Sub?',
    options: [
      'Rendering dynamic user interface components on client workstations.',
      'Acting as an authoritative DNS nameserver for WebSocket domains.',
      'Distributing published messages across independent server instances through shared channels.',
      'Storing encrypted client passwords and user authentication sessions.',
    ],
    correctIndex: 2,
    explanation:
      'Because each WebSocket server holds isolated client connections in memory, Redis Pub/Sub acts as an inter-server message backplane that broadcasts messages to all cluster instances.',
    category: 'pubsub',
  },
  {
    id: 'q3',
    question: 'What happens to an established WebSocket connection if its assigned server instance crashes?',
    options: [
      'The TCP connection transparently migrates to another server without dropping.',
      'The TCP socket is abruptly terminated, and the client must detect closure and reconnect.',
      'Redis Pub/Sub converts the connection into an asynchronous email notification.',
      'The client browser freezes indefinitely until the server reboots.',
    ],
    correctIndex: 1,
    explanation:
      'WebSocket connections are stateful point-to-point TCP streams bound to the operating system socket table of the specific host machine. When that host dies, the connection drops immediately.',
    category: 'fault_tolerance',
  },
  {
    id: 'q4',
    question: 'How should a health-aware load balancer handle a server marked as OFFLINE?',
    options: [
      'Route all incoming client handshakes exclusively to the offline server to jumpstart it.',
      'Exclude the offline server from routing decisions and dispatch new connections to healthy nodes.',
      'Delete the client browsers and invalidate their operating system certificates.',
      'Disable Redis Pub/Sub backplane channels across the entire cluster.',
    ],
    correctIndex: 1,
    explanation:
      'Health checks enable the reverse proxy / load balancer to detect unhealthy instances and route new incoming connections exclusively to surviving, healthy instances.',
    category: 'loadbalancer',
  },
  {
    id: 'q5',
    question: 'Does standard Redis Pub/Sub guarantee delivery of messages published while a subscriber server is offline?',
    options: [
      'Yes, Redis persists and buffers all missed messages until the subscriber restarts.',
      'No, standard Redis Pub/Sub is at-most-once; messages published during subscriber downtime are lost.',
      'Only if the Round Robin routing strategy is selected on the load balancer.',
      'Yes, but only for clients running on mobile operating systems.',
    ],
    correctIndex: 1,
    explanation:
      'Standard Redis Pub/Sub offers transient "fire-and-forget" delivery with at-most-once semantics. It does not buffer messages for disconnected subscribers. For persistent delivery, Redis Streams or Kafka is used.',
    category: 'pubsub',
  },
  {
    id: 'q6',
    question: 'Which HTTP status code is returned by the server upon a successful WebSocket Upgrade handshake?',
    options: [
      '200 OK',
      '301 Moved Permanently',
      '101 Switching Protocols',
      '504 Gateway Timeout',
    ],
    correctIndex: 2,
    explanation:
      'RFC 6455 mandates HTTP 101 Switching Protocols, signaling that the server agrees to upgrade the protocol from HTTP/1.1 to the WebSocket framing protocol.',
    category: 'protocol',
  },
  {
    id: 'q7',
    question: 'What is the key advantage of "Least Connections" over "Round Robin" when load balancing WebSockets?',
    options: [
      'It requires zero memory and CPU overhead on the reverse proxy.',
      'It accounts for varying connection durations and assigns new sockets to the least loaded server.',
      'It forces all clients to connect to a single server instance.',
      'It encrypts WebSocket payloads using quantum cryptography.',
    ],
    correctIndex: 1,
    explanation:
      'Because WebSocket connections are persistent and long-lived, Round Robin can lead to severe load imbalance if connections on one server last much longer. Least Connections balances active concurrent socket counts.',
    category: 'loadbalancer',
  },
  {
    id: 'q8',
    question: 'Why should the original sender of a message not receive a duplicate copy back from Redis Pub/Sub?',
    options: [
      'Redis crashes if a sender receives its own message.',
      'To prevent unnecessary UI message duplication and redundant network bandwidth consumption.',
      'WebSockets only permit one-way outgoing data transmission.',
      'HTTP firewalls block messages that have the same source and destination IP.',
    ],
    correctIndex: 1,
    explanation:
      'When Client A publishes a message, it usually renders a local optimistic echo or receives a direct acknowledgment. Re-broadcasting the same message back to Client A from the broker creates redundant echoes and UI duplicates.',
    category: 'pubsub',
  },
  {
    id: 'q9',
    question: 'What technique prevents a "thundering herd" problem when thousands of WebSocket clients reconnect after a cluster outage?',
    options: [
      'Exponential backoff with randomized jitter.',
      'Reconnecting immediately and synchronously within 1 millisecond.',
      'Increasing the HTTP header size on the client handshake.',
      'Disabling all load balancer health check probes.',
    ],
    correctIndex: 0,
    explanation:
      'Exponential backoff with randomized jitter spreads out reconnection attempts across a random time window, preventing massive simultaneous traffic spikes from overwhelming recovering servers.',
    category: 'fault_tolerance',
  },
  {
    id: 'q10',
    question: 'Can changing the load balancer routing strategy dynamically migrate already-connected WebSocket clients?',
    options: [
      'Yes, existing TCP sockets automatically teleport to the other server.',
      'No, established TCP connections remain pinned to their current server until disconnected.',
      'Only if the server port numbers are identical.',
      'Yes, Redis will transparently hot-migrate the process memory.',
    ],
    correctIndex: 1,
    explanation:
      'A WebSocket is a physical TCP socket descriptor bound to an individual server instance. Routing policies only affect *new* incoming handshakes; active connections cannot be moved without being closed and reopened.',
    category: 'loadbalancer',
  },
];

export function getRandomQuizQuestions(count = 5): QuizQuestion[] {
  // Deterministic shuffle helper or seeded random
  const shuffled = [...QUESTION_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
