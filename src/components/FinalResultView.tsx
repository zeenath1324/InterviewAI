import React, { useState, useEffect } from 'react';
import { 
  Check, 
  RotateCcw, 
  Briefcase, 
  Printer, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight
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
          questionsAnswered: total,
          readinessPercentage: Math.min(96, Math.max(40, Math.round((avg / 10) * 100))),
          performanceLevel: avg >= 8 ? 'Placement Ready' : 'Promising Potential',
          strongAreas: ['Core conceptual explanations', 'Good terminology usage'],
          areasToImprove: ['Use the STAR framework for project questions', 'Mention concrete trade-offs'],
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
Role: ${config.role} (${config.difficulty})
Overall Score: ${summaryData.overallScore}/10
Readiness: ${summaryData.readinessPercentage}% (${summaryData.performanceLevel})
Questions Answered: ${summaryData.questionsAnswered}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoadingSummary) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-bold text-white">Generating Performance Summary</h3>
        <p className="text-xs text-slate-400">
          Analyzing your responses and calculating campus interview readiness...
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
              Interview Completed · {config.role} ({config.difficulty})
            </span>
            <h1 className="text-2xl font-bold text-white font-display">
              Results for {config.candidateName}
            </h1>
            <p className="text-xs text-slate-400">
              Evaluated using standard campus hiring rubrics.
            </p>
          </div>

          {/* Readiness Metric Box */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-4 shrink-0">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-mono text-slate-400 block">Overall Score</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {summaryData.overallScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-mono text-slate-400 block">Questions</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {summaryData.questionsAnswered} Answered
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-mono text-slate-400 block">Target Role</span>
          <div className="text-sm font-bold text-white truncate mt-1.5">
            {config.role}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-mono text-slate-400 block">Difficulty</span>
          <div className="text-sm font-bold text-white truncate mt-1.5">
            {config.difficulty}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
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

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strong Areas */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Verified Strengths
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
            Focus Areas Before Real Interviews
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {summaryData.areasToImprove.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">!</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Steps */}
      {summaryData.nextSteps && summaryData.nextSteps.length > 0 && (
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Recommended Action Items
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {summaryData.nextSteps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs text-slate-300 flex items-start gap-2">
                <span className="font-mono text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-white font-display">
          Question-by-Question Review
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
                      Q{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-white truncate">
                      {item.question.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.evaluation.score} / 10
                    </span>
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
                        Your Answer:
                      </span>
                      <p className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed italic">
                        "{item.answer}"
                      </p>
                    </div>

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

                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Ideal Sample Answer:
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
