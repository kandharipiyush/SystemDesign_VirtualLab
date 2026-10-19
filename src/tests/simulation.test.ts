import { describe, it, expect } from 'vitest';
import { createInitialState } from '../simulation/initialState';
import { simulationReducer } from '../simulation/reducer';
import { selectServer } from '../simulation/loadBalancer';

describe('Simulation Engine Unit Tests', () => {
  it('selects servers using Round Robin sequentially across healthy nodes', () => {
    const state = createInitialState();
    // Default has server-1 and server-2
    const d1 = selectServer(state.servers, 'round-robin', 0);
    expect(d1.selectedServer?.id).toBe('server-1');
    expect(d1.nextCursor).toBe(1);

    const d2 = selectServer(state.servers, 'round-robin', d1.nextCursor);
    expect(d2.selectedServer?.id).toBe('server-2');
    expect(d2.nextCursor).toBe(0);

    const d3 = selectServer(state.servers, 'round-robin', d2.nextCursor);
    expect(d3.selectedServer?.id).toBe('server-1');
  });

  it('selects server using Least Connections and tie-breaks deterministically', () => {
    let state = createInitialState();
    // Connect client-a -> Server 1 (under RR, index 0)
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    expect(state.servers.find((s) => s.id === 'server-1')?.activeConnectionIds.length).toBe(1);
    expect(state.servers.find((s) => s.id === 'server-2')?.activeConnectionIds.length).toBe(0);

    // Now switch to Least Connections
    state = simulationReducer(state, {
      type: 'SET_ROUTING_STRATEGY',
      payload: { strategy: 'least-connections' },
    });

    // Connecting client-b should now deterministically select Server 2 because Server 2 has 0 connections
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-b' },
    });
    const clientB = state.clients.find((c) => c.id === 'client-b');
    expect(clientB?.assignedServerId).toBe('server-2');
    expect(state.servers.find((s) => s.id === 'server-2')?.activeConnectionIds.length).toBe(1);
  });

  it('skips offline servers during connection routing', () => {
    let state = createInitialState();
    // Stop server 1
    state = simulationReducer(state, {
      type: 'STOP_SERVER',
      payload: { serverId: 'server-1' },
    });
    expect(state.servers.find((s) => s.id === 'server-1')?.status).toBe('offline');

    // Attempting to connect Client A should route to Server 2
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    const clientA = state.clients.find((c) => c.id === 'client-a');
    expect(clientA?.status).toBe('connected');
    expect(clientA?.assignedServerId).toBe('server-2');
  });

  it('disconnects clients when their assigned server fails', () => {
    let state = createInitialState();
    // Connect Client A (to server-1)
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    expect(state.clients.find((c) => c.id === 'client-a')?.assignedServerId).toBe('server-1');

    // Crash server-1
    state = simulationReducer(state, {
      type: 'STOP_SERVER',
      payload: { serverId: 'server-1' },
    });

    const clientA = state.clients.find((c) => c.id === 'client-a');
    expect(clientA?.status).toBe('disconnected');
    expect(clientA?.assignedServerId).toBeNull();
    expect(state.servers.find((s) => s.id === 'server-1')?.activeConnectionIds).toEqual([]);
  });

  it('reconnects affected clients to a healthy server', () => {
    let state = createInitialState();
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    state = simulationReducer(state, {
      type: 'STOP_SERVER',
      payload: { serverId: 'server-1' },
    });

    // Reconnect client-a
    state = simulationReducer(state, {
      type: 'RECONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });

    const clientA = state.clients.find((c) => c.id === 'client-a');
    expect(clientA?.status).toBe('connected');
    expect(clientA?.assignedServerId).toBe('server-2');
  });

  it('delivers cross-server messages through simulated Redis Pub/Sub', () => {
    let state = createInitialState();
    // Connect Client A -> server-1
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    // Connect Client B -> server-2
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-b' },
    });

    expect(state.clients.find((c) => c.id === 'client-a')?.assignedServerId).toBe('server-1');
    expect(state.clients.find((c) => c.id === 'client-b')?.assignedServerId).toBe('server-2');

    // Publish message from Client A on chat-room
    state = simulationReducer(state, {
      type: 'PUBLISH_MESSAGE',
      payload: {
        senderId: 'client-a',
        channel: 'chat-room',
        content: 'Hello cross-server world!',
      },
    });

    const clientA = state.clients.find((c) => c.id === 'client-a');
    const clientB = state.clients.find((c) => c.id === 'client-b');

    expect(clientA?.sentMessagesCount).toBe(1);
    expect(clientB?.receivedMessagesCount).toBe(1);
    expect(clientB?.lastMessageReceived).toContain('Hello cross-server world!');
    expect(state.stats.publishedCount).toBe(1);
    // 2 deliveries: sender ack + recipient B delivery
    expect(state.stats.deliveredCount).toBe(2);
  });

  it('enforces channel isolation (unsubscribed channels do not receive messages)', () => {
    let state = createInitialState();
    // Client C only subscribes to 'chat-room'
    // Client D subscribes to 'notifications' and 'system-events'
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-d' },
    });

    // Client A sends message on 'chat-room'
    state = simulationReducer(state, {
      type: 'PUBLISH_MESSAGE',
      payload: {
        senderId: 'client-a',
        channel: 'chat-room',
        content: 'Chat specific update',
      },
    });

    const clientD = state.clients.find((c) => c.id === 'client-d');
    expect(clientD?.receivedMessagesCount).toBe(0);
  });

  it('models transient Redis Pub/Sub: does not buffer/replay messages for offline servers', () => {
    let state = createInitialState();
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    // Crash server-2
    state = simulationReducer(state, {
      type: 'STOP_SERVER',
      payload: { serverId: 'server-2' },
    });

    // Publish message while server-2 is down
    state = simulationReducer(state, {
      type: 'PUBLISH_MESSAGE',
      payload: {
        senderId: 'client-a',
        channel: 'chat-room',
        content: 'Message during outage',
      },
    });

    // Bring server-2 back up
    state = simulationReducer(state, {
      type: 'START_SERVER',
      payload: { serverId: 'server-2' },
    });

    // Check server-2 counters: it was not sent the message published during downtime
    const server2 = state.servers.find((s) => s.id === 'server-2');
    expect(server2?.messagesReceivedFromBroker).toBe(0);
  });

  it('clearing logs does not erase counters, stats, or client states', () => {
    let state = createInitialState();
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    state = simulationReducer(state, {
      type: 'PUBLISH_MESSAGE',
      payload: {
        senderId: 'client-a',
        channel: 'chat-room',
        content: 'Test count preservation',
      },
    });

    const publishedBefore = state.stats.publishedCount;
    expect(publishedBefore).toBe(1);

    // Clear logs
    state = simulationReducer(state, { type: 'CLEAR_LOGS' });

    expect(state.stats.publishedCount).toBe(1);
    expect(state.clients.find((c) => c.id === 'client-a')?.status).toBe('connected');
    expect(state.eventLogs.length).toBe(1); // Cleared note
  });

  it('reset simulation restores consistent initial state', () => {
    let state = createInitialState();
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    state = simulationReducer(state, {
      type: 'STOP_SERVER',
      payload: { serverId: 'server-1' },
    });

    state = simulationReducer(state, { type: 'RESET_SIMULATION' });
    expect(state.clients.every((c) => c.status === 'disconnected')).toBe(true);
    expect(state.servers.every((s) => s.status === 'healthy')).toBe(true);
    expect(state.stats.publishedCount).toBe(0);
  });

  it('runs comparison benchmark with symmetric sequential workload', async () => {
    const { executeComparisonBenchmark } = await import('../simulation/comparisonEngine');
    const state = createInitialState();
    const result = executeComparisonBenchmark(state.servers, 'sequential');

    expect(result.scenarioType).toBe('sequential');
    expect(result.steps.length).toBe(6);
    expect(result.roundRobin.finalCounts['server-1']).toBe(3);
    expect(result.roundRobin.finalCounts['server-2']).toBe(3);
    expect(result.leastConnections.finalCounts['server-1']).toBe(3);
    expect(result.leastConnections.finalCounts['server-2']).toBe(3);
    expect(result.divergentDecisionsCount).toBe(0);
  });

  it('runs comparison benchmark with churn workload and reveals Round Robin imbalance', async () => {
    const { executeComparisonBenchmark } = await import('../simulation/comparisonEngine');
    const state = createInitialState();
    const result = executeComparisonBenchmark(state.servers, 'churn');

    expect(result.scenarioType).toBe('churn');
    expect(result.steps.length).toBe(8);
    // Least connections should maintain equal or better balance
    expect(result.leastConnections.maxImbalance).toBeLessThanOrEqual(result.roundRobin.maxImbalance);
    expect(result.divergentDecisionsCount).toBeGreaterThan(0);
  });

  it('runs comparison benchmark with server outage and recovery', async () => {
    const { executeComparisonBenchmark } = await import('../simulation/comparisonEngine');
    const state = createInitialState();
    const result = executeComparisonBenchmark(state.servers, 'outage');

    expect(result.scenarioType).toBe('outage');
    expect(result.steps.some((s) => s.event.type === 'server_outage')).toBe(true);
    expect(result.steps.some((s) => s.event.type === 'server_recovery')).toBe(true);
    // Offline server 1 should receive 0 connections during outage
    const outageStep = result.steps.find((s) => s.stepNumber === 4);
    expect(outageStep?.roundRobin.selectedServerId).toBe('server-2');
    expect(outageStep?.leastConnections.selectedServerId).toBe('server-2');
  });

  it('calculates dynamic lab progress based on real-time state and student activity', async () => {
    const { calculateDynamicProgress } = await import('../utils/progressEngine');
    let state = createInitialState();
    const progress = {
      completedSections: ['overview'],
      preTestScore: null,
      postTestScore: null,
      completedExercises: [],
      completedExperiments: [],
    };

    const initialReport = calculateDynamicProgress(state, progress);
    expect(initialReport.totalPercent).toBe(0);

    // Simulate connecting clients
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-a' },
    });
    state = simulationReducer(state, {
      type: 'CONNECT_CLIENT',
      payload: { clientId: 'client-b' },
    });

    const reportAfterConnect = calculateDynamicProgress(state, progress);
    expect(reportAfterConnect.totalPercent).toBeGreaterThan(initialReport.totalPercent);
    expect(reportAfterConnect.breakdown.simulation.earned).toBe(8); // sim-connect achieved

    // Simulate quiz completion
    const reportWithQuiz = calculateDynamicProgress(state, {
      ...progress,
      preTestScore: { score: 5, total: 5, timestamp: Date.now() },
    });
    expect(reportWithQuiz.totalPercent).toBeGreaterThan(reportAfterConnect.totalPercent);
    expect(reportWithQuiz.breakdown.assessment.earned).toBe(13); // 12.5 rounded
  });
});
