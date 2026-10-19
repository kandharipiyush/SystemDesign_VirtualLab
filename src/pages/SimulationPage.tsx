import React from 'react';
import { SimulationWorkspace } from '../components/simulation/SimulationWorkspace';
import { Activity, BookOpen } from 'lucide-react';

interface SimulationPageProps {
  onNavigate: (sectionId: string) => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 07</span>
              <h1 className="text-xl font-bold text-slate-900">Virtual Simulation Workspace</h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct live distributed experiments: manage client connections, send multi-channel messages,
            evaluate load balancing, crash servers, and observe Redis Pub/Sub fan-out.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('procedure')}
            className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guided Lab Procedure</span>
          </button>
        </div>
      </div>

      {/* The Central Simulation Workspace */}
      <SimulationWorkspace />
    </div>
  );
};
