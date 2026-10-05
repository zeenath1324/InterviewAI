import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

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

// Fallback question database for robust offline/resilient experience
const FALLBACK_QUESTIONS: Record<string, Record<string, Array<{ question: string; category: string; interviewerNote: string; expectedKeyPoints: string[] }>>> = {
  'Software Developer': {
    Beginner: [
      {
        question: "Can you explain the difference between synchronous and asynchronous programming in JavaScript or your language of choice, and describe a real-world scenario where you would use asynchronous handling?",
        category: "Core Principles",
        interviewerNote: "Take a moment to give a concrete everyday example like fetching data from an API or reading a file.",
        expectedKeyPoints: ["Blocking vs non-blocking execution", "Event loop / Call stack / Callback queue", "Promises / async/await", "Real-world API network request example"]
      },
      {
        question: "What is the difference between SQL and NoSQL databases, and how would you decide which one to use for a new university project?",
        category: "System & Data Modeling",
        interviewerNote: "Think about schema flexibility versus relational integrity and ACID guarantees.",
        expectedKeyPoints: ["Structured tabular schemas vs flexible JSON document stores", "ACID transactions vs horizontal scalability", "JOIN queries vs embedded documents", "Project requirements rationale"]
      },
      {
        question: "How do Git branches work, and what is your typical workflow when resolving a merge conflict with a teammate?",
        category: "Version Control & Collaboration",
        interviewerNote: "Walk me through the Git commands and the mindset you adopt when code conflicts arise.",
        expectedKeyPoints: ["Branch pointers in Git", "Creating feature branches (git checkout -b / switch)", "Conflict markers (<<<<<<<, =======, >>>>>>>)", "Communicating with teammates before committing resolution"]
      },
      {
        question: "Explain the concept of Object-Oriented Programming (OOP) principles — encapsulation, inheritance, polymorphism, and abstraction — with a simple practical example.",
        category: "Software Design",
        interviewerNote: "Using a single theme (like an Animal or Vehicle class) can make your explanation very cohesive.",
        expectedKeyPoints: ["Encapsulation: hiding internal state with getters/setters", "Inheritance: code reuse through parent/child classes", "Polymorphism: method overriding or interfaces", "Abstraction: exposing only relevant interfaces"]
      },
      {
        question: "What happens in the browser from the moment you type a URL (like google.com) and press Enter until the web page is fully rendered on your screen?",
        category: "Web Architecture",
        interviewerNote: "Structure your explanation into network steps, server response, and browser rendering pipeline.",
        expectedKeyPoints: ["DNS lookup to resolve IP address", "TCP 3-way handshake & TLS negotiation", "HTTP GET request & server response", "DOM tree, CSSOM tree, Render tree, layout & painting"]
      }
    ],
    Intermediate: [
      {
        question: "How do you detect and fix memory leaks or performance bottlenecks in a web application?",
        category: "Performance & Profiling",
        interviewerNote: "Focus on browser dev tools, heap snapshots, and common causes like orphaned event listeners.",
        expectedKeyPoints: ["Browser performance tabs & heap snapshots", "Detached DOM elements & uncleared intervals", "Virtualization for long lists", "Memoization and avoiding unnecessary re-renders"]
      },
      {
        question: "Describe how RESTful API design principles differ from GraphQL or WebSockets, and in what architectural circumstances you would choose each.",
        category: "API Architecture",
        interviewerNote: "Discuss over-fetching/under-fetching, real-time bidirectional messaging, and caching.",
        expectedKeyPoints: ["REST: HTTP verbs, statelessness, URL resource-based", "GraphQL: Single endpoint, client-driven queries, avoiding over-fetching", "WebSockets: Persistent full-duplex TCP connection for real-time updates", "Trade-offs in caching, complexity, and tooling"]
      },
      {
        question: "How would you design a scalable rate limiter to prevent API abuse on a public service endpoint?",
        category: "System Design",
        interviewerNote: "Discuss algorithms like Token Bucket or Leaky Bucket, and where state is stored.",
        expectedKeyPoints: ["Token bucket / sliding window log algorithm", "Redis for distributed counter and fast in-memory TTL expiration", "HTTP 429 Too Many Requests response with Retry-After header", "IP-based vs user token-based identification"]
      },
      {
        question: "Explain how database indexing works internally (B-trees) and what trade-offs you make when adding indexes to a frequently updated table.",
        category: "Database Engineering",
        interviewerNote: "Cover query lookup speed versus write/insert overhead.",
        expectedKeyPoints: ["B-Tree / B+Tree structure and logarithmic search time", "Faster SELECT WHERE queries", "Write penalty: INSERT, UPDATE, and DELETE require tree rebalancing", "Index memory footprint and index selectivity"]
      }
    ],
    Advanced: [
      {
        question: "How would you architect a distributed caching layer (using Redis/Memcached) while mitigating Cache Stampede, Cache Penetration, and Cache Avalanche?",
        category: "Distributed Systems",
        interviewerNote: "Explain the difference between these three failure modes and concrete mitigation techniques.",
        expectedKeyPoints: ["Cache Stampede: Mutex locks, probabilistic early expiration (XFetch)", "Cache Penetration: Bloom filters, caching null values with short TTL", "Cache Avalanche: Randomizing TTL jitter, multi-level fallback caching", "Cache-aside vs write-through patterns"]
      },
      {
        question: "Walk through designing an event-driven architecture using message queues (e.g., Kafka or RabbitMQ) ensuring idempotency and at-least-once delivery guarantees.",
        category: "Event Architecture",
        interviewerNote: "Highlight outbox pattern, deduplication keys, and dead-letter queues.",
        expectedKeyPoints: ["Transactional Outbox pattern", "Idempotency keys and unique constraint deduplication", "Consumer acknowledgements & offset management", "Dead letter queues for failed poison pill messages"]
      }
    ]
  },
  'Data Analyst': {
    Beginner: [
      {
        question: "What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in SQL? Provide an example query scenario.",
        category: "SQL Fundamentals",
        interviewerNote: "Visualizing two overlapping sets or using Customers and Orders tables is a great way to answer.",
        expectedKeyPoints: ["INNER JOIN: only matching rows from both tables", "LEFT JOIN: all rows from left plus matching right rows", "RIGHT JOIN / FULL OUTER JOIN definitions", "Handling NULL values in non-matched columns"]
      },
      {
        question: "How do you handle missing or duplicate values when cleaning a raw dataset in Python (Pandas) or Excel before starting your exploratory data analysis?",
        category: "Data Wrangling",
        interviewerNote: "Explain your thought process on deciding whether to drop, impute with mean/median, or flag missing values.",
        expectedKeyPoints: ["Identifying missingness mechanism (MCAR, MAR, MNAR)", "Imputation (mean, median, mode, forward fill) vs dropping rows/columns", "Identifying duplicates (drop_duplicates())", "Documenting data cleaning transformations"]
      },
      {
        question: "Explain the difference between Mean, Median, and Mode. Which measure of central tendency would you use to describe salaries at a tech company, and why?",
        category: "Statistics & Insights",
        interviewerNote: "Think about right-skewed distributions and the impact of extreme outliers like executive compensation.",
        expectedKeyPoints: ["Definitions of Mean, Median, Mode", "Sensitivity of Mean to extreme outliers", "Skewed salary distribution and why Median is the standard representative metric", "Interquartile range and percentiles"]
      },
      {
        question: "What is a Cohort Analysis, and how would you use it to evaluate user retention for a subscription-based mobile application?",
        category: "Business Analytics",
        interviewerNote: "Explain how grouping users by signup month or acquisition date reveals behavioral trends over time.",
        expectedKeyPoints: ["Grouping users by common event timeframe (e.g. signup week/month)", "Tracking metrics (retention rate, churn) across subsequent time periods", "Heatmap / retention curve visualization", "Actionable product insights from retention drop-offs"]
      }
    ],
    Intermediate: [
      {
        question: "Explain SQL Window Functions (like ROW_NUMBER, RANK, DENSE_RANK, and LAG/LEAD). When would you choose DENSE_RANK over RANK?",
        category: "Advanced SQL",
        interviewerNote: "Provide a scenario like finding the top 3 highest-spending customers per region.",
        expectedKeyPoints: ["OVER (PARTITION BY ... ORDER BY ...)", "Difference in tie handling: RANK skips numbers, DENSE_RANK does not skip", "LAG/LEAD for month-over-month comparisons without self-joins", "Practical top-N per category query structure"]
      },
      {
        question: "How do you design a high-impact dashboard in Tableau or Power BI that prevents information overload and leads directly to business decisions?",
        category: "Data Visualization",
        interviewerNote: "Talk about visual hierarchy, user personas, KPI cards, and progressive drill-downs.",
        expectedKeyPoints: ["Understanding the stakeholder's primary business question", "Visual hierarchy: summary KPI cards at top, trend charts in middle, drill-down tables at bottom", "Color restraint (use color to highlight action items, not decoration)", "Interactive filters and intuitive tooltip context"]
      }
    ],
    Advanced: [
      {
        question: "How would you design and analyze an A/B test for a major e-commerce checkout redesign? Walk through hypothesis formulation, sample size calculation, p-values, and statistical power.",
        category: "Experimentation & Statistical Inference",
        interviewerNote: "Address Type I and Type II errors, minimum detectable effect (MDE), and guardrail metrics.",
        expectedKeyPoints: ["Null and alternative hypotheses definition", "Sample size power analysis (alpha=0.05, beta=0.80, MDE)", "P-value interpretation and confidence intervals", "Guardrail metrics (e.g., page load latency, support ticket volume)"]
      }
    ]
  },
  'UI/UX Designer': {
    Beginner: [
      {
        question: "What is the difference between UI (User Interface) and UX (User Experience)? Can you walk through your design process from problem discovery to final mockups?",
        category: "Design Process",
        interviewerNote: "Feel free to structure your answer around the Double Diamond or Design Thinking framework.",
        expectedKeyPoints: ["UI: Visual aesthetics, typography, colors, component design", "UX: User journey, information architecture, usability, problem-solving", "Stages: Empathize/Research, Define, Ideate, Prototype, Test", "User feedback and iterative refinement"]
      },
      {
        question: "Explain how you establish visual hierarchy on a mobile screen. What design elements guide a user's attention first?",
        category: "Visual Design",
        interviewerNote: "Mention scale, typographic contrast, color prominence, spacing, and reading patterns like F or Z patterns.",
        expectedKeyPoints: ["Typography scale and weight contrast", "Color accents reserved for primary CTAs", "Whitespace and spatial grouping (Law of Proximity)", "Visual reading patterns (F-pattern, Z-pattern, Gutenberg diagram)"]
      },
      {
        question: "What are WCAG accessibility guidelines, and how do you ensure your color choices, button targets, and typography are accessible to all users?",
        category: "Accessibility & Inclusivity",
        interviewerNote: "Refer to minimum contrast ratios (4.5:1), touch target sizes (at least 44x44px), and screen-reader considerations.",
        expectedKeyPoints: ["WCAG AA compliance standards", "Color contrast ratios (4.5:1 for normal text, 3:1 for large text)", "Touch target dimensions (44x44px minimum for mobile)", "Not relying on color alone for state indication (pairing with icons/text)"]
      },
      {
        question: "How do you conduct a usability test on a new prototype with real users, and how do you handle negative feedback on a design you worked hard on?",
        category: "User Research & Usability",
        interviewerNote: "Highlight neutrality as a facilitator, observing user friction without leading them, and seeing feedback as data.",
        expectedKeyPoints: ["Preparing unbiased task scenarios (e.g. 'Book a ticket' without saying which button to click)", "Encouraging think-aloud protocol", "Separating personal ego from user feedback", "Synthesizing friction points into prioritized design iterations"]
      }
    ],
    Intermediate: [
      {
        question: "How do you build and maintain a scalable Design System in Figma? Explain components, variants, design tokens, and developer handoff.",
        category: "Design Systems",
        interviewerNote: "Discuss consistency across product teams, naming conventions, and syncing with Tailwind or code tokens.",
        expectedKeyPoints: ["Atomic design methodology (atoms, molecules, organisms)", "Figma component variants and auto-layout auto-resizing", "Design tokens for colors, spacing, and elevation", "Collaborative developer specs and inspect mode documentation"]
      },
      {
        question: "Describe a time when business goals conflicted with user user experience desires (e.g., aggressive popups vs clean flow), and how you resolved or negotiated the trade-off.",
        category: "Product Strategy & Negotiation",
        interviewerNote: "Focus on empathy for both business conversion and user trust.",
        expectedKeyPoints: ["Understanding the underlying business metric (e.g., email capture or subscription conversion)", "Identifying user pain points (e.g., immediate intrusive modal causing bounce)", "Proposing balanced alternatives (e.g., contextual inline opt-in or delayed exit intent)", "Validating resolution with quantitative A/B testing"]
      }
    ],
    Advanced: [
      {
        question: "How do you design for complex enterprise workflows with high data density while minimizing cognitive load and error rates?",
        category: "Complex Enterprise UX",
        interviewerNote: "Think about batch operations, keyboard shortcuts, undo states, and progressive disclosure.",
        expectedKeyPoints: ["Progressive disclosure: surfacing essentials while keeping advanced parameters 1 click away", "Forgiving UI: optimistic UI, clear undo toasts instead of modal blockers", "Keyboard navigation and bulk batch actions", "Information architecture optimized for expert power users"]
      }
    ]
  },
  'AI/ML Engineer': {
    Beginner: [
      {
        question: "Explain the difference between Supervised Learning, Unsupervised Learning, and Reinforcement Learning, giving one clear real-world example for each.",
        category: "ML Fundamentals",
        interviewerNote: "Structure each with input data type, training signal, and target output.",
        expectedKeyPoints: ["Supervised: labeled data (e.g., house price prediction, email spam classification)", "Unsupervised: unlabeled data finding hidden patterns (e.g., customer segmentation via k-means)", "Reinforcement: agent learning optimal policy via rewards/penalties (e.g., game playing, robotics)", "Loss functions and optimization feedback"]
      },
      {
        question: "What is the Overfitting problem in machine learning? How do you diagnose it using train/validation loss curves, and what techniques prevent it?",
        category: "Model Generalization",
        interviewerNote: "Discuss the bias-variance trade-off, regularization, and data augmentation.",
        expectedKeyPoints: ["Overfitting: high training accuracy but poor validation/test generalization", "Diverging loss curves (training loss drops while validation loss climbs)", "Regularization (L1 Lasso, L2 Ridge, Dropout)", "Data augmentation, cross-validation, and early stopping"]
      },
      {
        question: "Why is Precision and Recall often more informative than Accuracy when evaluating classification models on imbalanced datasets (e.g., rare fraud detection)?",
        category: "Evaluation Metrics",
        interviewerNote: "Consider a dataset where 99.9% of transactions are legitimate.",
        expectedKeyPoints: ["Accuracy paradox: a naive model predicting all negatives achieves 99.9% accuracy but catches zero fraud", "Precision: TP / (TP + FP) — proportion of positive identifications that are correct", "Recall: TP / (TP + FN) — proportion of actual positives detected", "F1-Score and PR-AUC trade-offs"]
      },
      {
        question: "Explain how Gradient Descent works to minimize a loss function. What is the role of the learning rate, and what happens if it is set too high or too low?",
        category: "Optimization",
        interviewerNote: "Use the analogy of finding the lowest point in a hilly valley in dense fog.",
        expectedKeyPoints: ["Iterative optimization moving in direction of steepest descent (negative gradient)", "Learning rate (eta) controlling step size", "Too high: overshooting minimum or diverging", "Too low: extremely slow convergence or getting stuck in local plateaus/saddle points"]
      }
    ],
    Intermediate: [
      {
        question: "Explain the Transformer architecture and the Self-Attention mechanism. Why did Transformers replace RNNs and LSTMs for natural language processing?",
        category: "Deep Learning & NLP",
        interviewerNote: "Contrast sequential processing with parallel attention across all token pairs.",
        expectedKeyPoints: ["Query, Key, Value vectors and scaled dot-product attention softmax(QK^T / sqrt(d_k))V", "Parallel computation across sequence tokens compared to sequential O(n) RNN steps", "Mitigating vanishing gradients over long context distances", "Multi-head attention capturing multiple representation subspaces"]
      },
      {
        question: "What is Retrieval-Augmented Generation (RAG)? Walk through the pipeline from chunking documents, embedding generation, vector database search, to LLM synthesis.",
        category: "Generative AI Systems",
        interviewerNote: "Explain how RAG grounds language models and prevents hallucinations without fine-tuning weights.",
        expectedKeyPoints: ["Document ingestion, parsing, and semantic text chunking with overlap", "Vector embedding generation (e.g., text-embedding-004)", "Similarity search in vector DB (cosine similarity, HNSW index)", "Injecting retrieved context into prompt with system instructions to synthesize factual answers"]
      }
    ],
    Advanced: [
      {
        question: "How do you evaluate and monitor Large Language Models in production against hallucination, prompt injection, and latency degradation? What is your LLM-as-a-Judge strategy?",
        category: "LLM Operations & Safety",
        interviewerNote: "Address semantic drift, guardrails, automated evaluation benchmarks, and cost-latency trade-offs.",
        expectedKeyPoints: ["Grounding and faithfulness evaluation metrics (RAGAS framework)", "Input sanitization and guardrail filters against adversarial jailbreaks", "LLM-as-a-judge rubrics with pairwise ranking and reference comparisons", "P95/P99 latency tracking, token caching, and fallback cascading"]
      }
    ]
  },
  'Prompt Engineer': {
    Beginner: [
      {
        question: "What is Prompt Engineering? Explain the core components of an effective prompt (Role, Task, Context, Constraints, and Output Format).",
        category: "Prompt Fundamentals",
        interviewerNote: "Provide an example illustrating a vague prompt transformed into a high-performance structured prompt.",
        expectedKeyPoints: ["Role/Persona definition ('Act as an experienced tech interviewer')", "Clear task instruction without ambiguity", "Background context and target audience", "Explicit constraints (length, tone, things to avoid)", "Structured output format (JSON schema, markdown table, bullet points)"]
      },
      {
        question: "What is Few-Shot Prompting, and how does providing 2-3 input-output examples improve model accuracy compared to Zero-Shot instructions?",
        category: "In-Context Learning",
        interviewerNote: "Discuss how examples anchor the model's tone, format expectations, and edge-case handling.",
        expectedKeyPoints: ["Zero-shot: asking without demonstrations vs Few-shot: including demonstration pairs", "In-context learning without updating model parameters", "Demonstrating subtle formatting, edge-case behavior, and reasoning patterns", "Preventing output drift and parsing errors in automated pipelines"]
      },
      {
        question: "Explain Chain-of-Thought (CoT) prompting. When is it necessary, and why does telling the model to 'think step by step' reduce reasoning errors?",
        category: "Reasoning Techniques",
        interviewerNote: "Explain how intermediate reasoning tokens allow the model to compute intermediate states before jumping to the final answer.",
        expectedKeyPoints: ["Encouraging explicit intermediate reasoning steps before arriving at a final answer", "Autoregressive generation benefit: model attends to its own prior reasoning tokens", "Significantly improves performance on multi-step math, logic, and coding problems", "Least-to-most prompting and self-consistency voting variations"]
      },
      {
        question: "What is AI hallucination, why does it happen in generative language models, and what prompt techniques help suppress it?",
        category: "Reliability & Safety",
        interviewerNote: "Talk about grounding, temperature parameter tuning, and providing explicit fallback instructions.",
        expectedKeyPoints: ["Probabilistic next-token prediction without internal truth verification", "Prompting with explicit grounding in verified source text", "Instructing model: 'If the information is not in the text, state that you do not know'", "Lowering temperature parameter (e.g. 0.0 to 0.2) for deterministic factual tasks"]
      }
    ],
    Intermediate: [
      {
        question: "How do you protect production LLM applications against Direct and Indirect Prompt Injection attacks (e.g., malicious user input attempting to override system instructions)?",
        category: "Security & Guardrails",
        interviewerNote: "Distinguish between direct user jailbreaks and indirect payloads hidden inside parsed web pages or emails.",
        expectedKeyPoints: ["Direct injection: user jailbreaks trying to ignore system rules", "Indirect injection: untrusted 3rd party content containing hidden commands", "Clear delimiters (e.g. XML tags <user_input>) separating instructions from untrusted data", "Secondary validation LLM or deterministic regex/classifier guardrail filters"]
      },
      {
        question: "How do you design a systematic prompt evaluation framework (evals) to measure whether a prompt update actually improved performance across 100 test cases?",
        category: "Prompt Evaluation & Testing",
        interviewerNote: "Cover gold datasets, automated assertion checks, and regression prevention.",
        expectedKeyPoints: ["Curating a representative test dataset including edge cases and adversarial inputs", "Automated deterministic assertions (JSON validity, regex, keyword presence)", "Model-based evaluation (LLM-as-a-judge scoring with strict rubrics)", "Tracking pass rates and preventing regressions before deploying to production"]
      }
    ],
    Advanced: [
      {
        question: "How do you design an autonomous multi-step agent prompt using the ReAct (Reason + Act) framework with function calling and error recovery loops?",
        category: "Agent Architecture",
        interviewerNote: "Detail the loop of Thought -> Action -> Observation -> Final Answer, and handling tool timeouts.",
        expectedKeyPoints: ["ReAct loop: Thought (reasoning), Action (tool selection), Observation (tool execution output)", "Function/Tool declarations with typed schemas", "Handling tool failure, malformed JSON, and infinite loop limits with max-iteration guards", "Memory management across multi-turn tool interaction histories"]
      }
    ]
  }
};

