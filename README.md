# Virtual Laboratory for Distributed Systems
## Experiment 14: Real-Time Pub/Sub WebSocket Gateway

> **Pedagogical Format:** Educational Virtual Laboratory Format  
> **Course:** Distributed Systems & Network Computing (Computer Science & Engineering)  
> **Architecture Model:** Stateful Connection Gateways with In-Memory Redis Pub/Sub Backplane  
> **Execution Model:** 100% Frontend-Only Deterministic Simulation (Zero backend, Redis, or cloud setup required)

---

## 1. Overview & Aim

In modern distributed web applications (collaborative editors, financial tickers, live notifications, online gaming), traditional HTTP polling imposes severe overhead due to repeated TCP handshakes and heavy headers (500–1000 bytes per request).

**WebSocket technology (RFC 6455)** establishes a persistent, full-duplex TCP stream over standard ports following an HTTP `101 Switching Protocols` upgrade handshake. However, scaling stateful WebSocket connections horizontally across independent gateway nodes introduces the **"Stateful Island"** problem:

> *If Client A is connected to Server 1 and Client B is connected to Server 2, how does a message sent by Client A reach Client B?*

This Virtual Laboratory simulates and evaluates the standard production solution: an **in-memory Redis Pub/Sub backplane** that synchronizes messages across independent server instances, combined with health-aware load balancing and client fault tolerance.

### Aim:
To understand, simulate, and evaluate a scalable, fault-tolerant Real-Time Pub/Sub WebSocket Gateway that maintains persistent client connections across multiple WebSocket servers and distributes messages between server instances through a Redis Pub/Sub backplane.

---

## 2. Key Features

- **Central Deterministic Simulation Engine:**
  - Written in modular, strictly typed TypeScript (`src/simulation/`).
  - Single source of truth driving the interactive architecture diagram, live server cluster, client endpoints, telemetry charts, and event stream.
- **Client Endpoint Manager:**
  - Support for up to 10 simulated client endpoints (Web, Mobile, Desktop).
  - Individual and bulk connect/disconnect/reconnect controls.
  - Multi-channel subscription management (`#chat-room`, `#notifications`, `#system-events`).
- **Network Load Balancer Simulation:**
  - **Round Robin:** Cyclic, sequential distribution of incoming connections across healthy nodes.
  - **Least Connections:** Adaptive dispatch to the node with the fewest active TCP sockets.
  - Dynamic exclusion of offline nodes; existing connections are never silently migrated.
- **WebSocket Gateway Cluster:**
  - Server 1 (`:8001`), Server 2 (`:8002`), and optional scalable Server 3 (`:8003`).
  - Active connection registries, Redis broker ingress counters, and local client push metrics.
  - Node crash injection (`Crash Node`), graceful restart, and recovery (`Boot / Recover`).
- **Redis Pub/Sub Message Broker:**
  - 5-step lifecycle: Client Send → Frame Validation → Redis `PUBLISH` → Broker Fan-out → Server Client Push.
  - Models at-most-once transient delivery: offline nodes miss messages and are never replayed upon reboot.
  - Duplicate message prevention and local acknowledgment framing.
- **Real-Time Telemetry & Charts:**
  - Live KPIs: Connected Clients, Healthy Servers, Published Messages, Delivered Frames, Failed Drops, Simulated Latency.
  - Connection distribution per node and message volume over time.
- **Live Event Stream Log:**
  - Chronological scrollable log with severity badges, search filter, event type filter, server filter, channel filter, pause/resume, and export to **CSV** and **JSON**.
- **Interactive System Architecture Diagram:**
  - Visual topology of Client Tier → Load Balancer → Gateway Cluster → Redis Backplane.
  - Clickable tiers with an interactive Inspector Modal.
  - Animated packet pulses illustrating live message paths.
- **4 Guided Academic Experiments:**
  1. *Basic WebSocket Communication*
  2. *Cross-Server Pub/Sub Broadcasting*
  3. *Load Balancing (Round Robin vs. Least Connections)*
  4. *Server Failure, Fault Tolerance & Recovery*
- **Assessments & Exercises:**
  - Pre-Test & Post-Test quizzes with randomized questions from a question bank, immediate feedback, scoring, and explanations.
  - Progressive Exercises (Beginner, Intermediate, Advanced) featuring a *"Predict Before Execution"* challenge mode and dynamic live-state validation.
- **Printable Laboratory Report:**
  - Print-friendly lab report generated directly from simulation data, exportable to JSON or saved as PDF via browser print.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Bundler** | Vite 8 |
| **Styling** | Tailwind CSS (Academic Navy & Blue Palette) |
| **Icons** | Lucide React |
| **Unit Testing** | Vitest |
| **Persistence** | Browser `localStorage` for progress & assessment scores |

> **Strict Backend Transparency:** No backend (FastAPI, Python, Node.js API), Docker container, real Redis instance, or cloud service is needed. Everything runs deterministically inside the browser.

---

## 4. Installation & Local Development

### Prerequisites
- Node.js (v18+ recommended; tested on v24.13.1)
- npm (v9+ recommended; tested on v11.8.0)

### 1. Clone & Install
\`\`\`bash
cd SD_virtualLab
npm install
\`\`\`

### 2. Launch Local Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 3. Run Automated Unit Tests
\`\`\`bash
npm test
\`\`\`
Runs the Vitest suite covering Round Robin, Least Connections, Pub/Sub channel isolation, server crashes, reconnection, and transient message semantics.

### 4. Build for Production
\`\`\`bash
npm run build
\`\`\`
Creates an optimized static bundle in the `dist/` directory ready for deployment to GitHub Pages, Vercel, or Netlify.

---

## 5. Lab Navigation & Sections

The application includes 13 persistent sections structured for distributed systems engineering:

1. **01 · Overview:** Syllabus context, learning outcomes, estimated duration, and quick start.
2. **02 · Aim:** Scientific objective and key investigation goals.
3. **03 · Introduction:** HTTP polling overhead vs. persistent WebSockets and horizontal scaling.
4. **04 · Theory:** 6 detailed modules covering RFC 6455, the 101 Upgrade Handshake, Redis Pub/Sub, and load balancing.
5. **05 · Architecture:** Interactive topology diagram with component inspector and animated message tracing.
6. **06 · Pre-Test:** Multiple-choice quiz to establish baseline knowledge before conducting experiments.
7. **07 · Virtual Simulation:** The interactive workstation for managing clients, servers, and message routing.
8. **08 · Procedure:** 4 step-by-step guided experiments with automated scenario triggers and verification checklists.
9. **09 · Observations & Results:** Quantitative telemetry, connection matrices, and automated empirical observations.
10. **10 · Exercises:** Progressive challenges with prediction questions and live-state verification.
11. **11 · Post-Test:** Comprehensive post-lab assessment with scoring and explanations.
12. **12 · Conclusion:** Inferences, architectural trade-offs, and simulation modeling notice.
13. **13 · References:** Working links to official MDN, Redis, NGINX, FastAPI, and national Virtual Labs documentation.

---

## 6. Official Academic References

- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Redis Pub/Sub Documentation](https://redis.io/docs/latest/develop/pubsub/)
- [NGINX WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [National Virtual Labs Portal](https://vlabs.ac.in/)

---

## 7. License & Attribution

Developed as an educational virtual laboratory for Distributed Systems courses. Designed for academic computer engineering curriculum.
