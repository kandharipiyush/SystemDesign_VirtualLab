import React from 'react';
import { REFERENCES } from '../data/referencesData';
import { ExternalLink, BookOpen, ArrowLeft } from 'lucide-react';

interface ReferencesPageProps {
  onNavigate: (sectionId: string) => void;
  onResetProgress?: () => void;
}

export const ReferencesPage: React.FC<ReferencesPageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 13</span>
            <h1 className="text-xl font-bold text-slate-900">Official References & Further Reading</h1>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Standard RFC specifications, official technology manuals, and open educational resources supporting
          this virtual laboratory.
        </p>
      </div>

      {/* References Grid */}
      <div className="space-y-4">
        {REFERENCES.map((ref) => (
          <div
            key={ref.id}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{ref.title}</h3>
                <span className="text-xs text-blue-700 font-medium">{ref.publisher}</span>
              </div>

              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                <span>Read Official Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{ref.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {ref.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
        <button
          onClick={() => onNavigate('conclusion')}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Conclusion</span>
        </button>

        <button
          onClick={() => onNavigate('overview')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
        >
          Return to Experiment Overview
        </button>
      </div>
    </div>
  );
};
