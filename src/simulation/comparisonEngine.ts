import type { ServerInstance } from './types';
import { selectServer } from './loadBalancer';

export type ComparisonScenarioType = 'sequential' | 'churn' | 'outage';

export interface ComparisonEvent {
  id: string;
  stepNumber: number;
  clientId: string;
  clientName: string;
  type: 'connect' | 'disconnect' | 'server_outage' | 'server_recovery';
  serverId?: string;
  description: string;
}

export interface StepDecisionDetail {
  selectedServerId: string | null;
  selectedServerName: string;
  reason: string;
  activeLoadAfter: Record<string, number>;
}

export interface ComparisonStepResult {
  stepNumber: number;
  event: ComparisonEvent;
  roundRobin: StepDecisionDetail;
  leastConnections: StepDecisionDetail;
  diverged: boolean;
}

export interface ComparisonRunResult {
  scenarioType: ComparisonScenarioType;
  scenarioTitle: string;
  scenarioDescription: string;
  initialServers: { id: string; name: string; port: number }[];
  steps: ComparisonStepResult[];
  roundRobin: {
    finalCounts: Record<string, number>;
    percentages: Record<string, number>;
    maxImbalance: number; // max - min
    variance: number;
  };
  leastConnections: {
    finalCounts: Record<string, number>;
    percentages: Record<string, number>;
    maxImbalance: number; // max - min
    variance: number;
  };
  totalDecisions: number;
  divergentDecisionsCount: number;
  summaryVerdict: string;
}

export function getScenarioEvents(scenarioType: ComparisonScenarioType): ComparisonEvent[] {
  switch (scenarioType) {
    case 'sequential':
      return [
        {
          id: 'ev-1',
          stepNumber: 1,
          clientId: 'client-a',
          clientName: 'Client A',
          type: 'connect',
          description: 'Client A initiates WebSocket handshake',
        },
        {
          id: 'ev-2',
          stepNumber: 2,
          clientId: 'client-b',
          clientName: 'Client B',
          type: 'connect',
          description: 'Client B initiates WebSocket handshake',
        },
        {
          id: 'ev-3',
          stepNumber: 3,
          clientId: 'client-c',
          clientName: 'Client C',
          type: 'connect',
          description: 'Client C initiates WebSocket handshake',
        },
        {
          id: 'ev-4',
          stepNumber: 4,
          clientId: 'client-d',
          clientName: 'Client D',
          type: 'connect',
          description: 'Client D initiates WebSocket handshake',
        },
        {
          id: 'ev-5',
          stepNumber: 5,
          clientId: 'client-e',
          clientName: 'Client E',
          type: 'connect',
          description: 'Client E initiates WebSocket handshake',
        },
        {
          id: 'ev-6',
          stepNumber: 6,
          clientId: 'client-f',
          clientName: 'Client F',
          type: 'connect',
          description: 'Client F initiates WebSocket handshake',
        },
      ];

    case 'churn':
      return [
        {
          id: 'ev-1',
          stepNumber: 1,
          clientId: 'client-a',
          clientName: 'Client A',
          type: 'connect',
          description: 'Client A connects',
        },
        {
          id: 'ev-2',
          stepNumber: 2,
          clientId: 'client-b',
          clientName: 'Client B',
          type: 'connect',
          description: 'Client B connects',
        },
        {
          id: 'ev-3',
          stepNumber: 3,
          clientId: 'client-c',
          clientName: 'Client C',
          type: 'connect',
          description: 'Client C connects',
        },
        {
          id: 'ev-4',
          stepNumber: 4,
          clientId: 'client-d',
          clientName: 'Client D',
          type: 'connect',
          description: 'Client D connects',
        },
        {
          id: 'ev-5',
          stepNumber: 5,
          clientId: 'client-b',
          clientName: 'Client B',
          type: 'disconnect',
          description: 'Client B terminates connection on Server 2 (inducing socket load asymmetry)',
        },
        {
          id: 'ev-6',
          stepNumber: 6,
          clientId: 'client-e',
          clientName: 'Client E',
          type: 'connect',
          description: 'New Client E connects while cluster load is imbalanced',
        },
        {
          id: 'ev-7',
          stepNumber: 7,
          clientId: 'client-d',
          clientName: 'Client D',
          type: 'disconnect',
          description: 'Client D terminates connection on Server 2',
        },
        {
          id: 'ev-8',
          stepNumber: 8,
          clientId: 'client-f',
          clientName: 'Client F',
          type: 'connect',
          description: 'New Client F connects under asymmetrical cluster load',
        },
      ];

    case 'outage':
      return [
        {
          id: 'ev-1',
          stepNumber: 1,
          clientId: 'client-a',
          clientName: 'Client A',
          type: 'connect',
          description: 'Client A connects to cluster',
        },
        {
          id: 'ev-2',
          stepNumber: 2,
          clientId: 'client-b',
          clientName: 'Client B',
          type: 'connect',
          description: 'Client B connects to cluster',
        },
        {
          id: 'ev-3',
          stepNumber: 3,
          clientId: 'server-1',
          clientName: 'WebSocket Server 1',
          serverId: 'server-1',
          type: 'server_outage',
          description: 'CRITICAL: Server 1 suffers sudden crash / process termination',
        },
        {
          id: 'ev-4',
          stepNumber: 4,
          clientId: 'client-c',
          clientName: 'Client C',
          type: 'connect',
          description: 'Client C attempts connection during Server 1 outage',
        },
        {
          id: 'ev-5',
          stepNumber: 5,
          clientId: 'client-d',
          clientName: 'Client D',
          type: 'connect',
          description: 'Client D attempts connection during Server 1 outage',
        },
        {
          id: 'ev-6',
          stepNumber: 6,
          clientId: 'server-1',
          clientName: 'WebSocket Server 1',
          serverId: 'server-1',
          type: 'server_recovery',
          description: 'Server 1 recovers and re-registers as healthy with 0 connections',
        },
        {
          id: 'ev-7',
          stepNumber: 7,
          clientId: 'client-e',
          clientName: 'Client E',
          type: 'connect',
          description: 'Client E arrives after Server 1 recovery',
        },
      ];
  }
}

