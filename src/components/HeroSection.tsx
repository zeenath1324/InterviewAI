import React from 'react';
import { 
  ArrowRight, 
  Code, 
  Database, 
  Layout, 
  Cpu, 
  Sparkles, 
  Check, 
  BookOpen,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { JobRole } from '../types/interview';

interface HeroSectionProps {
  onStartInterview: (preselectedRole?: JobRole) => void;
  onOpenInfo: (tab: 'howItWorks' | 'rubric' | 'tips' | 'about') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartInterview,
  onOpenInfo,
}) => {
  const roles: Array<{
    name: JobRole;
    icon: React.ReactNode;
    tagline: string;
    description: string;
    sampleQuestion: string;
    topics: string[];
  }> = [
    {
      name: 'Software Developer',
      icon: <Code className="w-4 h-4 text-indigo-400" />,
      tagline: 'Web, Backend & Algorithms',
      description: 'Focuses on asynchronous JavaScript, OOP concepts, RESTful API design, database transactions, and data structures.',
      sampleQuestion: 'Explain the difference between synchronous and asynchronous execution in JavaScript.',
      topics: ['Async / Promises', 'REST APIs', 'SQL vs NoSQL', 'OOP Principles'],
    },
    {
      name: 'Data Analyst',
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      tagline: 'SQL, Python & Exploratory Analysis',
      description: 'Focuses on SQL joins and window functions, handling missing data, statistical measures, and business cohort retention.',
      sampleQuestion: 'When would you use DENSE_RANK instead of RANK in a SQL window query?',
      topics: ['SQL Joins', 'Window Functions', 'Data Cleaning', 'Mean vs Median'],
    },
    {
      name: 'UI/UX Designer',
      icon: <Layout className="w-4 h-4 text-violet-400" />,
      tagline: 'Design Systems & Usability',
      description: 'Focuses on user research heuristics, visual hierarchy, Figma component architecture, and WCAG accessibility standards.',
      sampleQuestion: 'How do you conduct a usability test on a wireframe prototype without biasing the user?',
      topics: ['Design Systems', 'WCAG AA', 'User Testing', 'Visual Hierarchy'],
    },
    {
      name: 'AI/ML Engineer',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      tagline: 'ML Foundations & Generative AI',
      description: 'Focuses on overfitting regularization, evaluation metrics (precision vs recall), the Transformer attention mechanism, and RAG.',
      sampleQuestion: 'Why is precision more critical than accuracy in severe class imbalance problems?',
      topics: ['Supervised Learning', 'Overfitting', 'Transformers', 'RAG Pipelines'],
    },
    {
      name: 'Prompt Engineer',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      tagline: 'Context Framing & Agent Workflows',
      description: 'Focuses on few-shot prompting, chain-of-thought reasoning, prompt injection defenses, and systematic prompt evaluations.',
      sampleQuestion: 'How does Chain-of-Thought prompting improve multi-step logical reasoning in LLMs?',
      topics: ['Chain-of-Thought', 'Few-Shot Evals', 'Injection Defense', 'ReAct Agents'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        {/* Subtle Project Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <span>College Placement & Fresher Preparation Tool</span>
        </div>

        {/* Title and Subtitle as strictly required */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            InterviewAI
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-slate-300">
            Your AI-powered interview coach
          </p>
        </div>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Built specifically for college students and fresh graduates preparing for campus placement rounds. Practice real technical questions one-by-one, get actionable 0–10 feedback, and review model answers.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onStartInterview()}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenInfo('howItWorks')}
            className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors"
          >
            How It Evaluates Answers
          </button>
        </div>

        {/* Realistic Project Benchmark Pills */}
        <div className="pt-6 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">5 Tech Roles</div>
            <div className="text-xs text-slate-400">Software, Data, UI/UX, AI</div>
          </div>
          <div className="p-2 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">0–10 Rubric</div>
            <div className="text-xs text-slate-400">Strict Scoring Criteria</div>
          </div>
          <div className="p-2 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">Adaptive Q&A</div>
            <div className="text-xs text-slate-400">Builds on Performance</div>
          </div>
          <div className="p-2 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">STAR Method</div>
            <div className="text-xs text-slate-400">Structured Guidance</div>
          </div>
        </div>
      </section>

      {/* Target Roles Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-850 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Select a Role to Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Choose your target career path to configure questions and difficulty.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Available: Beginner · Intermediate · Advanced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.name}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {role.icon}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {role.tagline}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {role.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Sample Question Preview:
                  </span>
                  <p className="text-slate-200 italic line-clamp-2">
                    "{role.sampleQuestion}"
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {role.topics.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onStartInterview(role.name)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <span>Practice Role</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Quick Custom Setup Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 w-fit">
                <Terminal className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Custom Topic Focus
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Have an upcoming interview for a specific company or university subject? You can specify custom topics like React Hooks, Dynamic Programming, or Docker.
              </p>
            </div>

            <button
              onClick={() => onStartInterview()}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Custom Interview Setup</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Why This Project Was Built (Student Portfolio Authenticity) */}
      <section className="p-6 sm:p-8 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 text-left">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono text-xs">
            Student Project Background & Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              The Placement Problem
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Most freshers fail technical rounds not because of a lack of coding knowledge, but because they freeze or ramble without structured articulation.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              The Gemini Integration
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We pass the candidate's answer and expected criteria through an Express backend route using Google's GenAI SDK, returning structured rubric feedback.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              The STAR Feedback Loop
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each response provides a numerical grade, identified technical strengths, missed edge cases, and an ideal model answer you can learn from.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
