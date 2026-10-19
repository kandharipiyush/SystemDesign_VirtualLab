import type { ServerInstance, RoutingStrategy } from './types';

export interface LoadBalancerDecision {
  selectedServer: ServerInstance | null;
  nextCursor: number;
  reason: string;
}

export function selectServer(
  servers: ServerInstance[],
  strategy: RoutingStrategy,
  currentCursor: number
): LoadBalancerDecision {
  const healthyServers = servers.filter((s) => s.status === 'healthy');

  if (healthyServers.length === 0) {
    return {
      selectedServer: null,
      nextCursor: currentCursor,
      reason: 'No healthy WebSocket server instances available in cluster.',
    };
  }

  if (strategy === 'round-robin') {
    const validCursor = currentCursor >= 0 ? currentCursor % healthyServers.length : 0;
    const selected = healthyServers[validCursor];
    const nextCursor = (validCursor + 1) % healthyServers.length;
    return {
      selectedServer: selected,
      nextCursor,
      reason: `Assigned sequentially using Round Robin (index ${validCursor} -> ${selected.name}).`,
    };
  }

  // Least Connections Strategy
  // Sort by active connections ascending; tie-break deterministically by port/id
  const sorted = [...healthyServers].sort((a, b) => {
    const diff = a.activeConnectionIds.length - b.activeConnectionIds.length;
    if (diff !== 0) return diff;
    return a.port - b.port;
  });

  const selected = sorted[0];
  return {
    selectedServer: selected,
    nextCursor: currentCursor,
    reason: `Assigned to ${selected.name} with least active connections (${selected.activeConnectionIds.length} active).`,
  };
}