/**
 * Runs a side-by-side comparison experiment between Round Robin and Least Connections
 * on an identical initial cluster state and identical sequence of arrival events.
 */
export function executeComparisonBenchmark(
  servers: ServerInstance[],
  scenarioType: ComparisonScenarioType
): ComparisonRunResult {
  const events = getScenarioEvents(scenarioType);

  // Deep clone servers for isolated algorithmic tracking
  let rrServers: ServerInstance[] = servers.map((s) => ({
    ...s,
    status: s.status,
    activeConnectionIds: [],
  }));

  let lcServers: ServerInstance[] = servers.map((s) => ({
    ...s,
    status: s.status,
    activeConnectionIds: [],
  }));

  let rrCursor = 0;
  const rrClientToServer: Record<string, string> = {};
  const lcClientToServer: Record<string, string> = {};

  const stepResults: ComparisonStepResult[] = [];

  for (const event of events) {
    if (event.type === 'connect') {
      // 1. Round Robin calculation
      const rrDecision = selectServer(rrServers, 'round-robin', rrCursor);
      const rrSelected = rrDecision.selectedServer;
      if (rrSelected) {
        rrServers = rrServers.map((s) =>
          s.id === rrSelected.id
            ? { ...s, activeConnectionIds: [...s.activeConnectionIds, event.clientId] }
            : s
        );
        rrClientToServer[event.clientId] = rrSelected.id;
        rrCursor = rrDecision.nextCursor;
      }

      // 2. Least Connections calculation
      const lcDecision = selectServer(lcServers, 'least-connections', 0);
      const lcSelected = lcDecision.selectedServer;
      if (lcSelected) {
        lcServers = lcServers.map((s) =>
          s.id === lcSelected.id
            ? { ...s, activeConnectionIds: [...s.activeConnectionIds, event.clientId] }
            : s
        );
        lcClientToServer[event.clientId] = lcSelected.id;
      }

      const diverged = rrSelected?.id !== lcSelected?.id;

      const rrLoads: Record<string, number> = {};
      rrServers.forEach((s) => {
        rrLoads[s.id] = s.activeConnectionIds.length;
      });

      const lcLoads: Record<string, number> = {};
      lcServers.forEach((s) => {
        lcLoads[s.id] = s.activeConnectionIds.length;
      });

      stepResults.push({
        stepNumber: event.stepNumber,
        event,
        roundRobin: {
          selectedServerId: rrSelected?.id || null,
          selectedServerName: rrSelected?.name || 'Rejected (Cluster Full/Offline)',
          reason: rrDecision.reason,
          activeLoadAfter: rrLoads,
        },
        leastConnections: {
          selectedServerId: lcSelected?.id || null,
          selectedServerName: lcSelected?.name || 'Rejected (Cluster Full/Offline)',
          reason: lcDecision.reason,
          activeLoadAfter: lcLoads,
        },
        diverged,
      });
    } else if (event.type === 'disconnect') {
      // Remove connection from assigned server in RR
      const rrAssignedServerId = rrClientToServer[event.clientId];
      if (rrAssignedServerId) {
        rrServers = rrServers.map((s) =>
          s.id === rrAssignedServerId
            ? { ...s, activeConnectionIds: s.activeConnectionIds.filter((id) => id !== event.clientId) }
            : s
        );
        delete rrClientToServer[event.clientId];
      }

      // Remove connection from assigned server in LC
      const lcAssignedServerId = lcClientToServer[event.clientId];
      if (lcAssignedServerId) {
        lcServers = lcServers.map((s) =>
          s.id === lcAssignedServerId
            ? { ...s, activeConnectionIds: s.activeConnectionIds.filter((id) => id !== event.clientId) }
            : s
        );
        delete lcClientToServer[event.clientId];
      }

      const rrLoads: Record<string, number> = {};
      rrServers.forEach((s) => {
        rrLoads[s.id] = s.activeConnectionIds.length;
      });

      const lcLoads: Record<string, number> = {};
      lcServers.forEach((s) => {
        lcLoads[s.id] = s.activeConnectionIds.length;
      });

      stepResults.push({
        stepNumber: event.stepNumber,
        event,
        roundRobin: {
          selectedServerId: rrAssignedServerId || null,
          selectedServerName: `Freed from ${rrAssignedServerId ? 'Server' : 'None'}`,
          reason: `Client closed socket. Socket removed from table.`,
          activeLoadAfter: rrLoads,
        },
        leastConnections: {
          selectedServerId: lcAssignedServerId || null,
          selectedServerName: `Freed from ${lcAssignedServerId ? 'Server' : 'None'}`,
          reason: `Client closed socket. Socket removed from table.`,
          activeLoadAfter: lcLoads,
        },
        diverged: false,
      });
    } else if (event.type === 'server_outage') {
      const targetServerId = event.serverId || 'server-1';

      // Drop server in RR
      rrServers = rrServers.map((s) =>
        s.id === targetServerId ? { ...s, status: 'offline', activeConnectionIds: [] } : s
      );

      // Drop server in LC
      lcServers = lcServers.map((s) =>
        s.id === targetServerId ? { ...s, status: 'offline', activeConnectionIds: [] } : s
      );

      const rrLoads: Record<string, number> = {};
      rrServers.forEach((s) => {
        rrLoads[s.id] = s.status === 'healthy' ? s.activeConnectionIds.length : 0;
      });

      const lcLoads: Record<string, number> = {};
      lcServers.forEach((s) => {
        lcLoads[s.id] = s.status === 'healthy' ? s.activeConnectionIds.length : 0;
      });

      stepResults.push({
        stepNumber: event.stepNumber,
        event,
        roundRobin: {
          selectedServerId: targetServerId,
          selectedServerName: 'Server Outage (Offline)',
          reason: 'Node process terminated. All attached sockets dropped.',
          activeLoadAfter: rrLoads,
        },
        leastConnections: {
          selectedServerId: targetServerId,
          selectedServerName: 'Server Outage (Offline)',
          reason: 'Node process terminated. All attached sockets dropped.',
          activeLoadAfter: lcLoads,
        },
        diverged: false,
      });
    } else if (event.type === 'server_recovery') {
      const targetServerId = event.serverId || 'server-1';

      // Reboot server in RR
      rrServers = rrServers.map((s) =>
        s.id === targetServerId ? { ...s, status: 'healthy', activeConnectionIds: [] } : s
      );

      // Reboot server in LC
      lcServers = lcServers.map((s) =>
        s.id === targetServerId ? { ...s, status: 'healthy', activeConnectionIds: [] } : s
      );

      const rrLoads: Record<string, number> = {};
      rrServers.forEach((s) => {
        rrLoads[s.id] = s.activeConnectionIds.length;
      });

      const lcLoads: Record<string, number> = {};
      lcServers.forEach((s) => {
        lcLoads[s.id] = s.activeConnectionIds.length;
      });

      stepResults.push({
        stepNumber: event.stepNumber,
        event,
        roundRobin: {
          selectedServerId: targetServerId,
          selectedServerName: 'Server Rebooted (Healthy)',
          reason: 'Instance recovered and resubscribed to Redis backplane.',
          activeLoadAfter: rrLoads,
        },
        leastConnections: {
          selectedServerId: targetServerId,
          selectedServerName: 'Server Rebooted (Healthy)',
          reason: 'Instance recovered and ready for new handshakes.',
          activeLoadAfter: lcLoads,
        },
        diverged: false,
      });
    }
  }

  // Calculate final statistics
  const rrFinalCounts: Record<string, number> = {};
  const lcFinalCounts: Record<string, number> = {};

  let rrTotalConns = 0;
  let lcTotalConns = 0;

  rrServers.forEach((s) => {
    const count = s.activeConnectionIds.length;
    rrFinalCounts[s.id] = count;
    rrTotalConns += count;
  });

  lcServers.forEach((s) => {
    const count = s.activeConnectionIds.length;
    lcFinalCounts[s.id] = count;
    lcTotalConns += count;
  });

  const rrPercentages: Record<string, number> = {};
  const lcPercentages: Record<string, number> = {};

  rrServers.forEach((s) => {
    rrPercentages[s.id] = rrTotalConns > 0 ? Math.round((rrFinalCounts[s.id] / rrTotalConns) * 100) : 0;
  });

  lcServers.forEach((s) => {
    lcPercentages[s.id] = lcTotalConns > 0 ? Math.round((lcFinalCounts[s.id] / lcTotalConns) * 100) : 0;
  });

  const rrValues = Object.values(rrFinalCounts);
  const lcValues = Object.values(lcFinalCounts);

  const rrMax = Math.max(...rrValues, 0);
  const rrMin = Math.min(...rrValues, 0);
  const rrImbalance = rrMax - rrMin;

  const lcMax = Math.max(...lcValues, 0);
  const lcMin = Math.min(...lcValues, 0);
  const lcImbalance = lcMax - lcMin;

  // Calculate variance: sum((x - mean)^2) / N
  const rrMean = rrValues.length > 0 ? rrTotalConns / rrValues.length : 0;
  const lcMean = lcValues.length > 0 ? lcTotalConns / lcValues.length : 0;

  const rrVariance =
    rrValues.length > 0
      ? Number(
          (
            rrValues.reduce((acc, val) => acc + Math.pow(val - rrMean, 2), 0) / rrValues.length
          ).toFixed(2)
        )
      : 0;

  const lcVariance =
    lcValues.length > 0
      ? Number(
          (
            lcValues.reduce((acc, val) => acc + Math.pow(val - lcMean, 2), 0) / lcValues.length
          ).toFixed(2)
        )
      : 0;

  const divergentCount = stepResults.filter((s) => s.diverged).length;

  let summaryVerdict = '';
  if (scenarioType === 'churn') {
    summaryVerdict =
      `Under asymmetric connection churn and unequal session lifetimes, Least Connections achieved superior equilibrium (Imbalance Δ=${lcImbalance}, Variance=${lcVariance}) compared to Round Robin (Imbalance Δ=${rrImbalance}, Variance=${rrVariance}). Because Round Robin operates blindly via a sequential ring pointer, it fails to compensate when clients disconnect early, causing server socket hotspots.`;
  } else if (scenarioType === 'outage') {
    summaryVerdict =
      `During node failure and subsequent recovery, both algorithms safely filtered offline instances. However, upon node recovery, Least Connections immediately detected the recovered node's 0-connection state and steered incoming handshakes to re-balance the cluster, whereas Round Robin merely proceeded to its next modular index.`;
  } else {
    summaryVerdict =
      `When all incoming persistent connections remain active without disconnects or churn, both Round Robin and Least Connections produce a balanced distribution (Imbalance Δ=${rrImbalance} vs Δ=${lcImbalance}). Round Robin provides O(1) CPU efficiency, while Least Connections incurs minor O(N) socket-table lookups with identical distribution in symmetric workloads.`;
  }

  const scenarioMeta = {
    sequential: {
      title: 'Sequential Client Influx (Symmetric Load)',
      description: 'Evaluates standard burst connection arrival where all clients maintain active sessions.',
    },
    churn: {
      title: 'Connection Churn & Lifetime Asymmetry',
      description: 'Simulates real-world WebSocket traffic where clients connect and disconnect at differing intervals.',
    },
    outage: {
      title: 'Mid-Stream Node Failure & Recovery',
      description: 'Tests cluster resilience and load re-distribution when a gateway crashes during active traffic.',
    },
  }[scenarioType];

  return {
    scenarioType,
    scenarioTitle: scenarioMeta.title,
    scenarioDescription: scenarioMeta.description,
    initialServers: servers.map((s) => ({ id: s.id, name: s.name, port: s.port })),
    steps: stepResults,
    roundRobin: {
      finalCounts: rrFinalCounts,
      percentages: rrPercentages,
      maxImbalance: rrImbalance,
      variance: rrVariance,
    },
    leastConnections: {
      finalCounts: lcFinalCounts,
      percentages: lcPercentages,
      maxImbalance: lcImbalance,
      variance: lcVariance,
    },
    totalDecisions: stepResults.filter((s) => s.event.type === 'connect').length,
    divergentDecisionsCount: divergentCount,
    summaryVerdict,
  };
}
