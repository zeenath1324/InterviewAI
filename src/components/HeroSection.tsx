import React from 'react';
import { 
  ArrowRight, 
  Code, 
  Database, 
  Layout, 
  Cpu, 
  Sparkles, 
  FileText,
  MessageSquare,
  Briefcase,
  Layers,
  Terminal,
  BookOpen
} from 'lucide-react';
import { InterviewMode, JobRole } from '../types/interview';

interface HeroSectionProps {
  onStartInterview: (preselectedRole?: JobRole, mode?: InterviewMode) => void;
  onOpenInfo: (tab: 'howItWorks' | 'rubric' | 'tips' | 'about') => void;
  onOpenPrompts: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartInterview,
  onOpenInfo,
  onOpenPrompts,
}) => {
  const interviewModes: Array<{
    id: InterviewMode;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'technical',
      label: 'Technical Interview',
      description: 'Core concepts, algorithms, SQL, Python & system questions.',
      icon: <Code className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'hr',
      label: 'HR & Behavioral',
      description: 'Tell me about yourself, strengths, conflict resolution & teamwork.',
      icon: <MessageSquare className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'project',
      label: 'Project Deep-Dive',
      description: 'Explain your project, biggest challenges, debugging & architecture.',
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'resume',
      label: 'Resume-Based',
      description: 'Upload your PDF resume to generate questions grounded in your projects.',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'mixed',
      label: 'Mixed Simulator',
      description: 'Realistic placement simulation combining technical, project & HR rounds.',
      icon: <Layers className="w-4 h-4 text-violet-400" />,
    },
  ];

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
      description: 'Focuses on OOP concepts, asynchronous JavaScript, APIs, SQL vs NoSQL, and data structures.',
      sampleQuestion: 'What is the difference between a process and a thread?',
      topics: ['Async / Promises', 'REST APIs', 'SQL Joins', 'OOP Principles'],
    },
    {
      name: 'Data Analyst',
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      tagline: 'SQL, Python & Exploratory Analysis',
      description: 'Focuses on SQL queries, WHERE vs HAVING, window functions, Python dictionaries, and Power BI DAX.',
      sampleQuestion: 'What is the difference between WHERE and HAVING in SQL?',
      topics: ['SQL Joins', 'Window Functions', 'Power Query', 'Calculated Columns'],
    },
    {
      name: 'UI/UX Designer',
      icon: <Layout className="w-4 h-4 text-violet-400" />,
      tagline: 'Design Systems & Usability',
      description: 'Focuses on user research heuristics, visual hierarchy, Figma component architecture, and WCAG standards.',
      sampleQuestion: 'How do you conduct an unbiased usability test on a prototype?',
      topics: ['Design Systems', 'WCAG AA', 'User Testing', 'Visual Hierarchy'],
    },
    {
      name: 'AI/ML Engineer',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      tagline: 'ML Foundations & Generative AI',
      description: 'Focuses on supervised learning, overfitting, CNN vs RNN, and Retrieval-Augmented Generation (RAG).',
      sampleQuestion: 'What is overfitting and what techniques prevent it?',
      topics: ['Supervised Learning', 'Overfitting', 'Transformers', 'RAG Pipelines'],
    },
    {
      name: 'Prompt Engineer',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      tagline: 'Context Framing & Agent Workflows',
      description: 'Focuses on zero-shot vs few-shot prompting, Chain-of-Thought reasoning, and reducing hallucinations.',
      sampleQuestion: 'What is the difference between zero-shot and few-shot prompting?',
      topics: ['Chain-of-Thought', 'Few-Shot Evals', 'Injection Defense', 'Hallucinations'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
          <span>AI Interview Simulator · Fresher Placement Prep</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            InterviewAI
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-slate-300">
            Your AI-powered interview coach
          </p>
        </div>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Practice realistic job interviews with structured questions, dynamic follow-ups based on your exact answers, and multi-criteria scoring across technical accuracy, communication, and confidence.
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
            onClick={() => onStartInterview(undefined, 'resume')}
            className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Upload Resume for Custom Q&A</span>
          </button>
        </div>

        {/* Metric Badges */}
        <div className="pt-6 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-2.5 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">5 Interview Modes</div>
            <div className="text-xs text-slate-400">HR, Tech, Project, Resume</div>
          </div>
          <div className="p-2.5 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">Dynamic Follow-ups</div>
            <div className="text-xs text-slate-400">Drills into Your Answers</div>
          </div>
          <div className="p-2.5 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">Resume PDF Upload</div>
            <div className="text-xs text-slate-400">Projects & Skills Grounding</div>
          </div>
          <div className="p-2.5 border border-slate-850 rounded-lg bg-slate-900/40">
            <div className="text-lg font-bold text-white font-mono">Multi-Score Report</div>
            <div className="text-xs text-slate-400">Tech, Clarity & Confidence</div>
          </div>
        </div>
      </section>

      {/* Interview Modes Grid */}
      <section className="space-y-4">
        <div className="border-b border-slate-850 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-1 text-left">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">
              Select Your Interview Mode
            </h2>
            <p className="text-xs text-slate-400">
              Practice specific interview rounds commonly conducted during campus hiring.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {interviewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onStartInterview(undefined, mode.id)}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-colors text-left flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                {mode.icon}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {mode.label}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Target Roles Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-850 pb-4 text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Explore Practice Roles & Question Banks
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Structured question bank with beginner, intermediate, and advanced levels.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            HR · SQL · Python · Power BI · AI/ML
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
                    Sample Question:
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

          {/* Prompt Engineering Callout Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 w-fit">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                Prompt Engineering Guide
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Learn the production prompt patterns used in this app: Role Prompting, Few-Shot In-Context Scoring, Structured JSON schemas, and Dynamic Follow-Up Chaining.
              </p>
            </div>

            <button
              onClick={onOpenPrompts}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Prompt Engineering</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Educational Background & Engineering Decisions */}
      <section className="p-6 sm:p-8 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 text-left">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono text-xs">
            Student Project Architecture & How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              1. Curated Question Bank
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard fresher questions across HR, SQL, Python, Power BI, and ML are categorized with difficulty levels and benchmark key points.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              2. Dynamic Follow-Up Chaining
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instead of static question hopping, Gemini analyzes your response and generates a targeted follow-up question to test depth.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              3. Secure Server-Side Routing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Google GenAI SDK runs strictly in the Express server (<code className="font-mono text-slate-300">server.ts</code>), keeping credentials private and safe.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
