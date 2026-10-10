import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, BookOpen, Layers, Target, ShieldCheck } from 'lucide-react';

export const PromptEngineeringSection: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const promptPatterns = [
    {
      id: 'role-prompting',
      title: '1. Role & Persona Prompting',
      description: 'Establishes a domain-specific persona (Senior Tech Interviewer & Hiring Manager) to ensure the tone is professional, encouraging, and technically rigorous.',
      code: `You are a Senior Engineering Hiring Manager and Technical Recruiter.
Conducting a technical interview for an entry-level fresher.
Tone: Supportive, professional, and intellectually rigorous.
Guidance: Ask questions that test foundational concepts and trade-offs rather than rote memorization.`,
    },
    {
      id: 'structured-prompting',
      title: '2. Structured JSON Output Prompting',
      description: 'Constrains Gemini to emit deterministic, strictly valid JSON schemas with typed score metrics, strengths, weaknesses, and model answers.',
      code: `Return your response in pure JSON format with this exact schema:
{
  "score": number (0.0 to 10.0),
  "technicalScore": number (0.0 to 10.0),
  "communicationScore": number (0.0 to 10.0),
  "strengths": ["string", "string"],
  "weaknesses": ["string"],
  "suggestions": ["string", "string"],
  "sampleAnswer": "string"
}`,
    },
    {
      id: 'evaluation-prompting',
      title: '3. Multi-Criteria Rubric Evaluation',
      description: 'Instructs the LLM to grade the candidate across 6 distinct dimensions: technical correctness, relevance, clarity, communication, confidence, and completeness.',
      code: `Evaluate the candidate's answer across the following 6 criteria:
1. Technical correctness (Accuracy of facts, definitions, syntax)
2. Relevance (Directly addressing what was asked without wandering)
3. Clarity (Logical flow, clear definitions)
4. Communication (Professional tone, sentence structure)
5. Confidence (Decisive, clear stance without self-doubt filler)
6. Completeness (Covering the "why" and "how", not just the "what")`,
    },
    {
      id: 'follow-up-prompting',
      title: '4. Dynamic Follow-Up Question Generation',
      description: 'Directs the model to inspect what the candidate specifically stated in their answer and formulate a natural drill-down question.',
      code: `Analyze what the candidate specifically stated in their answer.
Formulate a natural, realistic follow-up question that drills into a specific claim, tool, or concept they mentioned.
Example: If they mentioned "I created a Power BI sales dashboard", follow up with:
"What was the most challenging part of creating that sales dashboard?" or "Why did you choose that particular visualization?"`,
    },
    {
      id: 'resume-prompting',
      title: '5. Resume-Grounded Extraction & Questioning',
      description: 'Grounds the questions in real extracted resume projects and technologies while strictly prohibiting hallucination of unmentioned items.',
      code: `CRITICAL CONSTRAINT: Do NOT hallucinate or invent information that is not present in the text.
Use the extracted projects and technologies from the candidate's uploaded resume to formulate customized questions.
Example: "In your resume, you mentioned developing [Project] using [Tech]. Can you explain how you designed [Feature]?"`,
    },
    {
      id: 'few-shot-prompting',
      title: '6. Few-Shot In-Context Scoring',
      description: 'Provides calibrated examples of low, medium, and high-scoring answers to calibrate the model’s scoring objectivity.',
      code: `Calibration Anchors:
- Score 3.0: "A process is a program running." (Too brief, lacks memory/thread context)
- Score 7.0: "A process has its own address space, whereas threads share memory within the same process." (Good definition, needs switching context)
- Score 9.5: "A process is an isolated OS execution unit with dedicated memory, while threads are lightweight units sharing the process heap..." (Complete, mentions IPC and failure isolation)`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-left">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>System Architecture & Prompt Engineering</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          How InterviewAI Uses Prompt Engineering
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          InterviewAI avoids random outputs by utilizing production prompt patterns. 
          Here is how role grounding, JSON schema enforcement, multi-rubric evaluation, and dynamic follow-up chaining are engineered.
        </p>
      </div>

      {/* Grid of Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {promptPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-display">
                {pattern.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pattern.description}
              </p>
            </div>

            <div className="relative group">
              <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                {pattern.code}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(pattern.id, pattern.code)}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy prompt pattern"
              >
                {copiedKey === pattern.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Reliability Callout */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security & API Protection Architecture</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          All prompt templates and API credentials are kept strictly server-side inside our Express proxy service (<code className="font-mono text-slate-300">server.ts</code>). The browser never directly touches or exposes the Gemini API key. All candidate inputs are sanitized before being interpolated into evaluation prompts.
        </p>
      </div>
    </div>
  );
};
