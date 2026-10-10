export type JobRole = 
  | 'Software Developer'
  | 'Data Analyst'
  | 'UI/UX Designer'
  | 'AI/ML Engineer'
  | 'Prompt Engineer';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type InterviewMode = 
  | 'mixed'
  | 'technical'
  | 'hr'
  | 'project'
  | 'resume';

export type QuestionCategory = 
  | 'HR'
  | 'Behavioral'
  | 'Technical'
  | 'Coding'
  | 'SQL'
  | 'Python'
  | 'Data Analytics'
  | 'Power BI'
  | 'AI/ML'
  | 'Generative AI'
  | 'Prompt Engineering'
  | 'Project-based questions';

export interface ResumeData {
  fileName?: string;
  rawText?: string;
  candidateName?: string;
  skills: string[];
  projects: Array<{
    title: string;
    tech?: string;
    description?: string;
  }>;
  education?: string;
  certifications?: string[];
  internships?: string[];
  technologies?: string[];
}

export interface InterviewConfig {
  candidateName: string;
  role: JobRole;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  selectedQuestionCount?: number;
  mode: InterviewMode;
  focusArea?: string;
  resumeData?: ResumeData;
  voiceMode?: boolean;
}

export interface QuestionData {
  id: string;
  question: string;
  category: QuestionCategory | string;
  interviewerNote: string;
  hints: string[];
  expectedKeyPoints: string[];
  isFollowUp?: boolean;
  parentQuestion?: string;
  parentAnswerSnippet?: string;
}

export interface AnswerEvaluation {
  score: number; // 0 to 10
  technicalScore?: number; // 0 to 10
  communicationScore?: number; // 0 to 10
  problemSolvingScore?: number; // 0 to 10
  confidenceScore?: number; // 0 to 10
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sampleAnswer: string;
  feedbackSummary: string;
  followUpQuestion?: {
    question: string;
    reason: string;
    category?: QuestionCategory | string;
  };
}

export interface QAHistoryItem {
  questionIndex: number;
  question: QuestionData;
  answer: string;
  evaluation: AnswerEvaluation;
  timeSpentSeconds: number;
  isFollowUp?: boolean;
  skipped?: boolean;
}

export interface FinalSummaryData {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  questionsAnswered: number;
  readinessPercentage: number;
  performanceLevel: string;
  strongAreas: string[];
  weakAreas: string[];
  recommendedTopics: string[];
  personalizedSuggestions: string[];
  executiveSummary: string;
  nextSteps: string[];
}

export type AppScreen = 'home' | 'setup' | 'interview' | 'result' | 'prompts';
