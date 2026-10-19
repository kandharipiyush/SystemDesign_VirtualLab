import React, { useState, useMemo } from 'react';
import type { ServerInstance } from '../../simulation/types';
import {
  executeComparisonBenchmark,
  type ComparisonScenarioType,
  type ComparisonRunResult,
} from '../../simulation/comparisonEngine';
import {
  Scale,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ComparisonExperimentPanelProps {
  servers: ServerInstance[];
  onApplyToLiveCluster?: (strategy: 'round-robin' | 'least-connections') => void;
}

export const ComparisonExperimentPanel: React.FC<ComparisonExperimentPanelProps> = ({
  servers,
  onApplyToLiveCluster,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ComparisonScenarioType>('churn');
  const [runCount, setRunCount] = useState<number>(1);
  const [isReset, setIsReset] = useState<boolean>(false);

  // Compute benchmark result dynamically from actual current cluster servers
  const result: ComparisonRunResult | null = useMemo(() => {
    if (isReset) return null;
    return executeComparisonBenchmark(servers, selectedScenario);
  }, [servers, selectedScenario, runCount, isReset]);

  const handleRun = () => {
    setIsReset(false);
    setRunCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setIsReset(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      {/* Header and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Experiment 3: Round Robin vs Least Connections Comparison
            </h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
              Side-by-Side Dual Run
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute identical workloads on the same initial server configuration to compare socket distribution, load imbalance, and routing decisions.
          </p>
        </div>

        {/* Experiment Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedScenario}
              onChange={(e) => {
                setSelectedScenario(e.target.value as ComparisonScenarioType);
                setIsReset(false);
              }}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="churn">Scenario 2: Unequal Lifetimes & Churn (Recommended)</option>
              <option value="sequential">Scenario 1: Sequential Influx (Symmetric)</option>
              <option value="outage">Scenario 3: Node Outage & Recovery</option>
            </select>
          </div>

          {/* Run / Repeat Button */}
          <button
            onClick={handleRun}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            title="Execute comparison with selected scenario"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isReset ? 'Run Comparison' : 'Repeat Run'}</span>
          </button>

          {/* Reset Control */}
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
            title="Reset comparison results"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Comparison</span>
          </button>
        </div>
      </div>

      {isReset || !result ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
            <Scale className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h4 className="text-sm font-bold text-slate-800">Comparison Simulator Ready</h4>
            <p className="text-xs text-slate-500 mt-1">
              Select a benchmark scenario and click "Run Comparison" to evaluate Round Robin vs Least Connections on {servers.length} cluster node(s).
            </p>
          </div>
          <button
            onClick={handleRun}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Run Benchmark Comparison Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scenario Overview Banner */}
          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-950">{result.scenarioTitle}</span>
                <span className="font-mono text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                  {result.steps.length} Workload Events · {result.totalDecisions} Handshakes
                </span>
                {result.divergentDecisionsCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    ⚡ {result.divergentDecisionsCount} Divergent Decisions
                  </span>
                )}
              </div>
              <p className="text-indigo-800 mt-1 leading-relaxed">{result.scenarioDescription}</p>
            </div>
          </div>

          {/* Side-by-Side Algorithm Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Round Robin Card */}
            <div className="border border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50/50 to-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <RotateCcw className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Round Robin</h4>
                    <span className="text-[11px] text-blue-700 font-medium">Cyclic Sequential Allocation</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                  O(1) Scheduling
                </span>
              </div>

              {/* Server Connection Distribution Bars */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Server Socket Allocation:</span>
                  <span className="text-slate-500 font-mono text-[11px]">Active Connections</span>
                </div>

                {servers.map((s) => {
                  const count = result.roundRobin.finalCounts[s.id] || 0;
                  const pct = result.roundRobin.percentages[s.id] || 0;
                  return (
                    <div key={s.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-blue-600" />
                          {s.name} (: {s.port})
                        </span>
                        <span className="font-mono font-bold text-blue-900">
                          {count} conns ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statistical Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Max Disparity (Δ)</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {result.roundRobin.maxImbalance} socket{result.roundRobin.maxImbalance !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Load Variance (σ²)</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {result.roundRobin.variance}
                  </span>
                </div>
              </div>

              {onApplyToLiveCluster && (
                <button
                  onClick={() => onApplyToLiveCluster('round-robin')}
                  className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Activate Round Robin in Live Simulator</span>
                </button>
              )}
            </div>

            {/* Least Connections Card */}
            <div className="border border-indigo-200 rounded-xl p-4 bg-gradient-to-br from-indigo-50/50 to-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Least Connections</h4>
                    <span className="text-[11px] text-indigo-700 font-medium">Adaptive Load-Aware Allocation</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">
                  O(N) Scheduling
                </span>
              </div>

              {/* Server Connection Distribution Bars */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Server Socket Allocation:</span>
                  <span className="text-slate-500 font-mono text-[11px]">Active Connections</span>
                </div>

                {servers.map((s) => {
                  const count = result.leastConnections.finalCounts[s.id] || 0;
                  const pct = result.leastConnections.percentages[s.id] || 0;
                  return (
                    <div key={s.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-indigo-600" />
                          {s.name} (: {s.port})
                        </span>
                        <span className="font-mono font-bold text-indigo-900">
                          {count} conns ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statistical Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Max Disparity (Δ)</span>
                  <span className="text-base font-bold text-emerald-700 font-mono flex items-center gap-1">
                    {result.leastConnections.maxImbalance} socket{result.leastConnections.maxImbalance !== 1 ? 's' : ''}
                    {result.leastConnections.maxImbalance <= result.roundRobin.maxImbalance && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    )}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Load Variance (σ²)</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {result.leastConnections.variance}
                  </span>
                </div>
              </div>

              {onApplyToLiveCluster && (
                <button
                  onClick={() => onApplyToLiveCluster('least-connections')}
                  className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Activate Least Connections in Live Simulator</span>
                </button>
              )}
            </div>
          </div>

          {/* Academic Comparative Verdict Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-2 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Comparative Analytical Findings & Conclusion:</span>
            </div>
            <p className="leading-relaxed text-slate-300 font-sans">{result.summaryVerdict}</p>
          </div>

          {/* Step-by-Step Routing Decision Trace Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Event-by-Event Routing Decision Audit Trail:
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {result.steps.length} sequential execution events
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">#</th>
                      <th className="py-2 px-3">Workload Event</th>
                      <th className="py-2 px-3">Round Robin Target</th>
                      <th className="py-2 px-3">Least Connections Target</th>
                      <th className="py-2 px-3 w-28 text-center">Comparison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {result.steps.map((step) => (
                      <tr
                        key={step.stepNumber}
                        className={`hover:bg-slate-50 transition-colors ${
                          step.diverged ? 'bg-amber-50/60' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-400">{step.stepNumber}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className="font-medium text-slate-900">{step.event.description}</span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-blue-900">
                              {step.roundRobin.selectedServerName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block font-sans">
                            {step.roundRobin.reason}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-indigo-900">
                              {step.leastConnections.selectedServerName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block font-sans">
                            {step.leastConnections.reason}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {step.diverged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              Diverged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-medium text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Identical
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
