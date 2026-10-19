import React, { useState } from 'react';
import { THEORY_SECTIONS } from '../data/academicContent';
import {
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TheoryPageProps {
  onNavigate: (sectionId: string) => void;
}

export const TheoryPage: React.FC<TheoryPageProps> = ({ onNavigate }) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(THEORY_SECTIONS[0].id);

  const activeSection =
    THEORY_SECTIONS.find((s) => s.id === selectedSectionId) || THEORY_SECTIONS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Cpu className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 04</span>
            <h1 className="text-xl font-bold text-slate-900">Distributed Systems Theory</h1>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Study the 6 core modules covering RFC 6455 framing, in-memory message brokers, stateful
          connection management, and fault-tolerance mechanics.
        </p>

        {/* Module Nav Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {THEORY_SECTIONS.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedSectionId === sec.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span className="opacity-75 font-mono text-[10px]">0{idx + 1}</span>
              <span>{sec.title.split('. ')[1] || sec.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Module Detail Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">
            <span>Theory Module</span>
            <span>·</span>
            <span>Distributed Systems Engineering</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">{activeSection.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{activeSection.subtitle}</p>
        </div>

        {/* Content with markdown formatting */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-sans border-t border-slate-100 pt-4">
          {activeSection.content}
        </div>

        {/* Key Takeaways Box */}
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-blue-900 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Key Academic Takeaways</span>
          </div>
          <ul className="space-y-1.5 text-xs text-blue-950">
            {activeSection.keyTakeaways.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Navigation within Theory */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {THEORY_SECTIONS.findIndex((s) => s.id === selectedSectionId) > 0 && (
              <button
                onClick={() => {
                  const currIdx = THEORY_SECTIONS.findIndex((s) => s.id === selectedSectionId);
                  setSelectedSectionId(THEORY_SECTIONS[currIdx - 1].id);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                ← Previous Module
              </button>
            )}
            {THEORY_SECTIONS.findIndex((s) => s.id === selectedSectionId) <
              THEORY_SECTIONS.length - 1 && (
              <button
                onClick={() => {
                  const currIdx = THEORY_SECTIONS.findIndex((s) => s.id === selectedSectionId);
                  setSelectedSectionId(THEORY_SECTIONS[currIdx + 1].id);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Next Module →
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onNavigate('intro')}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Intro
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <span>Explore Architecture Diagram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