// Helper: Pick fallback question
function getFallbackQuestion(role: string, difficulty: string, questionIndex: number) {
  const roleGroup = FALLBACK_QUESTIONS[role] || FALLBACK_QUESTIONS['Software Developer'];
  const difficultyGroup = roleGroup[difficulty] || roleGroup['Beginner'];
  const idx = (questionIndex - 1) % difficultyGroup.length;
  const q = difficultyGroup[idx] || difficultyGroup[0];
  return {
    id: `q-${questionIndex}`,
    question: q.question,
    category: q.category,
    interviewerNote: q.interviewerNote,
    expectedKeyPoints: q.expectedKeyPoints,
    hints: [
      `Structure your response clearly and share a real project or theoretical example.`,
      `Focus on key terminology related to ${role}.`
    ]
  };
}

// Endpoint: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Generate Interview Question
app.post('/api/interview/generate-question', async (req, res) => {
  const {
    role = 'Software Developer',
    difficulty = 'Beginner',
    candidateName = 'Candidate',
    questionIndex = 1,
    totalQuestions = 5,
    focusArea = '',
    previousQAs = []
  } = req.body;

  // If Gemini is not configured, gracefully return high quality fallback
  if (!ai) {
    const fallback = getFallbackQuestion(role, difficulty, questionIndex);
    return res.json({
      success: true,
      data: fallback,
      source: 'offline-curated'
    });
  }

  try {
    const previousContext = Array.isArray(previousQAs) && previousQAs.length > 0
      ? `Previous questions and candidate answers in this session:
${previousQAs.map((item: any, i: number) => `Q${i+1}: ${item.question}\nAnswer summary: ${item.answer?.slice(0, 150)}...\nScore received: ${item.score}/10`).join('\n\n')}`
      : 'This is the first question in the session.';

    const prompt = `You are a world-class senior technical interviewer and hiring manager conducting a mock interview for freshers and college graduates.
Candidate Name: ${candidateName}
Target Job Role: ${role}
Interview Difficulty Level: ${difficulty}
Question Progress: Question ${questionIndex} of ${totalQuestions}
Optional Focus Area: ${focusArea ? focusArea : 'Standard core curriculum'}

${previousContext}

Generate the NEXT relevant interview question for ${candidateName}.
Requirements:
1. The question must strictly align with the role of "${role}" at "${difficulty}" level suitable for freshers.
2. If this is question 1, start with a foundational, confidence-building question.
3. If previous questions exist, adapt appropriately: dive deeper if the candidate performed well, or provide a foundational pivot if they struggled.
4. Keep the question crisp, practical, and conversational as spoken by an empathetic professional interviewer.
5. Provide 2 concise hints the candidate can reveal if they get stuck.
6. Provide 3-4 key points a strong answer should touch upon.
7. Provide a warm, encouraging 1-sentence interviewerNote.

Return your response in pure JSON format with this exact structure:
{
  "id": "q-${questionIndex}",
  "question": "string",
  "category": "string (e.g. Core Concepts, Architecture, Scenario, Problem Solving, Best Practices)",
  "interviewerNote": "string",
  "hints": ["string", "string"],
  "expectedKeyPoints": ["string", "string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const text = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      // Remove possible markdown formatting
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (!parsedData || !parsedData.question) {
      throw new Error('Invalid JSON structure from model');
    }

    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.warn('Gemini question generation error, falling back to curated bank:', error.message || error);
    const fallback = getFallbackQuestion(role, difficulty, questionIndex);
    return res.json({
      success: true,
      data: fallback,
      source: 'fallback-on-error',
      message: 'Generated using curated industry standards'
    });
  }
});

// Endpoint: Evaluate Answer
app.post('/api/interview/evaluate-answer', async (req, res) => {
  const {
    role = 'Software Developer',
    difficulty = 'Beginner',
    candidateName = 'Candidate',
    question = '',
    answer = '',
    questionNumber = 1,
    expectedKeyPoints = []
  } = req.body;

  if (!answer || answer.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an answer before submitting for evaluation.'
    });
  }

  // Fallback evaluation generator if offline or error
  const generateFallbackEvaluation = () => {
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 6.0;
    if (wordCount < 15) score = 3.5;
    else if (wordCount < 35) score = 5.5;
    else if (wordCount < 80) score = 7.5;
    else score = 8.5;

    return {
      score,
      strengths: [
        "Addressed the core topic directly with a positive, proactive attempt.",
        wordCount > 30 ? "Included adequate descriptive context in your explanation." : "Showed basic awareness of the essential concept."
      ],
      weaknesses: [
        wordCount < 40 ? "Answer is quite brief; interviewers expect deeper technical context or concrete examples." : "Could further structure thoughts using the STAR method (Situation, Task, Action, Result).",
        "Could explicitly name standard industry tools, libraries, or architectural trade-offs."
      ],
      suggestions: [
        "Elaborate on real-world examples from college projects, coursework, or internships.",
        "Quantify your results or explain edge-cases to stand out from average applicants."
      ],
      sampleAnswer: `When approaching this in a ${role} position, I prioritize both conceptual clarity and practical reliability. For example, during a recent project, I had to address this exact challenge by analyzing the requirements, designing a clean solution, and testing edge cases. Specifically, I ensured clear separation of concerns, applied industry best practices, and verified performance under load. This resulted in a maintainable, high-quality implementation.`,
      feedbackSummary: `Solid attempt, ${candidateName}! With a bit more technical structure and real project examples, your answer will be interview-ready.`
    };
  };

  if (!ai) {
    return res.json({
      success: true,
      data: generateFallbackEvaluation(),
      source: 'offline-rubric'
    });
  }

  try {
    const prompt = `You are a supportive, insightful senior technical interviewer evaluating a fresher's mock interview answer.
Candidate Name: ${candidateName}
Target Job Role: ${role}
Difficulty Level: ${difficulty}
Question Number: ${questionNumber}
Question Asked: "${question}"
Candidate's Answer: "${answer}"
Expected Key Points (if available): ${JSON.stringify(expectedKeyPoints)}

Evaluate this candidate's response thoroughly with empathy for freshers/college graduates while maintaining industry standards.
Requirements:
1. "score": A decimal number between 0.0 and 10.0 (e.g. 7.5).
   - 0.0-3.5: Empty, irrelevant, or severely incorrect.
   - 4.0-6.0: High-level or brief, misses key technical depth.
   - 6.5-8.0: Good, solid foundational understanding with clear explanation.
   - 8.5-10.0: Outstanding, structured (e.g., STAR format), accurate, includes examples and trade-offs.
2. "strengths": Array of 2 to 3 specific positive highlights from the candidate's answer.
3. "weaknesses": Array of 1 to 2 constructive gaps or missed nuances.
4. "suggestions": Array of 2 to 3 actionable, high-impact improvements (e.g., how to explain it better in a real interview, what keywords to use).
5. "sampleAnswer": A high-scoring, realistic sample answer (2-3 concise paragraphs) that a top college fresher could deliver verbally in an actual interview.
6. "feedbackSummary": A warm 1-2 sentence overall reaction directly addressing ${candidateName}.

Return your response in pure JSON format with this exact structure:
{
  "score": 8.0,
  "strengths": ["string", "string"],
  "weaknesses": ["string"],
  "suggestions": ["string", "string"],
  "sampleAnswer": "string",
  "feedbackSummary": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      }
    });

    const text = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (typeof parsedData.score !== 'number') {
      parsedData.score = 7.0;
    }

    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.warn('Gemini evaluation error, falling back to rubric:', error.message || error);
    return res.json({
      success: true,
      data: generateFallbackEvaluation(),
      source: 'fallback-on-error'
    });
  }
});

