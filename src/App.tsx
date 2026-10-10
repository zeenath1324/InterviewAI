/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InterviewSetupModal } from './components/InterviewSetupModal';
import { InterviewRoom } from './components/InterviewRoom';
import { FinalResultView } from './components/FinalResultView';
import { PromptEngineeringSection } from './components/PromptEngineeringSection';
import { InfoModal } from './components/InfoModal';
import { Footer } from './components/Footer';
import { AppScreen, InterviewConfig, InterviewMode, JobRole, QAHistoryItem } from './types/interview';

export default function App() {
  // Navigation & Screen Management
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [preselectedRole, setPreselectedRole] = useState<JobRole>('Software Developer');
  const [preselectedMode, setPreselectedMode] = useState<InterviewMode>('mixed');

  // Resource Center Modal
  const [infoTab, setInfoTab] = useState<'howItWorks' | 'rubric' | 'tips' | 'about' | null>(null);

  // Active Session State
  const [activeConfig, setActiveConfig] = useState<InterviewConfig>({
    candidateName: 'Alex Johnson',
    role: 'Software Developer',
    difficulty: 'Beginner',
    mode: 'mixed',
    totalQuestions: 10,
    selectedQuestionCount: 10,
  });

  const [sessionHistory, setSessionHistory] = useState<QAHistoryItem[]>([]);

  // Trigger setup modal with optional pre-selected role or mode
  const handleOpenSetup = (role?: JobRole, mode?: InterviewMode) => {
    if (role) setPreselectedRole(role);
    if (mode) setPreselectedMode(mode);
    setIsSetupOpen(true);
  };

  // Launch interview room when user completes setup
  const handleStartSession = (config: InterviewConfig) => {
    setActiveConfig(config);
    setSessionHistory([]);
    setIsSetupOpen(false);
    setCurrentScreen('interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle completion of interview questions
  const handleFinishInterview = (history: QAHistoryItem[]) => {
    setSessionHistory(history);
    setCurrentScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restart session with identical settings
  const handleRestartSameSession = () => {
    setSessionHistory([]);
    setCurrentScreen('interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to home screen
  const handleGoHome = () => {
    setCurrentScreen('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Prompt Engineering section
  const handleOpenPrompts = () => {
    setCurrentScreen('prompts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Universal Top Bar */}
      <Navbar
        onStartClick={() => handleOpenSetup()}
        onOpenInfo={(tab) => setInfoTab(tab)}
        onOpenPrompts={handleOpenPrompts}
        activeScreen={currentScreen}
        onGoHome={handleGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentScreen === 'home' && (
          <HeroSection
            onStartInterview={(role, mode) => handleOpenSetup(role, mode)}
            onOpenInfo={(tab) => setInfoTab(tab)}
            onOpenPrompts={handleOpenPrompts}
          />
        )}

        {currentScreen === 'prompts' && (
          <PromptEngineeringSection />
        )}

        {currentScreen === 'interview' && (
          <InterviewRoom
            config={activeConfig}
            onFinishInterview={handleFinishInterview}
            onExitSession={handleGoHome}
          />
        )}

        {currentScreen === 'result' && (
          <FinalResultView
            config={activeConfig}
            history={sessionHistory}
            onRestartSameSession={handleRestartSameSession}
            onChangeRole={() => handleOpenSetup()}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectRole={(role) => handleOpenSetup(role)}
        onOpenInfo={(tab) => setInfoTab(tab)}
      />

      {/* Setup Modal */}
      <InterviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartSession={handleStartSession}
        initialRole={preselectedRole}
        initialMode={preselectedMode}
      />

      {/* Resource Center / Info Modal */}
      <InfoModal
        isOpen={infoTab !== null}
        onClose={() => setInfoTab(null)}
        activeTab={infoTab || 'howItWorks'}
        onSelectTab={(tab) => setInfoTab(tab)}
        onStartClick={() => {
          setInfoTab(null);
          handleOpenSetup();
        }}
      />
    </div>
  );
}
