import React, { useState } from 'react';
import {
  Compass,
  FileText,
  Target,
  Map,
  MessageSquareCode,
  FileSearch,
  FolderGit2,
  Bot,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  RotateCcw
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  targetRole: string;
  hasResume: boolean;
  onResetSession?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  targetRole,
  hasResume,
  onResetSession
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume-review', label: 'Resume Review', icon: FileText },
    { id: 'ats-checker', label: 'ATS Checker', icon: Target },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
    { id: 'interview', label: 'Interview Coach', icon: MessageSquareCode },
    { id: 'cover-letter', label: 'Cover Letter', icon: FileSearch },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'chat', label: 'AI Career Chat', icon: Bot },
  ];

  return (
    <header id="main-navbar" className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
                <span>CareerPilot</span>
                <span className="text-cyan-400 font-extrabold">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-1">
                Personal AI Career Coach
              </p>
            </div>
          </button>

          {/* Target Role, Status & Reset Session (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3 ml-1">
            {targetRole && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold truncate max-w-[120px]">{targetRole}</span>
              </div>
            )}
            
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              hasResume 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                : 'bg-amber-950/60 border-amber-800 text-amber-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasResume ? 'Resume Loaded' : 'No Resume'}</span>
            </div>

            {onResetSession && (
              <button
                id="reset-session-navbar-btn"
                onClick={onResetSession}
                title="Reset session to clear resume & analyze another resume"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/80 text-red-200 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset Session</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {targetRole && (
            <div className="mb-2 px-3 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Target Role:</span>
              <span className="font-semibold text-cyan-300">{targetRole}</span>
            </div>
          )}

          {onResetSession && (
            <button
              id="mobile-reset-session-btn"
              onClick={() => {
                onResetSession();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-3 rounded-xl bg-red-950/80 border border-red-700 text-xs font-bold text-red-200 hover:bg-red-900 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>Reset Session (Clear & Analyze New Resume)</span>
            </button>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
