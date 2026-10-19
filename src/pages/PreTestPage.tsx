import React, { useState } from 'react';
import { getRandomQuizQuestions } from '../data/quizData';
import type { QuizQuestion } from '../data/quizData';
import { getStudentProgress, saveStudentProgress } from '../utils/storage';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Award,
  Sparkles,
} from 'lucide-react';

interface PreTestPageProps {
  onNavigate: (sectionId: string) => void;
  onComplete: () => void;
}

export const PreTestPage: React.FC<PreTestPageProps> = ({ onNavigate, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => getRandomQuizQuestions(5));
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all 5 questions before submitting the assessment.');
      return;
    }

    let calculatedScore = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    // Save to local storage
    const current = getStudentProgress();
    const updated = {
      ...current,
      preTestScore: {
        score: calculatedScore,
        total: questions.length,
        timestamp: Date.now(),
      },
    };
    saveStudentProgress(updated);
    onComplete();
  };

  const handleRetry = () => {
    setQuestions(getRandomQuizQuestions(5));
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const percentScore = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold text-blue-700 font-mono">EXPERIMENT 14 · SECTION 06</span>
              <h1 className="text-xl font-bold text-slate-900">Pre-Test Knowledge Calibration</h1>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {answeredCount} / {questions.length} Answered
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2">
          Test your preliminary understanding of persistent TCP sockets, load-balancing heuristics, and
          distributed Pub/Sub backplanes before entering the interactive simulation.
        </p>
      </div>

      {/* Score Summary Banner if Submitted */}
      {isSubmitted && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-3 rounded-xl ${
                  percentScore >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pre-Test Assessment Complete</h3>
                <span className="text-xs text-slate-500">
                  {percentScore >= 60
                    ? 'Great baseline understanding! You are ready for the lab simulation.'
                    : 'Good attempt. Review the detailed explanations below to strengthen your understanding.'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black font-mono text-slate-900">
                {score} / {questions.length}
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  percentScore >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {percentScore}% Score
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleRetry}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry with Fresh Questions</span>
            </button>

            <button
              onClick={() => onNavigate('simulation')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <span>Launch Virtual Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, qIndex) => {
          const selectedOpt = selectedAnswers[q.id];
          const isCorrect = isSubmitted && selectedOpt === q.correctIndex;
          const isIncorrect = isSubmitted && selectedOpt !== undefined && selectedOpt !== q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCorrect
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : isIncorrect
                  ? 'bg-rose-50/40 border-rose-300'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-bold text-slate-900 leading-snug">
                  Question {qIndex + 1}. {q.question}
                </span>

                {isSubmitted && (
                  <span className="shrink-0">
                    {isCorrect ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isChecked = selectedOpt === optIdx;
                  const isRightAnswer = isSubmitted && optIdx === q.correctIndex;

                  let optClass = 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-800';
                  if (isChecked && !isSubmitted) {
                    optClass = 'border-blue-500 bg-blue-50/80 text-blue-900 font-semibold ring-1 ring-blue-300';
                  } else if (isSubmitted) {
                    if (isRightAnswer) {
                      optClass = 'border-emerald-500 bg-emerald-100/70 text-emerald-950 font-bold';
                    } else if (isChecked && !isRightAnswer) {
                      optClass = 'border-rose-400 bg-rose-100/60 text-rose-950 line-through';
                    }
                  }

                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${optClass}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        disabled={isSubmitted}
                        checked={isChecked}
                        onChange={() => handleSelectOption(q.id, optIdx)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                      />
                      <span className="leading-relaxed">{opt}</span>
                    </label>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {isSubmitted && (
                <div className="mt-3.5 p-3 rounded-xl bg-slate-100 text-slate-700 text-xs border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Explanation:</span>
                  </div>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {!isSubmitted && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {answeredCount === questions.length
                ? 'All questions completed. Ready to submit!'
                : `Please answer all questions (${questions.length - answeredCount} remaining)`}
            </span>

            <button
              type="submit"
              disabled={answeredCount < questions.length}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
                answeredCount === questions.length
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Submit Pre-Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
