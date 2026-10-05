import React from 'react';
import { X, Check, BookOpen, Layers, Award, Terminal } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'howItWorks' | 'rubric' | 'tips' | 'about';
  onSelectTab: (tab: 'howItWorks' | 'rubric' | 'tips' | 'about') => void;
  onStartClick: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onStartClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-7 my-8 text-left"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-mono">
              AI
            </div>
            <h2 className="text-base font-bold text-white font-display">
              InterviewAI Documentation & Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 mt-4 space-x-1 overflow-x-auto text-xs">
          <button
            onClick={() => onSelectTab('howItWorks')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'howItWorks'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onSelectTab('rubric')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Grading Rubric
          </button>
          <button
            onClick={() => onSelectTab('tips')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tips'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Placement Tips
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`pb-2 px-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Project Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-300">
          {activeTab === 'howItWorks' && (
            <div className="space-y-3">
              <p className="leading-relaxed">
                InterviewAI simulates real-time technical and behavioral interviews for college students and freshers entering the tech industry.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">1. Role & Difficulty Setup</span>
                <p className="text-slate-400">Select Software Developer, Data Analyst, UI/UX Designer, AI/ML Engineer, or Prompt Engineer across 3 difficulty tiers.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">2. Adaptive One-by-One Questioning</span>
                <p className="text-slate-400">Questions are generated dynamically with Google Gemini. Subsequent questions adapt based on your answers and demonstrated strengths.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">3. Structured Rubric Feedback</span>
                <p className="text-slate-400">Every response receives a 0–10 score, positive highlights, missed technical nuances, and a model answer for comparison.</p>
              </div>
            </div>
          )}

          {activeTab === 'rubric' && (
            <div className="space-y-2.5">
              <p className="text-slate-400 mb-2">
                Our grading matches evaluation standards used by technical interviewers:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">8.5 – 10.0 : Placement Ready / Exceptional</strong>
                <p className="text-slate-400">Accurate terminology, clear trade-offs, structured delivery (e.g. STAR), and real project context.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-indigo-400 block mb-0.5">7.0 – 8.0 : Solid Baseline</strong>
                <p className="text-slate-400">Demonstrates solid understanding of fundamentals. Minor improvements needed in depth or examples.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">5.0 – 6.5 : Partial / Surface Level</strong>
                <p className="text-slate-400">Touches on basic keywords but lacks structural clarity, edge-case awareness, or practical examples.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-rose-400 block mb-0.5">0.0 – 4.5 : Incomplete / Needs Revision</strong>
                <p className="text-slate-400">Answer is too brief, off-topic, or contains conceptual errors.</p>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">The STAR Formula for Behavioral & Project Questions</strong>
                <p className="text-slate-400 leading-relaxed">
                  Always break your project answers into Situation (what was the context), Task (what was your objective), Action (what specific tools/code you wrote), and Result (the metric or outcome).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">Never Give One-Sentence Answers</strong>
                <p className="text-slate-400 leading-relaxed">
                  Interviewers want to see your problem-solving process. Even for definition questions, define the term, explain why it exists, and give a practical trade-off example.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">Time Your Answers</strong>
                <p className="text-slate-400 leading-relaxed">
                  In a 45-minute tech interview, aim for 90 to 120 seconds per conceptual answer so there is ample time for discussion.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">Student Project Overview</strong>
                <p className="text-slate-400 leading-relaxed">
                  Developed as a real portfolio project to provide college freshers with zero-cost, high-quality interview practice before sitting for on-campus placement drives.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <span className="text-indigo-400 font-semibold block">Technology Stack:</span>
                <ul className="space-y-1 text-slate-400">
                  <li>• Frontend: React 19 + TypeScript + Tailwind CSS</li>
                  <li>• Backend: Express.js (Node runtime) running on port 3000</li>
                  <li>• AI Engine: Google GenAI SDK (gemini-3.8-flash) via server proxy</li>
                  <li>• Audio: Web Speech Synthesis & Recognition APIs</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onStartClick();
            }}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
};
