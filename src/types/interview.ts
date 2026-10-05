export type JobRole = 
  | 'Software Developer'
  | 'Data Analyst'
  | 'UI/UX Designer'
  | 'AI/ML Engineer'
  | 'Prompt Engineer';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface InterviewConfig {
  candidateName: string;
  role: JobRole;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  focusArea?: string;
}

export interface QuestionData {
  id: string;
  question: string;
  category: string;
  interviewerNote: string;
  hints: string[];
  expectedKeyPoints: string[];
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sampleAnswer: string;
  feedbackSummary: string;
}

export interface QAHistoryItem {
  questionIndex: number;
  question: QuestionData;
  answer: string;
  evaluation: AnswerEvaluation;
  timeSpentSeconds: number;
}

export interface FinalSummaryData {
  overallScore: number;
  questionsAnswered: number;
  readinessPercentage: number;
  performanceLevel: string;
  strongAreas: string[];
  areasToImprove: string[];
  executiveSummary: string;
  nextSteps: string[];
}

export type AppScreen = 'home' | 'setup' | 'interview' | 'result';
