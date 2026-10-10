import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import { QUESTION_BANK, getQuestionsForConfig, getNextUnusedBankQuestion } from './src/data/questionBank.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI with proper User-Agent header as per skill guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Parse Resume PDF or Text
app.post('/api/resume/parse', async (req, res) => {
  const { fileBase64, fileName = 'resume.pdf', rawText = '' } = req.body;

  try {
    let extractedText = rawText;

    if (fileBase64) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
      await parser.destroy();
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from the provided resume. Please ensure the PDF has readable text or paste your resume content.',
      });
    }

    // Default basic parsed structure
    const fallbackParsed = {
      fileName,
      rawText: extractedText.slice(0, 3000),
      skills: ['Problem Solving', 'Data Structures', 'Communication', 'Version Control (Git)'],
      projects: [
        {
          title: 'Academic / Portfolio Project',
          tech: 'Full Stack / Python',
          description: 'Key technical implementation outlined in resume.',
        },
      ],
      education: 'Undergraduate Degree',
      certifications: [],
      internships: [],
      technologies: ['Git', 'VS Code', 'Command Line'],
    };

    if (!ai) {
      return res.json({
        success: true,
        data: fallbackParsed,
        source: 'local-parser',
      });
    }

    const prompt = `You are an expert technical recruiter analyzing a college student or fresher's resume.
Extract the key facts accurately from the following resume text.
CRITICAL CONSTRAINT: Do NOT hallucinate or invent information that is not present in the text.

Resume Text:
"""
${extractedText.slice(0, 6000)}
"""

Return a pure JSON object with this exact structure:
{
  "candidateName": "Extracted full name or 'Candidate'",
  "skills": ["Array of skills mentioned"],
  "projects": [
    {
      "title": "Project Name",
      "tech": "Technologies used (if mentioned)",
      "description": "Brief 1-sentence summary of what they built"
    }
  ],
  "education": "Degree, major, institution, or graduation year mentioned",
  "certifications": ["Certifications mentioned (if any)"],
  "internships": ["Internship or work experience titles/companies (if any)"],
  "technologies": ["Specific programming languages, frameworks, or databases mentioned"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || '';
    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedJson = JSON.parse(cleaned);
    }

    parsedJson.fileName = fileName;
    parsedJson.rawText = extractedText.slice(0, 3000);

    return res.json({
      success: true,
      data: parsedJson,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process resume.',
    });
  }
});

// Endpoint: Generate Interview Question (Structured Bank + Gemini Resume/Adaptive Grounding)
app.post('/api/interview/generate-question', async (req, res) => {
  const {
    role = 'Software Developer',
    difficulty = 'Beginner',
    candidateName = 'Candidate',
    questionIndex = 1,
    totalQuestions = 10,
    selectedQuestionCount,
    mode = 'mixed',
    focusArea = '',
    previousQAs = [],
    resumeData = null,
  } = req.body;

  const selectedTotal = Number(selectedQuestionCount) || Number(totalQuestions) || 10;
  const isResumeMode = mode === 'resume' && resumeData;

  // Extract all previously asked questions to strictly prevent duplicate questions
  const askedQuestions: string[] = (previousQAs || []).map((item: any) => item.question).filter(Boolean);

  // Retrieve an unasked question from the structured bank
  const fallbackBankQ = getNextUnusedBankQuestion(mode, role, difficulty, askedQuestions);

  if (!ai) {
    return res.json({
      success: true,
      data: {
        id: `q-${questionIndex}`,
        question: fallbackBankQ.question,
        category: fallbackBankQ.category,
        interviewerNote: fallbackBankQ.interviewerNote,
        hints: fallbackBankQ.hints,
        expectedKeyPoints: fallbackBankQ.expectedKeyPoints,
      },
      source: 'structured-question-bank',
    });
  }

  try {
    let modeGuidance = '';
    if (isResumeMode) {
      modeGuidance = `RESUME GROUNDING (CRITICAL):
The candidate uploaded their resume. Base the question directly on their real projects, technologies, or internships listed below:
Skills: ${resumeData.skills?.join(', ') || 'N/A'}
Projects: ${JSON.stringify(resumeData.projects || [])}
Technologies: ${resumeData.technologies?.join(', ') || 'N/A'}
Internships: ${resumeData.internships?.join(', ') || 'None listed'}

