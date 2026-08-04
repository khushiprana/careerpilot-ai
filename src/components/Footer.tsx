import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ setActiveTab }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-5 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200">
            CareerPilot <span className="text-cyan-400 font-extrabold">AI</span>
          </span>
          <span className="text-slate-500 text-[11px] hidden md:inline">• AI Resume & Career Coach</span>
        </div>

        {/* Minimal Navigation & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
          <button
            id="footer-nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className="hover:text-cyan-300 transition-colors"
          >
            Dashboard
          </button>
          <button
            id="footer-nav-review"
            onClick={() => setActiveTab('resume-review')}
            className="hover:text-cyan-300 transition-colors"
          >
            Resume Review
          </button>
          <button
            id="footer-nav-chat"
            onClick={() => setActiveTab('chat')}
            className="hover:text-cyan-300 transition-colors"
          >
            AI Chat
          </button>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-500">© {new Date().getFullYear()} CareerPilot AI</span>
        </div>

      </div>
    </footer>
  );
};

