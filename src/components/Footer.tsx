import React from 'react';
import { Terminal } from 'lucide-react';
import { JobRole } from '../types/interview';

interface FooterProps {
  onSelectRole: (role: JobRole) => void;
  onOpenInfo: (tab: 'howItWorks' | 'rubric' | 'tips' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectRole, onOpenInfo }) => {
  const roles: JobRole[] = [
    'Software Developer',
    'Data Analyst',
    'UI/UX Designer',
    'AI/ML Engineer',
    'Prompt Engineer',
  ];

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-850 mt-20 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          {/* Col 1: Project overview */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold font-display text-sm">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span>InterviewAI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An AI-powered interview practice platform designed and developed as a college portfolio project. Helps freshers practice campus placement rounds with rubric-backed feedback.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              React 19 · TypeScript · Express · Gemini 3.8 Flash
            </div>
          </div>

          {/* Col 2: Roles */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-200">
              Practice Tracks
            </h4>
            <ul className="space-y-1.5">
              {roles.map((r) => (
                <li key={r}>
                  <button
                    onClick={() => onSelectRole(r)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-200">
              Documentation
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onOpenInfo('howItWorks')}
                  className="hover:text-white transition-colors text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfo('rubric')}
                  className="hover:text-white transition-colors text-left"
                >
                  Grading Rubric
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfo('tips')}
                  className="hover:text-white transition-colors text-left"
                >
                  Placement Tips
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfo('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  Project Details
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} InterviewAI · College Portfolio Project
          </div>
          <div>
            Built for Fresher & Campus Placement Success
          </div>
        </div>
      </div>
    </footer>
  );
};
