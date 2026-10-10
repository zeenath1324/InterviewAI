import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  Clock, 
  HelpCircle, 
  Check, 
  Copy, 
  ArrowRight, 
  AlertCircle,
  MessageSquare,
  FastForward,
  CornerDownRight
} from 'lucide-react';
import { 
  AnswerEvaluation, 
  InterviewConfig, 
  QAHistoryItem, 
  QuestionData 
} from '../types/interview';
import { evaluateCandidateAnswer, fetchInterviewQuestion } from '../services/interviewApi';

interface InterviewRoomProps {
  config: InterviewConfig;
  onFinishInterview: (history: QAHistoryItem[]) => void;
  onExitSession: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  config,
  onFinishInterview,
  onExitSession,
}) => {
  // Use selectedQuestionCount consistently across all session logic
  const selectedQuestionCount = config.selectedQuestionCount || config.totalQuestions || 10;

  // Session State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [history, setHistory] = useState<QAHistoryItem[]>([]);
  const historyRef = useRef<QAHistoryItem[]>([]);

  // Follow-up flow state
  const [pendingFollowUp, setPendingFollowUp] = useState<{
    question: string;
    reason: string;
    category?: string;
  } | null>(null);
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState<boolean>(false);

  // UI States
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showStarGuide, setShowStarGuide] = useState<boolean>(false);
  const [copiedSample, setCopiedSample] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load question when question index changes
  useEffect(() => {
    loadNextMainQuestion(currentQuestionIndex);
  }, [currentQuestionIndex]);

  // Track elapsed time per question
  useEffect(() => {
    setSecondsElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, isAnsweringFollowUp]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Speak question automatically if voiceMode is on
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const loadNextMainQuestion = async (index: number) => {
    setIsLoadingQuestion(true);
    setErrorMessage(null);
    setCurrentEvaluation(null);
    setCandidateAnswer('');
    setShowHints(false);
    setPendingFollowUp(null);
    setIsAnsweringFollowUp(false);

    try {
      const prevContext = history.map((item) => ({
        question: item.question.question,
        answer: item.answer,
        score: item.evaluation.score,
      }));

      const qData = await fetchInterviewQuestion({
        role: config.role,
        difficulty: config.difficulty,
        candidateName: config.candidateName,
        questionIndex: index,
        totalQuestions: selectedQuestionCount,
        mode: config.mode,
        focusArea: config.focusArea,
        previousQAs: prevContext,
        resumeData: config.resumeData,
      });

      setCurrentQuestion(qData);
      if (config.voiceMode) {
        speakText(qData.question);
      }
    } catch (err: any) {
      console.error('Error fetching question:', err);
      setErrorMessage('Failed to generate question. Please try reloading.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Toggle speech for current question
  const toggleSpeech = () => {
    if (!currentQuestion) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakText(currentQuestion.question);
    }
  };

  // Toggle voice recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type directly into the answer box.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setCandidateAnswer((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    const trimmed = candidateAnswer.trim();
    if (!trimmed) {
      setErrorMessage('Please type or dictate an answer before submitting.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const evalResult = await evaluateCandidateAnswer({
        role: config.role,
        difficulty: config.difficulty,
        candidateName: config.candidateName,
        question: currentQuestion.question,
        answer: trimmed,
        questionNumber: currentQuestionIndex,
        expectedKeyPoints: currentQuestion.expectedKeyPoints,
        category: currentQuestion.category,
      });

      setCurrentEvaluation(evalResult);

      const historyItem: QAHistoryItem = {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        answer: trimmed,
        evaluation: evalResult,
        timeSpentSeconds: secondsElapsed,
        isFollowUp: isAnsweringFollowUp,
      };

      setHistory((prev) => {
        const updated = [...prev, historyItem];
        historyRef.current = updated;
        return updated;
      });

      // Check if a dynamic follow-up was generated
      if (evalResult.followUpQuestion && !isAnsweringFollowUp) {
        setPendingFollowUp(evalResult.followUpQuestion);
      } else {
        setPendingFollowUp(null);
      }
    } catch (err: any) {
      console.error('Answer evaluation failed:', err);
      setErrorMessage('Error evaluating response. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle Skip Question
  const handleSkipQuestion = () => {
    if (!currentQuestion) return;
    const skipItem: QAHistoryItem = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion,
      answer: '[Question Skipped by Candidate]',
      evaluation: {
        score: 0,
        technicalScore: 0,
        communicationScore: 0,
        problemSolvingScore: 0,
        confidenceScore: 0,
        strengths: ['Acknowledged knowledge boundary proactively.'],
        weaknesses: ['Question was skipped without an attempted explanation.'],
        suggestions: ['In real interviews, even if unsure, attempt to break down the problem or state what you do know.'],
        sampleAnswer: 'A good approach when encountering an unfamiliar question is to clarify the requirements and outline your first-principles thought process.',
        feedbackSummary: 'Skipped question recorded. Review the topic during preparation.',
      },
      timeSpentSeconds: secondsElapsed,
      skipped: true,
    };

    setHistory((prev) => {
      const updated = [...prev, skipItem];
      historyRef.current = updated;
      return updated;
    });

    if (currentQuestionIndex < selectedQuestionCount) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalItems = historyRef.current.length > 0 ? historyRef.current : [...history, skipItem];
      onFinishInterview(finalItems);
    }
  };

  // Transition to answering the dynamic follow-up question
  const handleStartFollowUp = () => {
    if (!pendingFollowUp || !currentQuestion) return;

    const followUpQuestionData: QuestionData = {
      id: `${currentQuestion.id}-followup`,
      question: pendingFollowUp.question,
      category: pendingFollowUp.category || currentQuestion.category,
      interviewerNote: pendingFollowUp.reason || `Follow-up to your previous answer on ${currentQuestion.question}`,
      hints: ['Build upon what you shared in your previous answer.', 'Provide a specific example or technical detail.'],
      expectedKeyPoints: ['Demonstrates deep practical knowledge', 'Connects back to previous claim'],
      isFollowUp: true,
      parentQuestion: currentQuestion.question,
      parentAnswerSnippet: candidateAnswer.slice(0, 100),
    };

    setCurrentQuestion(followUpQuestionData);
    setIsAnsweringFollowUp(true);
    setCurrentEvaluation(null);
    setCandidateAnswer('');
    setPendingFollowUp(null);

    if (config.voiceMode) {
      speakText(followUpQuestionData.question);
    }
  };

  // Next Question
  const handleProceedNext = () => {
    if (currentQuestionIndex < selectedQuestionCount) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalHistory = historyRef.current.length > 0 ? historyRef.current : history;
      onFinishInterview(finalHistory);
    }
  };

  // End interview early button
  const handleEndInterviewEarly = () => {
    const activeHistory = historyRef.current.length > 0 ? historyRef.current : history;
    if (activeHistory.length > 0) {
      onFinishInterview(activeHistory);
    } else {
      onExitSession();
    }
  };

  // Copy sample answer
  const handleCopySample = () => {
    if (!currentEvaluation?.sampleAnswer) return;
    navigator.clipboard.writeText(currentEvaluation.sampleAnswer);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;
  const progressPercent = Math.min(100, Math.round((currentQuestionIndex / selectedQuestionCount) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Status & Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-850 border border-slate-750">
              {config.role}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-medium">
              {config.difficulty}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono capitalize">
              Mode: {config.mode}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">
              Candidate: <span className="text-slate-200 font-semibold">{config.candidateName}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            <button
              onClick={handleEndInterviewEarly}
              className="text-slate-400 hover:text-indigo-300 transition-colors"
              title="Finish interview and generate report with questions answered so far"
            >
              End Interview
            </button>

            <button
              onClick={() => setShowQuitConfirm(true)}
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              Quit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {isAnsweringFollowUp ? (
                <span className="text-indigo-400 font-medium flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3" />
                  Follow-up Question (Parent Q{currentQuestionIndex})
                </span>
              ) : (
                <>
                  Question <strong className="text-white">{currentQuestionIndex}</strong> of {selectedQuestionCount}
                </>
              )}
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Confirmation modal for quitting */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-4 text-left">
            <h3 className="text-sm font-bold text-white">Exit Interview Session?</h3>
            <p className="text-xs text-slate-300">
              You will lose this active session and return to the home screen.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                Continue Interview
              </button>
              <button
                onClick={onExitSession}
                className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-4">
        {isLoadingQuestion ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading interview question...</p>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {currentQuestion.category || 'Interview Question'}
                </span>
                {currentQuestion.isFollowUp && (
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/80">
                    Follow-up Question
                  </span>
                )}
              </div>

              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isSpeaking
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Read question aloud"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white font-display leading-snug">
              {currentQuestion.question}
            </h2>

            {currentQuestion.interviewerNote && (
              <div className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="font-semibold text-indigo-400 block mb-0.5">Interviewer Note:</span>
                <span>{currentQuestion.interviewerNote}</span>
              </div>
            )}

            {/* Collapsible Hints */}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div className="pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showHints ? 'Hide Hints' : 'Need guidance? Click to reveal hints'}</span>
                </button>

                {showHints && (
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div>
                      <strong className="text-indigo-400 block mb-1">Hints to structure your answer:</strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {currentQuestion.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                    {currentQuestion.expectedKeyPoints && (
                      <div className="pt-2 border-t border-slate-850">
                        <strong className="text-slate-300 block mb-1">Key points interviewers look for:</strong>
                        <div className="flex flex-wrap gap-1">
                          {currentQuestion.expectedKeyPoints.map((kp, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {kp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 space-y-2">
            <p>Could not load the question.</p>
            <button
              onClick={() => loadNextMainQuestion(currentQuestionIndex)}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Answer Input Section */}
      {!currentEvaluation && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Your Response
              </label>
              <button
                type="button"
                onClick={() => setShowStarGuide(!showStarGuide)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                {showStarGuide ? 'Hide STAR Formula' : 'STAR Method Formula'}
              </button>
            </div>

            {/* Dictation Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Dictate with microphone"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening... (Click to stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Voice Dictate</span>
                </>
              )}
            </button>
          </div>

          {/* STAR Method Reference Box */}
          {showStarGuide && (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <strong className="text-indigo-400 block">Situation</strong>
                <span className="text-[11px] text-slate-400">Context, team, or project background.</span>
              </div>
              <div>
                <strong className="text-indigo-400 block">Task</strong>
                <span className="text-[11px] text-slate-400">The specific challenge or requirement.</span>
              </div>
              <div>
                <strong className="text-indigo-400 block">Action</strong>
                <span className="text-[11px] text-slate-400">The tools, design patterns, and code you used.</span>
              </div>
              <div>
                <strong className="text-indigo-400 block">Result</strong>
                <span className="text-[11px] text-slate-400">The outcome, metrics, or lessons learned.</span>
              </div>
            </div>
          )}

          {/* Text Area */}
          <textarea
            value={candidateAnswer}
            onChange={(e) => {
              setCandidateAnswer(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isLoadingQuestion || isEvaluating}
            rows={7}
            placeholder="Type your answer here... Be clear, reference relevant tools or concepts, and explain your reasoning as you would to an interviewer."
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
          />

          {/* Meta & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Words: <strong className="text-slate-200 font-mono">{wordCount}</strong></span>
              <span>·</span>
              <span>Characters: <strong className="text-slate-200 font-mono">{candidateAnswer.length}</strong></span>
              {wordCount > 0 && wordCount < 25 && (
                <span className="text-amber-400 text-[11px] ml-1">
                  (Aim for 40+ words for complete feedback)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Skip Question Button */}
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={isEvaluating}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors flex items-center gap-1"
                title="Skip this question and move to the next topic"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              {candidateAnswer.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCandidateAnswer('')}
                  disabled={isEvaluating}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
                >
                  Clear Draft
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isLoadingQuestion || isEvaluating || !candidateAnswer.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Answer Evaluation Feedback Panel */}
      {currentEvaluation && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-6">
          {/* Feedback Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-indigo-400 block mb-1">
                Evaluation Complete · {isAnsweringFollowUp ? 'Follow-Up Evaluated' : `Question ${currentQuestionIndex} of ${config.totalQuestions}`}
              </span>
              <h3 className="text-lg font-bold text-white font-display">
                Interviewer Score & Feedback
              </h3>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg w-fit">
              <div className="font-mono text-2xl font-bold text-white">
                {currentEvaluation.score}
                <span className="text-xs text-slate-400 font-normal"> / 10</span>
              </div>
              <div className="border-l border-slate-800 pl-3 text-xs text-slate-300 font-medium">
                {currentEvaluation.score >= 8.5
                  ? 'Strong Answer'
                  : currentEvaluation.score >= 7.0
                  ? 'Solid Baseline'
                  : currentEvaluation.score >= 5.0
                  ? 'Partial Answer'
                  : 'Needs Practice'}
              </div>
            </div>
          </div>

          {/* Feedback Summary */}
          {currentEvaluation.feedbackSummary && (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 text-xs sm:text-sm text-slate-300 italic">
              "{currentEvaluation.feedbackSummary}"
            </div>
          )}

          {/* Candidate Original Answer Recap */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Your Answer:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              "{candidateAnswer}"
            </p>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentEvaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Areas to Strengthen
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentEvaluation.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions for Improvement */}
          {currentEvaluation.suggestions && currentEvaluation.suggestions.length > 0 && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Actionable Advice for Next Time
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentEvaluation.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-semibold shrink-0">→</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ideal Sample Answer */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Model Sample Answer
              </h4>
              <button
                type="button"
                onClick={handleCopySample}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white"
              >
                {copiedSample ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900 p-3.5 rounded-lg border border-slate-850">
              {currentEvaluation.sampleAnswer}
            </p>
          </div>

          {/* DYNAMIC FOLLOW-UP PROMPT (Crucial Requirement) */}
          {pendingFollowUp && !isAnsweringFollowUp && (
            <div className="p-4 rounded-lg bg-slate-950 border border-indigo-500/40 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Interviewer Generated a Follow-Up Question</span>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">
                  "{pendingFollowUp.question}"
                </p>
                <p className="text-[11px] text-slate-400">
                  {pendingFollowUp.reason}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartFollowUp}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Answer Follow-Up Question</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedNext}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                >
                  Skip Follow-Up & Proceed
                </button>
              </div>
            </div>
          )}

          {/* Standard Navigation Action Row (If no follow-up pending or answered) */}
          {(!pendingFollowUp || isAnsweringFollowUp) && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {currentQuestionIndex < selectedQuestionCount
                  ? `Proceeding to Question ${currentQuestionIndex + 1}`
                  : `All ${selectedQuestionCount} questions completed!`}
              </span>

              <button
                type="button"
                onClick={handleProceedNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>
                  {currentQuestionIndex < selectedQuestionCount
                    ? 'Next Question'
                    : 'View Final Readiness Report'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
