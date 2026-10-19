import React, { useState } from 'react';
import { EXPERIMENTS } from '../data/experimentsData';
import { useSimulation } from '../simulation/SimulationContext';
import type { Client } from '../simulation/types';
import {
  ListOrdered,
  Play,
  CheckCircle2,
  Circle,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ProcedurePageProps {
  onNavigate: (sectionId: string) => void;
}

export const ProcedurePage: React.FC<ProcedurePageProps> = ({ onNavigate }) => {
  const {
    state,
    connectClient,
    disconnectClient,
    reconnectClient,
    publishMessage,
    stopServer,
    startServer,
    setRoutingStrategy,
    resetSimulation,
  } = useSimulation();

  const [selectedExpId, setSelectedExpId] = useState<string>(EXPERIMENTS[0].id);

  const activeExp = EXPERIMENTS.find((e) => e.id === selectedExpId) || EXPERIMENTS[0];

  // Automated action dispatcher for quick experiment steps
  const handleRunAction = (actionType?: string) => {
    switch (actionType) {
      case 'CONNECT_CLIENT_A':
        connectClient('client-a');
        break;
      case 'CONNECT_CLIENT_B':
        connectClient('client-b');
        break;
      case 'SEND_MESSAGE_A':
        publishMessage('client-a', 'chat-room', 'Experiment 1 verified payload.');
        break;
      case 'SETUP_CROSS_SERVER':
        setRoutingStrategy('round-robin');
        connectClient('client-a');
        connectClient('client-b');
        break;
      case 'PUBLISH_CROSS_SERVER_MSG':
        publishMessage('client-a', 'chat-room', 'Hello cross-server via Redis backplane!');
        break;
      case 'SETUP_ROUND_ROBIN':
        resetSimulation();
        setRoutingStrategy('round-robin');
        break;
      case 'CONNECT_ALL_4':
        connectClient('client-a');
        connectClient('client-b');
        connectClient('client-c');
        connectClient('client-d');
        break;
      case 'DISCONNECT_CLIENT_A':
        disconnectClient('client-a');
        break;
      case 'SET_LEAST_CONN':
        setRoutingStrategy('least-connections');
        break;
      case 'RECONNECT_CLIENT_A':
        reconnectClient('client-a');
        break;
      case 'PREPARE_CLUSTER':
        connectClient('client-a');
        connectClient('client-b');
        break;
      case 'CRASH_SERVER_1':
        stopServer('server-1');
        break;
      case 'PUBLISH_OUTAGE_MSG':
        publishMessage('client-b', 'chat-room', 'Broadcast during Server 1 outage.');
        break;
      case 'RECONNECT_AFFECTED':
        reconnectClient('client-a');
        break;
      case 'REBOOT_SERVER_1':
        startServer('server-1');
        break;
      default:
        break;
    }
  };

  // State verification check for active experiment
  const checkExpCompletion = (expId: string): boolean => {
    if (expId === 'exp-1') {
      const ca = state.clients.find((c: Client) => c.id === 'client-a');
      const cb = state.clients.find((c: Client) => c.id === 'client-b');
      return (
        ca?.status === 'connected' &&
        cb?.status === 'connected' &&
        state.stats.publishedCount > 0
      );
    }
    if (expId === 'exp-2') {
      const ca = state.clients.find((c: Client) => c.id === 'client-a');
      const cb = state.clients.find((c: Client) => c.id === 'client-b');
      return (
        ca?.status === 'connected' &&
        cb?.status === 'connected' &&
        ca?.assignedServerId !== cb?.assignedServerId &&
        state.stats.publishedCount > 0 &&
        (cb?.receivedMessagesCount || 0) > 0
      );
    }
    if (expId === 'exp-3') {
      return (
        state.routingStrategy === 'least-connections' &&
        state.clients.filter((c: Client) => c.status === 'connected').length >= 3
      );
    }
    if (expId === 'exp-4') {
      return state.stats.failedDeliveriesCount > 0;
    }
    return false;
  };

  const isCompleted = checkExpCompletion(activeExp.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <ListOrdered className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 08</span>
            <h1 className="text-xl font-bold text-slate-900">Guided Laboratory Procedures</h1>
          </div>
        </div>

        {/* Experiment Selector Tabs */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          {EXPERIMENTS.map((exp) => {
            const isThisCompleted = checkExpCompletion(exp.id);
            const isSelected = selectedExpId === exp.id;

            return (
              <button
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                    Experiment {exp.number}
                  </span>
                  {isThisCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{exp.title}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Experiment Procedure Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                Experiment {activeExp.number}
              </span>
              <span className="text-xs text-slate-500">{activeExp.tagline}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">{activeExp.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`}
              ></span>
              <span>{isCompleted ? 'Criteria Verified' : 'In Progress'}</span>
            </span>

            <button
              onClick={() => onNavigate('simulation')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-xs"
            >
              <span>Go to Lab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Aim & Theory Summary */}
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <strong className="text-slate-900 block font-semibold mb-0.5">Experiment Aim:</strong>
            <p className="text-slate-700 leading-relaxed">{activeExp.aim}</p>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs">
            <strong className="text-blue-900 block font-semibold mb-0.5">Underlying Theory:</strong>
            <p className="text-blue-800 leading-relaxed">{activeExp.theorySummary}</p>
          </div>
        </div>

        {/* Step-by-Step Procedure with Quick Action Triggers */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step-by-Step Execution Sequence
          </h3>

          <div className="space-y-3">
            {activeExp.steps.map((st) => (
              <div
                key={st.stepNumber}
                className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {st.stepNumber}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{st.title}</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{st.description}</p>
                  </div>
                </div>

                {st.actionLabel && (
                  <button
                    onClick={() => handleRunAction(st.actionType)}
                    className="self-end sm:self-center px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{st.actionLabel}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expected vs Actual Result */}
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Expected Scientific Outcome:</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">{activeExp.expectedOutcome}</p>
        </div>

        {/* Navigation Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => onNavigate('simulation')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            ← Open Simulator
          </button>
          <button
            onClick={() => onNavigate('observations')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <span>View Observations & Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
