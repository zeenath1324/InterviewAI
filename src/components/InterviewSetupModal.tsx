import React, { useState, useRef } from 'react';
import { 
  X, 
  ArrowRight, 
  User, 
  Code, 
  Database, 
  Layout, 
  Cpu, 
  Sparkles,
  Check, 
  Upload, 
  FileText, 
  Mic, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DifficultyLevel, InterviewConfig, InterviewMode, JobRole, ResumeData } from '../types/interview';
import { uploadAndParseResume, parseResumeText } from '../services/interviewApi';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: InterviewConfig) => void;
  initialRole?: JobRole;
  initialMode?: InterviewMode;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  initialRole = 'Software Developer',
  initialMode = 'mixed',
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [selectedRole, setSelectedRole] = useState<JobRole>(initialRole);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Beginner');
  const [selectedMode, setSelectedMode] = useState<InterviewMode>(initialMode);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(10);
  const [focusArea, setFocusArea] = useState('');
  const [voiceMode, setVoiceMode] = useState<boolean>(false);

  // Resume Upload State
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [showPasteResume, setShowPasteResume] = useState<boolean>(false);
  const [pastedResumeText, setPastedResumeText] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const modes: Array<{
    id: InterviewMode;
    label: string;
    description: string;
  }> = [
    {
      id: 'mixed',
      label: 'Mixed Interview',
      description: 'Balanced mix of technical concepts, scenario problem-solving, and behavioral questions.',
    },
    {
      id: 'technical',
      label: 'Technical Interview',
      description: 'Deep-dive into role-specific algorithms, code patterns, SQL, Python, or systems.',
    },
    {
      id: 'hr',
      label: 'HR & Behavioral',
      description: 'Self-introduction, conflict resolution, strengths, weaknesses, and teamwork (STAR format).',
    },
    {
      id: 'project',
      label: 'Project-Based',
      description: 'Explores your academic project architecture, blockers, debugging, and trade-offs.',
    },
    {
      id: 'resume',
      label: 'Resume-Based',
      description: 'Questions tailored directly to your uploaded resume skills, projects, and internships.',
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

  // Handle PDF Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Please upload a PDF document.');
      return;
    }

    setIsUploadingResume(true);
    setResumeError(null);

    try {
      const parsed = await uploadAndParseResume(file);
      setResumeData(parsed);
      setSelectedMode('resume');
      if (parsed.candidateName && parsed.candidateName !== 'Candidate' && !candidateName) {
        setCandidateName(parsed.candidateName);
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setResumeError(err.message || 'Failed to parse resume PDF. You can paste the text instead.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Handle Paste Resume Text
  const handleParsePastedText = async () => {
    if (!pastedResumeText.trim()) return;
    setIsUploadingResume(true);
    setResumeError(null);

    try {
      const parsed = await parseResumeText(pastedResumeText);
      setResumeData(parsed);
      setSelectedMode('resume');
      setShowPasteResume(false);
      if (parsed.candidateName && parsed.candidateName !== 'Candidate' && !candidateName) {
        setCandidateName(parsed.candidateName);
      }
    } catch (err: any) {
      setResumeError('Failed to parse text. Please try again.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = candidateName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your name to personalize your interview report.');
      return;
    }

    if (selectedMode === 'resume' && !resumeData) {
      setErrorMessage('Please upload your resume PDF or paste resume text for a Resume-Based interview.');
      return;
    }

    setErrorMessage('');
    onStartSession({
      candidateName: trimmed,
      role: selectedRole,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      totalQuestions: selectedQuestionCount,
      selectedQuestionCount,
      focusArea: focusArea.trim() || undefined,
      resumeData: resumeData || undefined,
      voiceMode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-7 my-8 text-left max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Configure Interview Session
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select interview mode, role, difficulty, and optional resume.
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

          {/* Interview Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Interview Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modes.map((m) => {
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-850 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{m.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Resume Upload (Highlights if Resume Mode is selected) */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Resume Upload (Optional)</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload your PDF resume to generate questions grounded in your real projects.
                </p>
              </div>

              {resumeData && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Resume Attached</span>
                </span>
              )}
            </div>

            {/* Upload Area */}
            {!resumeData ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="application/pdf"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-white bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploadingResume ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        <span>Extracting Resume Content...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload PDF Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasteResume(!showPasteResume)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    {showPasteResume ? 'Cancel text paste' : 'Or paste resume text'}
                  </button>
                </div>

                {showPasteResume && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={4}
                      value={pastedResumeText}
                      onChange={(e) => setPastedResumeText(e.target.value)}
                      placeholder="Paste your resume sections (Skills, Projects, Education, Internships)..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={isUploadingResume || !pastedResumeText.trim()}
                      className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50"
                    >
                      Extract & Attach
                    </button>
                  </div>
                )}

                {resumeError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{resumeError}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    {resumeData.fileName || 'Resume parsed successfully'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setResumeData(null)}
                    className="text-[11px] text-slate-400 hover:text-rose-400"
                  >
                    Remove
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>
                    <strong className="text-slate-300">Extracted Skills:</strong>{' '}
                    {resumeData.skills?.slice(0, 5).join(', ') || 'Various technical skills'}
                  </div>
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <div>
                      <strong className="text-slate-300">Projects Detected:</strong>{' '}
                      {resumeData.projects.map((p) => p.title).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Job Role
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
              Difficulty Tier
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

          {/* Question Count, Topic Focus & Voice Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Number of Questions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setSelectedQuestionCount(num)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors text-center ${
                      selectedQuestionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num} Questions
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
                placeholder="e.g. React, SQL, Power BI, Transformers"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Voice Mode Toggle */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Voice Interview Mode</span>
                <span className="text-[11px] text-slate-400">Interviewer speaks questions; you answer verbally with microphone.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVoiceMode(!voiceMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                voiceMode ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  voiceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
