import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  User, 
  Code, 
  Database, 
  Layout, 
  Cpu, 
  Sparkles,
  Check
} from 'lucide-react';
import { DifficultyLevel, InterviewConfig, JobRole } from '../types/interview';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: InterviewConfig) => void;
  initialRole?: JobRole;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  initialRole = 'Software Developer',
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [selectedRole, setSelectedRole] = useState<JobRole>(initialRole);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Beginner');
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [focusArea, setFocusArea] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const roles: Array<{
    id: JobRole;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'Software Developer',
      label: 'Software Developer',
      description: 'Web development, OOP, APIs, databases, Git, algorithms',
      icon: <Code className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'Data Analyst',
      label: 'Data Analyst',
      description: 'SQL queries, Pandas, statistics, data cleaning, cohorts',
      icon: <Database className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'UI/UX Designer',
      label: 'UI/UX Designer',
      description: 'Wireframing, Figma components, usability, accessibility (WCAG)',
      icon: <Layout className="w-4 h-4 text-violet-400" />,
    },
    {
      id: 'AI/ML Engineer',
      label: 'AI/ML Engineer',
      description: 'ML fundamentals, transformers, RAG architecture, evaluation',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'Prompt Engineer',
      label: 'Prompt Engineer',
      description: 'In-context learning, CoT reasoning, injection defenses, evals',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
  ];

  const difficulties: Array<{
    id: DifficultyLevel;
    label: string;
    subtitle: string;
  }> = [
    {
      id: 'Beginner',
      label: 'Beginner',
      subtitle: 'Core concepts & clarity (College freshers)',
    },
    {
      id: 'Intermediate',
      label: 'Intermediate',
      subtitle: 'Real scenarios & troubleshooting',
    },
    {
      id: 'Advanced',
      label: 'Advanced',
      subtitle: 'System trade-offs & edge cases',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = candidateName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your name to personalize your interview report.');
      return;
    }

    setErrorMessage('');
    onStartSession({
      candidateName: trimmed,
      role: selectedRole,
      difficulty: selectedDifficulty,
      totalQuestions,
      focusArea: focusArea.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-7 my-8 text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Interview Setup
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your target role and question preferences.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Candidate Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Candidate Name <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g., Alex Chen"
                className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errorMessage ? 'border-rose-500' : 'border-slate-800'
                }`}
                autoFocus
              />
            </div>
            {errorMessage ? (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errorMessage}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">This will appear on your final evaluation report.</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Job Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-slate-850 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {r.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {r.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Difficulty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {difficulties.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    type="button"
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-850 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{diff.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {diff.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count & Focus Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Questions
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 7].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setTotalQuestions(num)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      totalQuestions === num
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Optional Topic Focus
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g. React, SQL, Figma"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Begin Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
