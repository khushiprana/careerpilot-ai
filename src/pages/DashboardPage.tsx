import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  MessageSquareCode,
  FileSearch,
  FolderGit2,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/sampleResumes';

interface Props {
  setActiveTab: (tab: string) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  fileName?: string;
  onResetSession?: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  setActiveTab,
  resumeText,
  setResumeText,
  targetRole,
  setTargetRole,
  fileName,
  onResetSession
}) => {
  const wordCount = resumeText ? resumeText.trim().split(/\s+/).length : 0;

  const quickTools = [
    {
      id: 'resume-review',
      name: 'Resume Review',
      desc: 'Get a 0-100 quality score, strengths, and metric bullet rewrites.',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      id: 'ats-checker',
      name: 'ATS Matcher',
      desc: 'Compare resume against job description for missing keywords.',
      icon: Target,
      color: 'bg-cyan-500',
    },
    {
      id: 'roadmap',
      name: 'Learning Roadmap',
      desc: 'Generate a step-by-step weekly study and project plan.',
      icon: Map,
      color: 'bg-emerald-500',
    },
    {
      id: 'interview',
      name: 'Interview Coach',
      desc: 'Practice role-specific STAR questions and evaluate answers.',
      icon: MessageSquareCode,
      color: 'bg-purple-500',
    },
    {
      id: 'cover-letter',
      name: 'Cover Letter Generator',
      desc: 'Create a tailored cover letter matched to job descriptions.',
      icon: FileSearch,
      color: 'bg-amber-500',
    },
    {
      id: 'projects',
      name: 'Portfolio Projects',
      desc: 'Discover 3 portfolio projects with feature lists and stack.',
      icon: FolderGit2,
      color: 'bg-rose-500',
    },
  ];

  const getToolBadge = (toolId: string) => {
    try {
      if (toolId === 'resume-review') {
        const saved = localStorage.getItem('careerpilot_review_result');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.overallScore !== undefined) {
            return `Score: ${parsed.overallScore}/100`;
          }
        }
      }
      if (toolId === 'ats-checker') {
        const saved = localStorage.getItem('careerpilot_ats_result');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.matchPercentage !== undefined) {
            return `Match: ${parsed.matchPercentage}%`;
          }
        }
      }
      if (toolId === 'roadmap') {
        const saved = localStorage.getItem('careerpilot_roadmap_result');
        if (saved) return 'Roadmap Ready';
      }
      if (toolId === 'interview') {
        const saved = localStorage.getItem('careerpilot_interview_questions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return `${parsed.length} Questions Ready`;
        }
      }
      if (toolId === 'cover-letter') {
        const saved = localStorage.getItem('careerpilot_cl_result');
        if (saved) return 'Draft Ready';
      }
      if (toolId === 'projects') {
        const saved = localStorage.getItem('careerpilot_projects_list');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return `${parsed.length} Projects Ready`;
        }
      }
    } catch (e) {
      // ignore JSON parse error
    }
    return null;
  };

  return (
    <div id="dashboard-page" className="space-y-8 py-4">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            Career Pilot Control Center
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage your candidate profile, target job parameters, and run AI career tools.
          </p>
        </div>

        <button
          id="dash-chat-shortcut-btn"
          onClick={() => setActiveTab('chat')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Bot className="w-4 h-4 text-cyan-400" /> Ask AI Career Coach
        </button>
      </div>

      {/* Profile & Target Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Candidate & Resume Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resume Context</span>
            {resumeText ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5" /> Empty
              </span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {fileName || (resumeText ? 'Uploaded Resume' : 'No Resume Uploaded')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {resumeText ? `${wordCount} words loaded` : 'Upload a PDF or choose a preset to begin'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              id="dash-edit-resume-btn"
              onClick={() => setActiveTab('landing')}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors text-center"
            >
              {resumeText ? 'Change / Re-upload' : 'Upload Resume'}
            </button>
            {onResetSession && (resumeText || targetRole) && (
              <button
                id="dash-reset-session-btn"
                onClick={onResetSession}
                title="Reset session to analyze another resume"
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Job Role Setting Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Role Settings</span>
            <span className="text-xs text-blue-600 font-medium">Used across all AI modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dash-target-role" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role / Job Title
              </label>
              <input
                id="dash-target-role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Load Sample Candidate Preset
              </label>
              <select
                id="dash-preset-select"
                onChange={(e) => {
                  const preset = SAMPLE_PRESETS.find(p => p.id === e.target.value);
                  if (preset) {
                    setResumeText(preset.resumeText);
                    setTargetRole(preset.role);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a sample profile...</option>
                {SAMPLE_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-medium">
              Target Role set to: <strong className="text-blue-700">{targetRole || 'Not specified'}</strong>
            </span>
            <span className="text-blue-600 text-[11px]">Ready for AI Analysis</span>
          </div>
        </div>

      </div>

      {/* AI Tools Launchpad */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">AI Launchpad Tools</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickTools.map((t) => {
            const Icon = t.icon;
            const badge = getToolBadge(t.id);
            return (
              <div
                key={t.id}
                id={`dash-launch-tool-${t.id}`}
                onClick={() => setActiveTab(t.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${t.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {badge}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