Formulate a realistic interview question referencing their exact project or skill.
Example format: "In your resume, you mentioned developing [Project Name] using [Tech]. Can you explain [specific technical decision or challenge]?"
DO NOT invent projects or skills not present in the resume summary!`;
    } else if (mode === 'hr') {
      modeGuidance = 'Focus exclusively on HR and Behavioral questions (background, motivation, teamwork, strengths, college challenges).';
    } else if (mode === 'technical') {
      modeGuidance = `Focus on core Technical, Coding, SQL, Python, or ${role} foundational concepts commonly tested in fresher placement rounds.`;
    } else if (mode === 'project') {
      modeGuidance = 'Focus on deep-dive project questions: architecture, design choices, debugging hurdles, database decisions, and user impact.';
    } else {
      modeGuidance = 'Mixed interview: combine technical fundamentals, practical scenario reasoning, and behavioral communication.';
    }

    const previousContext = previousQAs.length > 0
      ? `Previous questions asked and candidate answers in this session:
${previousQAs.map((item: any, i: number) => `Q${i + 1}: ${item.question}\nAnswer: ${item.answer?.slice(0, 160)}...\nScore: ${item.score}/10`).join('\n\n')}`
      : 'This is the first question in the session.';

    const prompt = `You are a professional, encouraging technical interviewer conducting a mock interview for a college fresher.
Candidate Name: ${candidateName}
Target Role: ${role}
Difficulty Level: ${difficulty}
Interview Mode: ${mode}
Question Progress: Question ${questionIndex} of ${selectedTotal}
Optional Focus Area: ${focusArea || 'Standard fresher placement syllabus'}

${modeGuidance}

${previousContext}

CRITICAL CONSTRAINTS:
1. Do NOT repeat or rephrase any question that was already asked in the previous questions above!
2. Must be a brand-new, distinct question suited for Question ${questionIndex} of ${selectedTotal}.
3. Keep the question crisp, realistic, and conversational as asked in a campus placement interview.

Inspiration Reference from Question Bank:
"${fallbackBankQ.question}" (Category: ${fallbackBankQ.category})

Requirements:
1. Formulate a realistic, clear, conversational interview question suited for a college fresher / entry-level candidate.
2. If this is question 1, start with a welcoming, foundational question.
3. If the candidate previously answered well, adapt appropriately by diving into a practical nuance or trade-off.
4. Include 2 helpful hints to guide the candidate if stuck.
5. Include 3-4 key points a strong candidate answer should touch upon.
6. Include a warm 1-sentence interviewerNote.

Return your response in pure JSON format:
{
  "id": "q-${questionIndex}",
  "question": "The interview question",
  "category": "${fallbackBankQ.category}",
  "interviewerNote": "Warm, encouraging 1-sentence note",
  "hints": ["Hint 1", "Hint 2"],
  "expectedKeyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const text = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (!parsedData || !parsedData.question) {
      throw new Error('Malformed question output');
    }

    // Ensure Gemini did not accidentally duplicate any previously asked questions in this session
    if (askedQuestions.some((asked) => asked.toLowerCase().trim() === parsedData.question.toLowerCase().trim())) {
      parsedData.question = fallbackBankQ.question;
      parsedData.category = fallbackBankQ.category;
      parsedData.interviewerNote = fallbackBankQ.interviewerNote;
      parsedData.hints = fallbackBankQ.hints;
      parsedData.expectedKeyPoints = fallbackBankQ.expectedKeyPoints;
    }

    return res.json({
      success: true,
      data: parsedData,
      source: isResumeMode ? 'resume-grounded-gemini' : 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.warn('Gemini question generation error, falling back to structured bank:', error.message || error);
    return res.json({
      success: true,
      data: {
        id: `q-${questionIndex}`,
        question: fallbackBankQ.question,
        category: fallbackBankQ.category,
        interviewerNote: fallbackBankQ.interviewerNote,
        hints: fallbackBankQ.hints,
        expectedKeyPoints: fallbackBankQ.expectedKeyPoints,
      },
      source: 'structured-question-bank',
    });
  }
});