// Endpoint: Generate Final Results and Readiness Report
app.post('/api/interview/final-summary', async (req, res) => {
  const {
    role = 'Software Developer',
    difficulty = 'Beginner',
    candidateName = 'Candidate',
    history = []
  } = req.body;

  const totalQuestions = history.length;
  const avgScore = totalQuestions > 0
    ? Number((history.reduce((sum: number, item: any) => sum + (Number(item.score) || 0), 0) / totalQuestions).toFixed(1))
    : 7.0;

  // Calculate readiness percentage based on average score with scaling
  // E.g., score 8.0 -> ~82% readiness
  const baseReadiness = Math.min(98, Math.max(35, Math.round((avgScore / 10) * 100)));

  const generateFallbackSummary = () => {
    let performanceLevel = "Placement Ready";
    if (avgScore < 5.0) performanceLevel = "Needs Guided Practice";
    else if (avgScore < 7.0) performanceLevel = "Promising Foundation";
    else if (avgScore >= 8.5) performanceLevel = "Exceptional Candidate";

    return {
      overallScore: avgScore,
      questionsAnswered: totalQuestions,
      readinessPercentage: baseReadiness,
      performanceLevel,
      strongAreas: [
        "Core conceptual understanding of fundamental principles",
        "Willingness to articulate solutions and tackle technical questions",
        "Professional and structured communication style"
      ],
      areasToImprove: [
        "Deepen familiarity with specific edge-cases and performance trade-offs",
        "Practice delivering structured answers using the STAR framework under time constraints",
        "Back up theoretical knowledge with hands-on portfolio project mentions"
      ],
      executiveSummary: `${candidateName} demonstrated a solid grasp of foundational concepts for an entry-level ${role}. With focused revision on real-world scenario trade-offs, you will be in the top quartile of campus placement applicants.`,
      nextSteps: [
        "Review the sample answers provided for any questions where you scored below 7.5.",
        `Build or refine one hands-on project highlighting ${role} best practices.`,
        "Practice mock verbal delivery with a 2-minute timer for each conceptual question."
      ]
    };
  };

  if (!ai || totalQuestions === 0) {
    return res.json({
      success: true,
      data: generateFallbackSummary(),
      source: 'computed-rubric'
    });
  }

  try {
    const sessionRecap = history.map((item: any, idx: number) => {
      return `Question ${idx + 1}: ${item.question}
Candidate Answer: ${item.answer}
Score: ${item.score}/10
Strengths identified: ${item.strengths?.join('; ')}
Weaknesses identified: ${item.weaknesses?.join('; ')}`;
    }).join('\n\n---\n\n');

    const prompt = `You are a Chief Technology Officer and Head of Campus Recruiting conducting a final performance evaluation for a fresher who just completed a mock interview session.
Candidate Name: ${candidateName}
Target Job Role: ${role}
Difficulty Level: ${difficulty}
Total Questions Answered: ${totalQuestions}
Average Score across answers: ${avgScore}/10

Detailed Session History:
${sessionRecap}

Analyze this candidate's overall performance. Freshers need encouraging, highly specific, and actionable guidance to land their dream job.
Calculate an Interview Readiness Percentage (0-100%) that realistically reflects their current readiness for actual campus placements or junior job interviews.

Provide a JSON response with:
{
  "overallScore": ${avgScore},
  "questionsAnswered": ${totalQuestions},
  "readinessPercentage": number (integer between 30 and 99),
  "performanceLevel": "Placement Ready" | "Exceptional Candidate" | "Promising Foundation" | "Needs Guided Practice",
  "strongAreas": ["string", "string", "string"],
  "areasToImprove": ["string", "string", "string"],
  "executiveSummary": "2-3 sentences of inspiring, high-impact feedback summarizing their potential",
  "nextSteps": ["3 concrete, actionable steps to prepare before their next real interview"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      }
    });

    const text = response.text?.trim() || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    if (!parsedData.readinessPercentage) {
      parsedData.readinessPercentage = baseReadiness;
    }
    parsedData.overallScore = avgScore;
    parsedData.questionsAnswered = totalQuestions;

    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.warn('Gemini final summary error, falling back to rubric:', error.message || error);
    return res.json({
      success: true,
      data: generateFallbackSummary(),
      source: 'fallback-on-error'
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
