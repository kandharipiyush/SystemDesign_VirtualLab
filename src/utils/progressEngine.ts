import type { SimulationState } from '../simulation/types';
import type { StudentProgress } from './storage';
import { EXERCISES } from '../data/exercisesData';

export interface ProgressMilestone {
  id: string;
  category: 'simulation' | 'assessment' | 'exercise' | 'theory';
  label: string;
  points: number;
  completed: boolean;
  hint: string;
}

export interface DynamicProgressReport {
  totalPercent: number;
  breakdown: {
    simulation: { earned: number; max: number };
    assessment: { earned: number; max: number };
    exercise: { earned: number; max: number };
    theory: { earned: number; max: number };
  };
  milestones: ProgressMilestone[];
  completedCount: number;
  totalCount: number;
}

export function calculateDynamicProgress(
  state: SimulationState,
  progress: StudentProgress
): DynamicProgressReport {
  const connectedCount = state.clients.filter((c) => c.status === 'connected').length;
  const hasPublished = state.stats.publishedCount >= 1;
  const hasMultiPublished = state.stats.publishedCount >= 3;
  const hasFailover =
    state.servers.some((s) => s.status !== 'healthy') ||
    state.eventLogs.some((e) => e.type === 'server_down');
  const hasRecovered = state.eventLogs.some((e) => e.type === 'server_recovery');
  const hasLeastConn =
    state.routingStrategy === 'least-connections' && connectedCount > 0;

  // Exercise completions calculated dynamically from actual simulation state
  const ex1Done = EXERCISES[0]?.tasks.every((t) => t.isCompleted(state)) || false;
  const ex2Done = EXERCISES[1]?.tasks.every((t) => t.isCompleted(state)) || false;
  const ex3Done = EXERCISES[2]?.tasks.every((t) => t.isCompleted(state)) || false;

  // Curricular section exploration
  const visited = progress.completedSections || [];
  const theoryReviewed = visited.includes('theory');
  const archReviewed = visited.includes('architecture');
  const procReviewed = visited.includes('procedure');
  const obsReviewed = visited.includes('observations') || visited.includes('conclusion');

  const milestones: ProgressMilestone[] = [
    // 1. Hands-on Interactive Simulation (35 pts max)
    {
      id: 'sim-connect',
      category: 'simulation',
      label: 'Establish multiple client WebSocket handshakes (≥ 2 clients)',
      points: 8,
      completed: connectedCount >= 2,
      hint: 'Connect at least 2 clients in the Simulation Workspace.',
    },
    {
      id: 'sim-all-connect',
      category: 'simulation',
      label: 'Connect full 4-node client cluster',
      points: 4,
      completed: connectedCount >= 4,
      hint: 'Click "Connect All" in the Client Registry.',
    },
    {
      id: 'sim-publish',
      category: 'simulation',
      label: 'Transmit message across cluster via Redis Pub/Sub',
      points: 8,
      completed: hasPublished,
      hint: 'Dispatch a message from the Message Console.',
    },
    {
      id: 'sim-multi-channel',
      category: 'simulation',
      label: 'Transmit high-throughput messages across topic channels',
      points: 3,
      completed: hasMultiPublished,
      hint: 'Send 3 or more messages on different channels.',
    },
    {
      id: 'sim-failover',
      category: 'simulation',
      label: 'Simulate server crash & observe socket termination',
      points: 6,
      completed: hasFailover,
      hint: 'Click "Crash Node" on Server 1 to test fault tolerance.',
    },
    {
      id: 'sim-recovery',
      category: 'simulation',
      label: 'Recover offline server and re-subscribe to Pub/Sub',
      points: 3,
      completed: hasRecovered,
      hint: 'Click "Restart" on a crashed server node.',
    },
    {
      id: 'sim-least-conn',
      category: 'simulation',
      label: 'Operate Least Connections load-balancing protocol',
      points: 3,
      completed: hasLeastConn,
      hint: 'Switch to Mode 2: Least Connections in the Simulation Workspace.',
    },

    // 2. Knowledge Assessments (25 pts max)
    {
      id: 'test-pre',
      category: 'assessment',
      label: 'Complete Pre-Test Diagnostic Quiz',
      points: 12.5,
      completed: progress.preTestScore !== null,
      hint: 'Complete the Pre-Test quiz in Section 06.',
    },
    {
      id: 'test-post',
      category: 'assessment',
      label: 'Complete Post-Test Mastery Assessment',
      points: 12.5,
      completed: progress.postTestScore !== null,
      hint: 'Complete the Post-Test assessment in Section 11.',
    },

    // 3. Hands-on Progressive Exercises (20 pts max)
    {
      id: 'ex-1',
      category: 'exercise',
      label: 'Exercise 1: Client Cluster Distribution',
      points: 7,
      completed: ex1Done,
      hint: 'Fulfill Exercise 1 criteria (connect 3+ clients across both servers).',
    },
    {
      id: 'ex-2',
      category: 'exercise',
      label: 'Exercise 2: Cross-Server Redis Fan-out',
      points: 7,
      completed: ex2Done,
      hint: 'Fulfill Exercise 2 criteria (cross-server broadcast delivery).',
    },
    {
      id: 'ex-3',
      category: 'exercise',
      label: 'Exercise 3: Fault Injection & Transient Message Loss',
      points: 6,
      completed: ex3Done,
      hint: 'Fulfill Exercise 3 criteria (publish message during server outage).',
    },

    // 4. Academic Theory & Methodology (20 pts max)
    {
      id: 'theory-core',
      category: 'theory',
      label: 'Review Theory & RFC 6455 Protocols',
      points: 5,
      completed: theoryReviewed,
      hint: 'Read Section 04: Theory.',
    },
    {
      id: 'arch-core',
      category: 'theory',
      label: 'Inspect Distributed Architecture & Topologies',
      points: 5,
      completed: archReviewed,
      hint: 'Explore Section 05: Architecture & Topology.',
    },
    {
      id: 'proc-core',
      category: 'theory',
      label: 'Review Guided Experimental Procedures',
      points: 5,
      completed: procReviewed,
      hint: 'Inspect Section 08: Procedure.',
    },
    {
      id: 'obs-core',
      category: 'theory',
      label: 'Examine Observations, Results & References',
      points: 5,
      completed: obsReviewed,
      hint: 'Review Section 09: Observations & Section 12: Conclusion.',
    },
  ];

  let simEarned = 0;
  let testEarned = 0;
  let exEarned = 0;
  let theoryEarned = 0;

  milestones.forEach((m) => {
    if (m.completed) {
      if (m.category === 'simulation') simEarned += m.points;
      else if (m.category === 'assessment') testEarned += m.points;
      else if (m.category === 'exercise') exEarned += m.points;
      else if (m.category === 'theory') theoryEarned += m.points;
    }
  });

  const totalEarned = Math.round(simEarned + testEarned + exEarned + theoryEarned);
  const totalPercent = Math.min(100, Math.max(0, totalEarned));

  return {
    totalPercent,
    breakdown: {
      simulation: { earned: Math.round(simEarned), max: 35 },
      assessment: { earned: Math.round(testEarned), max: 25 },
      exercise: { earned: Math.round(exEarned), max: 20 },
      theory: { earned: Math.round(theoryEarned), max: 20 },
    },
    milestones,
    completedCount: milestones.filter((m) => m.completed).length,
    totalCount: milestones.length,
  };
}
