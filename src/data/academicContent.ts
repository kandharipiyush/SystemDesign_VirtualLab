export interface TheorySection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  keyTakeaways: string[];
}

export const LAB_METADATA = {
  institution: 'Virtual Laboratory for Distributed Systems',
  discipline: 'Computer Science & Engineering',
  course: 'Distributed Systems & Network Computing',
  experimentNumber: '14',
  title: 'Real-Time Pub/Sub WebSocket Gateway',
  subtitle: 'Scalable Stateful Connection Handling & Redis Message Bus Backplane Simulation',
  estimatedDuration: '35 - 45 Minutes',
  prerequisites: [
    'Basic client-server architecture & HTTP/1.1 request-response lifecycle',
    'Understanding of TCP sockets and persistent transport layers',
    'Fundamentals of network load balancing and round-robin scheduling',
    'Conceptual understanding of Publisher/Subscriber (Pub/Sub) messaging models',
  ],
  learningObjectives: [
    'Contrast the high bandwidth and latency overhead of HTTP polling with persistent, bidirectional WebSockets.',
    'Trace the HTTP Upgrade Handshake (101 Switching Protocols) from client through a reverse proxy/load balancer to a gateway server.',
    'Analyze how a multi-server WebSocket cluster handles stateful connections across independent nodes.',
    'Evaluate the role of an in-memory Redis Pub/Sub backplane in synchronizing messages between decoupled server instances.',
    'Compare Round Robin and Least Connections load-balancing algorithms under fluctuating traffic conditions.',
    'Simulate node failure, observe abrupt socket teardown, evaluate client-side exponential backoff reconnection, and understand the transient (at-most-once) nature of Redis Pub/Sub.',
  ],
  aim: 'To understand, simulate, and evaluate an horizontally scalable, fault-tolerant Real-Time Pub/Sub WebSocket Gateway that maintains persistent client connections across multiple WebSocket servers and distributes messages between server instances through a Redis Pub/Sub backplane without message loss or unnecessary broadcast loops.',
  introduction: `In contemporary web applications—such as collaborative document editors, financial tickers, real-time gaming, and instant messaging—traditional HTTP request-response patterns introduce severe inefficiencies. Under HTTP polling or long-polling, clients repeatedly establish short-lived TCP connections, exchange heavy headers, and introduce noticeable network latency.

WebSocket technology (RFC 6455) solves this by initiating an HTTP handshake that upgrades to a single, persistent, full-duplex TCP stream over standard web ports (80/443). However, horizontal scaling introduces a fundamental distributed systems dilemma:

If Client A connects to WebSocket Server 1 and Client B connects to WebSocket Server 2, how does a message sent by Client A reach Client B?

Because WebSocket connections are stateful and pinned to individual server memory heaps, servers cannot directly access each other's connection registries. To resolve this, modern production infrastructures employ a lightweight, high-throughput message broker such as Redis Pub/Sub as a backplane. When Server 1 receives a message, it publishes it to a Redis channel; Redis broadcasts the message to all subscribed server instances, which subsequently push the payload to their respective local clients.

This virtual laboratory provides a fully interactive, deterministic simulation of this distributed gateway architecture, enabling students to explore load balancing, cross-server broadcasting, and failure recovery under laboratory conditions.`,
};

