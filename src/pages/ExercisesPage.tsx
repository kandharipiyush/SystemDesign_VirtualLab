import React, { useState } from 'react';
import { EXERCISES } from '../data/exercisesData';
import { useSimulation } from '../simulation/SimulationContext';
import {
  Award,
  CheckCircle2,
  Circle,
  Lightbulb,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ExercisesPageProps {
  onNavigate: (sectionId: string) => void;
}

export const ExercisesPage: React.FC<ExercisesPageProps> = ({ onNavigate }) => {
  const { state } = useSimulation();

  const [selectedExId, setSelectedExId] = useState<string>(EXERCISES[0].id);
  const [selectedPrediction, setSelectedPrediction] = useState<Record<string, number>>({});
  const [showPredictionResult, setShowPredictionResult] = useState<Record<string, boolean>>({});

  const activeEx = EXERCISES.find((e) => e.id === selectedExId) || EXERCISES[0];

  const handlePredict = (exerciseId: string, optionIndex: number) => {
    setSelectedPrediction((prev) => ({ ...prev, [exerciseId]: optionIndex }));
    setShowPredictionResult((prev) => ({ ...prev, [exerciseId]: true }));
  };

  // Check how many tasks are completed in the active exercise
  const completedTaskCount = activeEx.tasks.filter((t) => t.isCompleted(state)).length;
  const isExerciseFullyComplete = completedTaskCount === activeEx.tasks.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 10</span>
            <h1 className="text-xl font-bold text-slate-900">Progressive Hands-On Exercises</h1>
          </div>
        </div>

        {/* Level Selector */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {EXERCISES.map((ex) => {
            const isExDone = ex.tasks.every((t) => t.isCompleted(state));
            const isSelected = selectedExId === ex.id;

            return (
              <button
                key={ex.id}
                onClick={() => setSelectedExId(ex.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      ex.level === 'Beginner'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ex.level === 'Intermediate'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {ex.level}
                  </span>
                  {isExDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{ex.title}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Detail Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                {activeEx.level} Level
              </span>
              <span className="text-xs text-slate-500">{activeEx.tagline}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">{activeEx.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                isExerciseFullyComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isExerciseFullyComplete ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              ></span>
              <span>
                {completedTaskCount} / {activeEx.tasks.length} Tasks Complete
              </span>
            </span>

            <button
              onClick={() => onNavigate('simulation')}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-xs"
            >
              <span>Open Simulator</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Instructions */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 block font-semibold mb-1">Task Instructions:</strong>
          {activeEx.instructions}
        </div>

        {/* Challenge Mode: Predict Before Execute */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Challenge Mode: Predict Before Execution
            </h4>
          </div>

          <p className="text-xs font-semibold text-slate-800">
            {activeEx.predictionQuestion.prompt}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {activeEx.predictionQuestion.options.map((opt, oIdx) => {
              const isSelected = selectedPrediction[activeEx.id] === oIdx;
              const hasAnswered = showPredictionResult[activeEx.id];
              const isCorrect = oIdx === activeEx.predictionQuestion.correctIndex;

              let btnClass = 'bg-white border-slate-200 hover:border-blue-300 text-slate-700';
              if (hasAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-rose-100 border-rose-300 text-rose-950 line-through';
                }
              } else if (isSelected) {
                btnClass = 'bg-blue-100 border-blue-400 text-blue-900 font-semibold';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handlePredict(activeEx.id, oIdx)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {showPredictionResult[activeEx.id] && (
            <div className="p-3 bg-white border border-blue-200 rounded-lg text-xs space-y-1">
              <strong className="text-blue-900 block font-semibold">Scientific Explanation:</strong>
              <p className="text-slate-600 leading-relaxed">
                {activeEx.predictionQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Verification Checklist (Derived from Real Simulator State) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verification Criteria (Live State Checked)
          </h3>

          <div className="space-y-2">
            {activeEx.tasks.map((task) => {
              const done = task.isCompleted(state);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    done
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span>{task.label}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {done ? 'SATISFIED' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hints */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Implementation Hints:</span>
          </div>
          <ul className="space-y-1 text-slate-600 pl-4 list-disc">
            {activeEx.hints.map((hint, hIdx) => (
              <li key={hIdx}>{hint}</li>
            ))}
          </ul>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => onNavigate('observations')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            ← Observations
          </button>
          <button
            onClick={() => onNavigate('posttest')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <span>Take Post-Test Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
