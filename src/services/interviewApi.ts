import {
  AnswerEvaluation,
  DifficultyLevel,
  FinalSummaryData,
  JobRole,
  QAHistoryItem,
  QuestionData
} from '../types/interview';

/**
 * Service to communicate with server-side Gemini API endpoints.
 * Never exposes API keys to browser.
 */
export async function checkServerHealth(): Promise<{ ok: boolean; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { ok: false, hasGeminiKey: false };
    const data = await res.json();
    return { ok: true, hasGeminiKey: Boolean(data.hasGeminiKey) };
  } catch (err) {
    console.warn('Health check failed:', err);
    return { ok: false, hasGeminiKey: false };
  }
}

export async function fetchInterviewQuestion(params: {
  role: JobRole;
  difficulty: DifficultyLevel;
  candidateName: string;
  questionIndex: number;
  totalQuestions: number;
  focusArea?: string;
  previousQAs?: Array<{ question: string; answer: string; score: number }>;
}): Promise<QuestionData> {
  const res = await fetch('/api/interview/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate question: ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to parse generated question');
  }

  return json.data;
}

export async function evaluateCandidateAnswer(params: {
  role: JobRole;
  difficulty: DifficultyLevel;
  candidateName: string;
  question: string;
  answer: string;
  questionNumber: number;
  expectedKeyPoints?: string[];
}): Promise<AnswerEvaluation> {
  const res = await fetch('/api/interview/evaluate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Evaluation failed with status ${res.status}`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Evaluation data missing in response');
  }

  return json.data;
}

export async function generateFinalSummary(params: {
  role: JobRole;
  difficulty: DifficultyLevel;
  candidateName: string;
  history: QAHistoryItem[];
}): Promise<FinalSummaryData> {
  const formattedHistory = params.history.map((item) => ({
    question: item.question.question,
    answer: item.answer,
    score: item.evaluation.score,
    strengths: item.evaluation.strengths,
    weaknesses: item.evaluation.weaknesses,
  }));

  const res = await fetch('/api/interview/final-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: params.role,
      difficulty: params.difficulty,
      candidateName: params.candidateName,
      history: formattedHistory,
    }),
  });

  if (!res.ok) {
    throw new Error(`Summary generation failed with status ${res.status}`);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Summary data missing in response');
  }

  return json.data;
}
