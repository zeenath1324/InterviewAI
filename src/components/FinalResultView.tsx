import React, { useState, useEffect } from 'react';
import { 
  Check, 
  RotateCcw, 
  Briefcase, 
  Printer, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  BookOpen,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';
import { FinalSummaryData, InterviewConfig, QAHistoryItem } from '../types/interview';
import { generateFinalSummary } from '../services/interviewApi';

interface FinalResultViewProps {
  config: InterviewConfig;
  history: QAHistoryItem[];
  onRestartSameSession: () => void;
  onChangeRole: () => void;
}

export const FinalResultView: React.FC<FinalResultViewProps> = ({
  config,
  history,
  onRestartSameSession,
  onChangeRole,
}) => {
  const selectedQuestionCount = config.selectedQuestionCount || config.totalQuestions || history.length || 10;
  const [summaryData, setSummaryData] = useState<FinalSummaryData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    async function loadSummary() {
      setIsLoadingSummary(true);
      try {
        const result = await generateFinalSummary({
          role: config.role,
          difficulty: config.difficulty,
          candidateName: config.candidateName,
          mode: config.mode,
          history,
        });
        setSummaryData(result);
      } catch (err) {
        console.error('Failed to generate summary:', err);
        const total = history.length;
        const avg = total > 0
          ? Number((history.reduce((acc, curr) => acc + curr.evaluation.score, 0) / total).toFixed(1))
          : 7.0;
        setSummaryData({
          overallScore: avg,
          technicalScore: avg,
          communicationScore: avg,
          problemSolvingScore: avg,
          confidenceScore: avg,
          questionsAnswered: total,
          readinessPercentage: Math.min(96, Math.max(40, Math.round((avg / 10) * 100))),
          performanceLevel: avg >= 8 ? 'Placement Ready' : 'Promising Potential',
          strongAreas: ['Core conceptual explanations', 'Good technical vocabulary'],
          weakAreas: ['Use the STAR framework for project questions', 'Mention concrete trade-offs'],
          recommendedTopics: [`${config.role} Core Principles`, 'System Debugging', 'STAR Method Delivery'],
          personalizedSuggestions: ['Review the provided model answers', 'Practice verbal pacing under 2 minutes per question'],
          executiveSummary: `${config.candidateName} completed the mock interview for ${config.role}, showing a solid baseline of knowledge.`,
          nextSteps: ['Review the provided model answers', 'Practice verbal pacing under 2 minutes per question'],
        });
      } finally {
        setIsLoadingSummary(false);
      }
    }

    loadSummary();
  }, [config, history]);

  const toggleAccordion = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const text = `InterviewAI Evaluation: ${config.candidateName}
Role: ${config.role} (${config.difficulty} - Mode: ${config.mode})
Overall Score: ${summaryData.overallScore}/10
Technical Score: ${summaryData.technicalScore}/10
Communication Score: ${summaryData.communicationScore}/10
Problem Solving: ${summaryData.problemSolvingScore}/10
Confidence: ${summaryData.confidenceScore}/10
Readiness: ${summaryData.readinessPercentage}% (${summaryData.performanceLevel})
Questions Completed: ${selectedQuestionCount} Questions Completed`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoadingSummary) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-bold text-white">Synthesizing Comprehensive Report</h3>
        <p className="text-xs text-slate-400">
          Grading technical depth, communication, and campus readiness...
        </p>
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      {/* Overview Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-indigo-400 block">
              Interview Evaluation · {config.role} ({config.difficulty}) · Mode: {config.mode}
            </span>
            <h1 className="text-2xl font-bold text-white font-display">
              Readiness Report for {config.candidateName}
            </h1>
            <p className="text-xs text-slate-400">
              Evaluated using multi-criteria rubric standards.
            </p>
          </div>

          {/* Readiness Metric & Completion Box */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="p-3.5 sm:p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div>
                <div className="text-[11px] uppercase font-mono text-emerald-400 font-semibold">
                  Session Completed
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{selectedQuestionCount} Questions Completed</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div>
                <div className="text-[11px] uppercase font-mono text-slate-400">
                  Readiness Score
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {summaryData.readinessPercentage}%
                </div>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-850 text-indigo-300 border border-slate-750">
                  {summaryData.performanceLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={onRestartSameSession}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Again</span>
          </button>
          <button
            onClick={onChangeRole}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Change Job Role</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            title="Print or save PDF report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            title="Copy summary text"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Dimensional Competency Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Overall Score</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {summaryData.overallScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Technical</span>
          <div className="text-xl font-bold text-indigo-300 font-mono mt-1">
            {summaryData.technicalScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Communication</span>
          <div className="text-xl font-bold text-violet-300 font-mono mt-1">
            {summaryData.communicationScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Problem Solving</span>
          <div className="text-xl font-bold text-emerald-300 font-mono mt-1">
            {summaryData.problemSolvingScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Confidence</span>
          <div className="text-xl font-bold text-amber-300 font-mono mt-1">
            {summaryData.confidenceScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>
      </div>

      {/* Recruiter's Executive Summary */}
      {summaryData.executiveSummary && (
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Recruiter Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {summaryData.executiveSummary}
          </p>
        </div>
      )}

      {/* Strengths & Weaknesses 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strong Areas */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Verified Strong Areas
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {summaryData.strongAreas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Areas Needing Improvement
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {summaryData.weakAreas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">!</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Topics & Personalized Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaryData.recommendedTopics && summaryData.recommendedTopics.length > 0 && (
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Recommended Topics to Study
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {summaryData.recommendedTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-mono shrink-0">#</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summaryData.personalizedSuggestions && summaryData.personalizedSuggestions.length > 0 && (
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Personalized Improvement Suggestions
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {summaryData.personalizedSuggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">→</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-white font-display">
          Question-by-Question Review ({history.length} Questions)
        </h2>

        <div className="space-y-2">
          {history.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {item.isFollowUp ? 'Follow-up' : `Q${idx + 1}`}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-white truncate">
                      {item.question.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.skipped ? (
                      <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Skipped
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.evaluation.score} / 10
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Candidate Answer:
                      </span>
                      <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed italic">
                        "{item.answer}"
                      </p>
                    </div>

                    {!item.skipped && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <strong className="text-emerald-400 block mb-1">Strengths:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            {item.evaluation.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <strong className="text-amber-400 block mb-1">Needs Improvement:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            {item.evaluation.weaknesses.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Model Sample Answer:
                      </span>
                      <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.evaluation.sampleAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