export const THEORY_SECTIONS: TheorySection[] = [
  {
    id: 'polling-vs-websocket',
    title: '1. HTTP Polling vs. WebSocket Communication',
    subtitle: 'From Half-Duplex Request-Response to Persistent Full-Duplex Framing',
    content: `Traditional HTTP/1.1 is strictly half-duplex and client-initiated: the client requests a resource, and the server answers. To simulate real-time updates, developers historically employed:

1. **Short Polling**: The client issues an HTTP GET every *N* seconds (e.g., every 2s). Most requests return an empty 304 or 200 with no new data, generating excessive CPU cycles and header overhead (often 500–1000 bytes per request).
2. **Long Polling (Comet)**: The server holds the request open until new data arrives or a timeout occurs. Once responded, the connection terminates and the client immediately opens another. While reducing latency, connection churn and memory overhead remain substantial.
3. **WebSockets (RFC 6455)**: Establishes a long-lived, bidirectional TCP connection. Following a single HTTP upgrade handshake, communication shifts to lightweight binary or UTF-8 text frames with a header overhead of only 2 to 10 bytes. Both client and server can transmit spontaneously with sub-millisecond protocol overhead.`,
    keyTakeaways: [
      'HTTP Short Polling introduces massive header bloat and server CPU strain.',
      'HTTP Long Polling reduces latency but suffers from high TCP connection churn.',
      'WebSockets maintain a single persistent TCP connection with minimal 2-10 byte framing overhead.',
    ],
  },
  {
    id: 'handshake-protocol',
    title: '2. The WebSocket Upgrade Handshake',
    subtitle: 'Transitioning from HTTP/1.1 to the WebSocket Protocol',
    content: `A WebSocket connection begins as standard HTTP over port 80 or 443 to seamlessly traverse firewalls, proxies, and NAT routers:

1. **Client Request**:
   The client transmits an HTTP GET with specialized headers:
   \`\`\`http
   GET /ws HTTP/1.1
   Host: gateway.vlab.edu
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13
   \`\`\`

2. **Server Response**:
   If the server (or load balancer) supports WebSockets, it replies with HTTP status code \`101 Switching Protocols\`:
   \`\`\`http
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
   \`\`\`
   The \`Sec-WebSocket-Accept\` header proves that the server understood the protocol by concatenating the key with a standard GUID, hashing with SHA-1, and base64-encoding the digest.

3. **Framing Phase**:
   The underlying TCP socket remains open and switches directly to framing mode without further HTTP headers.`,
    keyTakeaways: [
      'Handshake uses standard HTTP GET with Upgrade: websocket and Connection: Upgrade.',
      'Server answers with HTTP 101 Switching Protocols and a SHA-1 hashed Sec-WebSocket-Accept digest.',
      'Subsequent packets bypass HTTP entirely and use lightweight binary/text framing.',
    ],
  },
  {
    id: 'pubsub-pattern',
    title: '3. The Publish/Subscribe (Pub/Sub) Pattern',
    subtitle: 'Decoupling Message Producers from Consumers in Distributed Systems',
    content: `In distributed architectures, direct point-to-point communication between servers creates tight coupling and O(N²) connection complexity. The Publish/Subscribe pattern eliminates this:

- **Publishers**: Components that emit messages without knowing who or how many consumers exist.
- **Channels / Topics**: Named logical message conduits (e.g., \`chat-room\`, \`notifications\`).
- **Subscribers**: Components that register interest in one or more channels to receive messages asynchronously.

This decouples producers and consumers along three dimensions:
- **Spatial Decoupling**: Publishers and subscribers do not need to know each other's IP addresses or identities.
- **Temporal Decoupling**: Messages can be dispatched without coordinating real-time execution states (within broker limits).
- **Synchronization Decoupling**: Operations on both sides are non-blocking.`,
    keyTakeaways: [
      'Eliminates direct point-to-point server coupling and N-to-N mesh topology.',
      'Producers publish to named channels; consumers subscribe to channels of interest.',
      'Enables horizontal scaling of cluster nodes without reconfiguring endpoints.',
    ],
  },
  {
    id: 'redis-backplane',
    title: '4. Redis Pub/Sub as an Inter-Cluster Backplane',
    subtitle: 'Overcoming the Stateful WebSocket Island Dilemma',
    content: `When scaling out WebSocket gateways behind a load balancer, each server maintains its own memory pool of open socket descriptors.

**The Distributed Dilemma**:
Client A is connected to Server 1. Client B is connected to Server 2. Client A submits a message intended for all room members. Server 1 has no knowledge of Client B.

**The Solution**:
All WebSocket server instances subscribe to shared channels on an in-memory Redis message bus.
1. Client A sends message over its WebSocket connection to Server 1.
2. Server 1 validates the frame and issues a Redis \`PUBLISH chat-room "payload"\` command.
3. Redis replicates and pushes the message to all connected subscribers (Server 1 and Server 2).
4. Server 2 receives the Redis event and traverses its local client registry, forwarding the frame to Client B.
5. Server 1 handles local sender acknowledgment without creating an echo loop.`,
    keyTakeaways: [
      'Redis acts as an ultra-fast, in-memory cross-server message bus (backplane).',
      'Each server maintains a local connection map and subscribes to Redis channels on behalf of its clients.',
      'Enables seamless any-to-any client communication regardless of which server holds the TCP socket.',
    ],
  },
  {
    id: 'load-balancing',
    title: '5. Network Load Balancing for Stateful Connections',
    subtitle: 'Round Robin vs. Least Connections under Persistent Sessions',
    content: `A reverse proxy / load balancer (such as NGINX or HAProxy) routes incoming client traffic to the gateway cluster. However, load balancing persistent WebSockets differs fundamentally from stateless HTTP requests:

- **Stateless HTTP**: Every request can be sent to any server; connections close quickly.
- **Stateful WebSockets**: The connection is maintained for minutes, hours, or days. Once assigned, the client remains pinned to that server until disconnection.

**Routing Algorithms Evaluated in Lab**:
1. **Round Robin**:
   - New connections are assigned cyclically: Server 1 → Server 2 → Server 3 → Server 1.
   - Simple and deterministic, but does not account for long-lived session duration or varying client workloads.
2. **Least Connections**:
   - New connections are dispatched to the healthy server with the lowest count of active client connections.
   - Ideal for WebSockets because it actively balances persistent connection counts and prevents server starvation.

*Crucial Rule*: Changing routing strategy or server configuration must never disconnect or silently migrate existing TCP sockets.`,
    keyTakeaways: [
      'WebSocket connections are persistent and pinned; they cannot be reassigned without tearing down the socket.',
      'Round Robin distributes new handshakes sequentially regardless of session duration.',
      'Least Connections balances actual concurrent client counts across healthy nodes.',
    ],
  },
  {
    id: 'fault-tolerance',
    title: '6. Server Failure, Health Probes & Client Reconnection',
    subtitle: 'Handling Node Crashes and Transient Messaging Constraints',
    content: `Distributed systems must anticipate hardware failure, network partitions, and process crashes.

**Failure Detection & Health Probes**:
The load balancer continuously issues heartbeat probes (e.g., HTTP GET /healthz) to each gateway node. When a server fails:
1. The health probe fails or times out.
2. The load balancer immediately marks the node as \`OFFLINE\` and redirects incoming handshakes to surviving healthy instances.
3. Existing TCP sockets on the dead server drop abruptly.

**Client-Side Resilience**:
Browsers detect socket closure via the \`onclose\` event. Well-engineered clients execute:
- **Exponential Backoff with Jitter**: Avoids "thundering herd" problems where thousands of dropped clients bombard surviving servers simultaneously.
- **Clean Handshake Re-routing**: The new connection request hits the load balancer and is routed to a healthy peer.

**Redis Pub/Sub Limitations (Transient vs. Durable)**:
Crucially, standard Redis Pub/Sub operates under an **at-most-once** delivery guarantee. Redis does **not** buffer messages for offline subscribers or replay missed history upon reboot. If Server 1 is offline when a message is published, neither Server 1 nor its future reconnecting clients receive that message. For durable delivery, systems use Redis Streams or Apache Kafka.`,
    keyTakeaways: [
      'Server failure instantly terminates its local WebSocket sockets; connections do not migrate magically.',
      'Load balancers detect outages via heartbeat probes and isolate unhealthy nodes.',
      'Clients must implement automatic reconnection with exponential backoff.',
      'Standard Redis Pub/Sub is transient (at-most-once) and does not store messages for offline nodes.',
    ],
  },
];
