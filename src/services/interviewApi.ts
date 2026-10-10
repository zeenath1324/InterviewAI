import {
  AnswerEvaluation,
  DifficultyLevel,
  FinalSummaryData,
  InterviewConfig,
  InterviewMode,
  JobRole,
  QAHistoryItem,
  QuestionData,
  ResumeData
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

/**
 * Upload and parse resume PDF on the server
 */
export async function uploadAndParseResume(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        // Strip data:application/pdf;base64, prefix
        const base64Content = result.includes(',') ? result.split(',')[1] : result;

        const res = await fetch('/api/resume/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Content,
            fileName: file.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Resume upload failed (${res.status})`);
        }

        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.error || 'Failed to extract resume data.');
        }

        resolve(json.data);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Parse plain text resume
 */
export async function parseResumeText(rawText: string): Promise<ResumeData> {
  const res = await fetch('/api/resume/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText,
      fileName: 'Pasted Resume Text',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to parse resume text.');
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to extract resume details.');
  }

  return json.data;
}

export async function fetchInterviewQuestion(params: {
  role: JobRole;
  difficulty: DifficultyLevel;
  candidateName: string;
  questionIndex: number;
  totalQuestions: number;
  mode?: InterviewMode;
  focusArea?: string;
  previousQAs?: Array<{ question: string; answer: string; score: number }>;
  resumeData?: ResumeData;
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
    throw new Error(json.error || 'Failed to parse question');
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
  category?: string;
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
    throw new Error(json.error || 'Evaluation data missing');
  }

  return json.data;
}

export async function generateFinalSummary(params: {
  role: JobRole;
  difficulty: DifficultyLevel;
  candidateName: string;
  mode?: InterviewMode;
  history: QAHistoryItem[];
}): Promise<FinalSummaryData> {
  const formattedHistory = params.history.map((item) => ({
    question: item.question.question,
    answer: item.answer,
    score: item.evaluation.score,
    technicalScore: item.evaluation.technicalScore,
    communicationScore: item.evaluation.communicationScore,
    problemSolvingScore: item.evaluation.problemSolvingScore,
    confidenceScore: item.evaluation.confidenceScore,
    strengths: item.evaluation.strengths,
    weaknesses: item.evaluation.weaknesses,
    isFollowUp: item.isFollowUp,
  }));

  const res = await fetch('/api/interview/final-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: params.role,
      difficulty: params.difficulty,
      candidateName: params.candidateName,
      mode: params.mode,
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
