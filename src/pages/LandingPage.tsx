import React from 'react';
import {
  Compass,
  FileText,
  Target,
  Map,
  MessageSquareCode,
  FileSearch,
  FolderGit2,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ResumeUploader } from '../components/ResumeUploader';

interface Props {
  setActiveTab: (tab: string) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  onResetSession?: () => void;
}

export const LandingPage: React.FC<Props> = ({
  setActiveTab,
  resumeText,
  setResumeText,
  targetRole,
  setTargetRole,
  onResetSession,
}) => {

  const features = [
    {
      id: 'resume-review',
      title: 'AI Resume Review',
      desc: 'Instant 360° audit of your resume with detailed scoring, section feedback, and metrics-driven bullet point rewrites.',
      icon: FileText,
      badge: 'Score & Feedback',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'ats-checker',
      title: 'ATS Resume Matcher',
      desc: 'Compare your resume against any target job description. Uncover missing hard & soft skills, keyword density, and formatting risks.',
      icon: Target,
      badge: '0-100% Match',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'roadmap',
      title: 'Personalized Roadmap',
      desc: 'Custom week-by-week learning pathway with daily actionable tasks, free documentation links, and milestone projects.',
      icon: Map,
      badge: 'Step-by-Step',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'interview',
      title: 'AI Interview Coach',
      desc: 'Practice HR, Technical, and Behavioral questions with STAR method guidance. Get real-time AI evaluation on your practice answers.',
      icon: MessageSquareCode,
      badge: 'STAR Evaluator',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter Generator',
      desc: 'Generate tailored, highly persuasive cover letters matching your resume to any job description in seconds with custom tone controls.',
      icon: FileSearch,
      badge: 'Tailored Drafts',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'projects',
      title: 'Portfolio Project Ideas',
      desc: 'Receive 3 custom portfolio project proposals with tech stack lists, architecture breakdowns, and pre-written resume bullet points.',
      icon: FolderGit2,
      badge: 'Portfolio Ready',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div id="landing-page" className="space-y-16 py-6">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-8 sm:p-12 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Powered by Gemini 3.6 Flash AI API</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Elevate Your Career Readiness with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">CareerPilot AI</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Upload your resume, enter a target job description, and receive immediate AI-powered resume audits, ATS compatibility matching, personalized learning roadmaps, and interview coaching.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free PDF Resume Parser
            </span>
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> ATS Compatibility Score
            </span>
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Real-time Streaming Coach
            </span>
          </div>
        </div>
      </section>

      {/* Quick Resume Upload & Target Setter */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Get Started in 1 Click</h2>
          <p className="text-sm text-slate-600">
            Upload your resume PDF or pick a sample preset to test all AI tools instantly.
          </p>
        </div>

        <ResumeUploader
          resumeText={resumeText}
          setResumeText={setResumeText}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          onContinue={() => setActiveTab('resume-review')}
          onResetSession={onResetSession}
        />
      </section>

      {/* Core Features Grid */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Comprehensive AI Career Suite</h2>
            <p className="text-sm text-slate-600 mt-1">
              Everything job seekers, graduates, and developers need to land top software & tech roles.
            </p>
          </div>
          <button
            id="view-all-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Open Full Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                id={`feature-card-${f.id}`}
                onClick={() => setActiveTab(f.id)}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Streaming Chat Promotion Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 text-cyan-300 text-xs font-semibold border border-indigo-700">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>24/7 AI Career Mentor</span>
          </div>
          <h3 className="text-2xl font-bold">Have Questions About Salary, Gaps, or Career Pivots?</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Chat in real-time with CareerPilot AI. Ask specific questions about your resume, interview strategy, or technical skills upgrade.
          </p>
        </div>

        <button
          id="hero-start-chat-btn"
          onClick={() => setActiveTab('chat')}
          className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Bot className="w-5 h-5" /> Start Streaming Chat →
        </button>
      </section>

    </div>
  );
};
