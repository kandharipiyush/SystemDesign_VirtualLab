export interface ReferenceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publisher: string;
  tags: string[];
}

export const REFERENCES: ReferenceItem[] = [
  {
    id: 'ref-mdn-ws',
    title: 'MDN WebSockets API Specification & Architecture',
    description:
      'Official documentation on the WebSocket API, covering the initial HTTP upgrade handshake, persistent full-duplex TCP framing, socket lifecycle events (onopen, onmessage, onerror, onclose), and binary streaming.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',
    publisher: 'Mozilla Developer Network (MDN)',
    tags: ['Standard RFC 6455', 'Browser API', 'TCP Framing'],
  },
  {
    id: 'ref-redis-pubsub',
    title: 'Redis Pub/Sub Commands and Architecture Documentation',
    description:
      'Official reference guide for Redis in-memory Pub/Sub messaging commands (PUBLISH, SUBSCRIBE, PSUBSCRIBE), memory semantics, fan-out scaling, and transient delivery guarantees.',
    url: 'https://redis.io/docs/latest/develop/pubsub/',
    publisher: 'Redis Ltd.',
    tags: ['In-Memory Backplane', 'Pub/Sub', 'Message Broker'],
  },
  {
    id: 'ref-nginx-ws',
    title: 'NGINX WebSocket Reverse Proxying and Load Balancing Guide',
    description:
      'Architectural blueprint for configuring NGINX as an edge reverse proxy and load balancer for persistent WebSocket streams, including proxy_set_header Upgrade, Connection, and ip_hash / least_conn directives.',
    url: 'https://nginx.org/en/docs/http/websocket.html',
    publisher: 'F5 NGINX Documentation',
    tags: ['Reverse Proxy', 'Load Balancer', 'Round Robin'],
  },
  {
    id: 'ref-fastapi-ws',
    title: 'FastAPI High-Performance WebSockets and Async Connection Managers',
    description:
      'Engineering guide for implementing async WebSocket endpoints with Python/Starlette, managing connection registries, and integrating distributed backplanes.',
    url: 'https://fastapi.tiangolo.com/advanced/websockets/',
    publisher: 'FastAPI / Tiangolo',
    tags: ['Connection Manager', 'Backend Gateway', 'Python AsyncIO'],
  },
  {
    id: 'ref-vlabs',
    title: 'National Virtual Labs Portal',
    description:
      'The National Mission on Education through ICT (NMEICT) Virtual Labs initiative portal, providing open remote access to computer science and distributed computing laboratory simulations.',
    url: 'https://vlabs.ac.in/',
    publisher: 'Ministry of Education, Govt. of India',
    tags: ['Pedagogy', 'National Education Mission', 'Virtual Laboratory'],
  },
];
