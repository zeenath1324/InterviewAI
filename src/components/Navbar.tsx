import React, { useState } from 'react';
import { Terminal, Menu, X, ArrowRight, BookOpen, BarChart2, Info } from 'lucide-react';

interface NavbarProps {
  onStartClick: () => void;
  onOpenInfo: (tab: 'howItWorks' | 'rubric' | 'tips' | 'about') => void;
  activeScreen: string;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onStartClick,
  onOpenInfo,
  activeScreen,
  onGoHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'howItWorks' | 'rubric' | 'tips' | 'about') => {
    onOpenInfo(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md py-1"
          aria-label="InterviewAI Home"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-display">
              InterviewAI
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded bg-slate-900">
              fresher.v1
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <button
            onClick={() => handleNavClick('howItWorks')}
            className="hover:text-white transition-colors py-1 focus:outline-none focus-visible:underline"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('rubric')}
            className="hover:text-white transition-colors py-1 focus:outline-none focus-visible:underline"
          >
            Grading Rubric
          </button>
          <button
            onClick={() => handleNavClick('tips')}
            className="hover:text-white transition-colors py-1 focus:outline-none focus-visible:underline"
          >
            Placement Tips
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="hover:text-white transition-colors py-1 focus:outline-none focus-visible:underline text-slate-400"
          >
            About Project
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {activeScreen !== 'home' && (
            <button
              onClick={onGoHome}
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Exit to Home
            </button>
          )}

          <button
            onClick={onStartClick}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Start Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
          <button
            onClick={() => handleNavClick('howItWorks')}
            className="w-full text-left py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('rubric')}
            className="w-full text-left py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
          >
            Grading Rubric
          </button>
          <button
            onClick={() => handleNavClick('tips')}
            className="w-full text-left py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
          >
            Placement Tips
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left py-2 text-sm text-slate-300 hover:text-white"
          >
            About Project & Tech Stack
          </button>
        </div>
      )}
    </header>
  );
};