// Endpoint: Evaluate Answer & Generate Dynamic Follow-Up Question
app.post('/api/interview/evaluate-answer', async (req, res) => {
  const {
    role = 'Software Developer',
    difficulty = 'Beginner',
    candidateName = 'Candidate',
    question = '',
    answer = '',
    questionNumber = 1,
    expectedKeyPoints = [],
    category = 'Technical',
  } = req.body;

  if (!answer || answer.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an answer before submitting for evaluation.',
    });
  }

  // Fallback rubric if offline
  const generateFallbackEvaluation = () => {
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 7.0;
    if (wordCount < 15) score = 4.0;
    else if (wordCount < 35) score = 6.0;
    else if (wordCount > 60) score = 8.0;

    return {
      score,
      technicalScore: Math.min(10, Math.round(score + 0.2)),
      communicationScore: Math.min(10, Math.round(score - 0.2)),
      problemSolvingScore: Math.min(10, Math.round(score)),
      confidenceScore: Math.min(10, Math.round(score + 0.4)),
      strengths: [
        'Addressed the core subject directly with relevant terminology.',
        wordCount > 30 ? 'Provided adequate descriptive context in your explanation.' : 'Identified the main concept accurately.',
      ],
      weaknesses: [
        wordCount < 40 ? 'Response is relatively brief; interviewers expect concrete examples or code patterns.' : 'Could structure the response more strictly using the STAR methodology.',
        'Consider explaining the trade-offs or alternative approaches.',
      ],
      suggestions: [
        'Back up your definition with a concrete project or coursework implementation.',
        'Mention specific metrics, algorithms, or performance considerations.',
      ],
      sampleAnswer: `In an interview context for ${role}, I would articulate this by first providing a precise definition, followed by a concrete project scenario. For example, during a recent project, I implemented this concept to ensure modularity and reliability, which directly prevented edge-case errors under scale.`,
      feedbackSummary: `Good attempt, ${candidateName}! With a bit more structured context and real project mentions, this will be high-scoring in your campus rounds.`,
      followUpQuestion: {
        question: `You mentioned your approach to ${category}; could you walk me through the most challenging edge case you would prepare for in that scenario?`,
        reason: 'Analyzing edge cases demonstrates hands-on practical depth beyond rote memorization.',
      },
    };
  };

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackEvaluation(),
      source: 'offline-rubric',
    });
  }

  try {
    const prompt = `You are a senior hiring manager and tech interviewer conducting a mock interview with a college fresher.
Candidate Name: ${candidateName}
Target Role: ${role}
Difficulty: ${difficulty}
Question Asked: "${question}"
Category: "${category}"
Candidate's Answer: "${answer}"
Expected Key Points: ${JSON.stringify(expectedKeyPoints)}

Evaluate the candidate's answer across the following 6 criteria:
1. Technical correctness (Accuracy of facts, syntax, definitions)
2. Relevance (Directly addressing what was asked without wandering)
3. Clarity (Logical flow, clear definitions)
4. Communication (Professional tone, sentence structure)
5. Confidence (Decisive, clear stance without self-doubt filler)
6. Completeness (Covering the "why" and "how", not just the "what")

CRITICAL REQUIREMENT - DYNAMIC FOLLOW-UP QUESTION:
Analyze what the candidate specifically stated in their answer and formulate a natural, realistic follow-up question.
Do NOT ask a disconnected generic question. Drill down into a specific claim, tool, project, or concept they mentioned!
Example:
If they mentioned "I created a Power BI sales dashboard", follow up with "What was the most challenging part of creating that dashboard?" or "Why did you choose that particular visualization?"

Return pure JSON:
{
  "score": number (0.0 to 10.0),
  "technicalScore": number (0.0 to 10.0),
  "communicationScore": number (0.0 to 10.0),
  "problemSolvingScore": number (0.0 to 10.0),
  "confidenceScore": number (0.0 to 10.0),
  "strengths": ["2-3 specific strengths"],
  "weaknesses": ["1-2 specific areas to strengthen"],
  "suggestions": ["2 actionable tips for real placement interviews"],
  "sampleAnswer": "A concise, high-scoring answer (2-3 paragraphs) a top fresher could say verbally",
  "feedbackSummary": "Warm 1-2 sentence reaction to ${candidateName}",
  "followUpQuestion": {
    "question": "A direct follow-up question digging deeper into what the candidate specifically stated",
    "reason": "Brief 1-sentence explanation of why the interviewer is asking this follow-up",
    "category": "${category}"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (typeof parsedData.score !== 'number') {
      parsedData.score = 7.5;
    }

    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.warn('Gemini evaluation error, using rubric:', error.message || error);
    return res.json({
      success: true,
      data: generateFallbackEvaluation(),
      source: 'fallback-on-error',
    });
  }
});

// Endpoint: Generate Final Comprehensive Interview Report
app.post('/api/interview/final-summary', async (req, res) => {
  const {
    role = 'Software Developer',
    difficulty = 'Beginner',
    candidateName = 'Candidate',
    mode = 'mixed',
    history = [],
  } = req.body;

  const totalQuestions = history.length;
  const avgOverall = totalQuestions > 0
    ? Number((history.reduce((sum: number, item: any) => sum + (Number(item.score) || 0), 0) / totalQuestions).toFixed(1))
    : 7.0;

  const avgTech = totalQuestions > 0
    ? Number((history.reduce((sum: number, item: any) => sum + (Number(item.technicalScore || item.score) || 0), 0) / totalQuestions).toFixed(1))
    : avgOverall;

  const avgComm = totalQuestions > 0
    ? Number((history.reduce((sum: number, item: any) => sum + (Number(item.communicationScore || item.score) || 0), 0) / totalQuestions).toFixed(1))
    : avgOverall;

  const avgProb = totalQuestions > 0
    ? Number((history.reduce((sum: number, item: any) => sum + (Number(item.problemSolvingScore || item.score) || 0), 0) / totalQuestions).toFixed(1))
    : avgOverall;

  const avgConf = totalQuestions > 0
    ? Number((history.reduce((sum: number, item: any) => sum + (Number(item.confidenceScore || item.score) || 0), 0) / totalQuestions).toFixed(1))
    : avgOverall;

  const readinessPercent = Math.min(98, Math.max(35, Math.round((avgOverall / 10) * 100)));

  const generateFallbackSummary = () => ({
    overallScore: avgOverall,
    technicalScore: avgTech,
    communicationScore: avgComm,
    problemSolvingScore: avgProb,
    confidenceScore: avgConf,
    questionsAnswered: totalQuestions,
    readinessPercentage: readinessPercent,
    performanceLevel: avgOverall >= 8.0 ? 'Placement Ready' : avgOverall >= 6.5 ? 'Strong Potential' : 'Needs Practice',
    strongAreas: [
      'Grasp of core principles and technical terminology',
      'Professional articulation and willingness to tackle questions',
      'Ability to engage with follow-up technical prompts',
    ],
    weakAreas: [
      'Could incorporate more quantifiable project impact metrics',
      'Reviewing edge cases under system constraints',
    ],
    recommendedTopics: [
      `${role} Core Architecture & Design Patterns`,
      'Data Structures & Time Complexity Trade-offs',
      'STAR Method Delivery for Behavioral Rounds',
    ],
    personalizedSuggestions: [
      'Practice answering with a timer: 60-90 seconds per conceptual definition.',
      'Always state the practical use case before explaining the internal syntax.',
      'Review the provided model answers for any question where you scored below 7.5.',
    ],
    executiveSummary: `${candidateName} completed the mock interview for ${role} with an overall score of ${avgOverall}/10. You demonstrated a promising foundation in technical concepts. Focusing on structured delivery will place you in the top tier of campus candidates.`,
    nextSteps: [
      'Re-attempt the questions where you scored lowest and incorporate the sample answer structure.',
      'Refine one flagship project on your resume so you can talk about it for 5 continuous minutes.',
    ],
  });

  if (!ai || totalQuestions === 0) {
    return res.json({
      success: true,
      data: generateFallbackSummary(),
      source: 'computed-rubric',
    });
  }

  try {
    const sessionHistory = history.map((item: any, idx: number) => {
      return `Q${idx + 1}: ${item.question}
Answer: ${item.answer}
Score: ${item.score}/10
Strengths: ${item.strengths?.join('; ')}
Weaknesses: ${item.weaknesses?.join('; ')}`;
    }).join('\n\n---\n\n');

    const prompt = `You are a Chief Technology Officer and Head of Campus Recruiting reviewing a fresher candidate's full mock interview transcript.
Candidate Name: ${candidateName}
Target Role: ${role}
Difficulty: ${difficulty}
Interview Mode: ${mode}
Total Questions: ${totalQuestions}
Average Score: ${avgOverall}/10

Session Transcript:
${sessionHistory}

Synthesize a comprehensive final report tailored for a college fresher.
Include:
- Overall Score (${avgOverall}/10)
- Technical Score (0-10)
- Communication Score (0-10)
- Problem Solving Score (0-10)
- Confidence Score (0-10)
- Interview Readiness Percentage (integer 35-98)
- Strong Areas (array of 3-4 specific strengths demonstrated)
- Weak Areas (array of 2-3 specific areas that need sharpening)
- Recommended Topics to Study (array of 3 specific technical topics relevant to ${role})
- Personalized Improvement Suggestions (array of 3 high-impact actionable pieces of advice)
- Executive Summary (2-3 sentences of inspiring, constructive feedback)
- Next Steps (array of 2 concrete actions to take before on-campus interviews)

Return pure JSON with this exact structure:
{
  "overallScore": ${avgOverall},
  "technicalScore": ${avgTech},
  "communicationScore": ${avgComm},
  "problemSolvingScore": ${avgProb},
  "confidenceScore": ${avgConf},
  "questionsAnswered": ${totalQuestions},
  "readinessPercentage": ${readinessPercent},
  "performanceLevel": "Placement Ready" | "Exceptional Candidate" | "Strong Potential" | "Needs Practice",
  "strongAreas": ["string", "string", "string"],
  "weakAreas": ["string", "string"],
  "recommendedTopics": ["string", "string", "string"],
  "personalizedSuggestions": ["string", "string", "string"],
  "executiveSummary": "string",
  "nextSteps": ["string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    parsedData.overallScore = avgOverall;
    parsedData.questionsAnswered = totalQuestions;
    if (!parsedData.readinessPercentage) {
      parsedData.readinessPercentage = readinessPercent;
    }

    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.warn('Final summary generation error:', error.message || error);
    return res.json({
      success: true,
      data: generateFallbackSummary(),
      source: 'fallback-on-error',
    });
  }
});

// Configure Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
