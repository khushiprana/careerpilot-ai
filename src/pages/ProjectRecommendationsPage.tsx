import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Sparkles,
  Loader2,
  Code,
  Clock,
  Layers,
  CheckCircle2,
  Copy,
  Download,
  XCircle,
  Check,
  FileText
} from 'lucide-react';
import { fetchProjectSuggestions } from '../services/api';
import { ProjectRecommendation } from '../types';
import { exportAsPdf } from '../utils/pdfExport';

interface Props {
  resumeText?: string;
  setResumeText?: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
}

export const ProjectRecommendationsPage: React.FC<Props> = ({ resumeText, setResumeText, targetRole, setTargetRole }) => {
  const [techStack, setTechStack] = useState<string>(() => {
    return localStorage.getItem('careerpilot_projects_tech_stack') || 'React, TypeScript, Node.js, Express, Tailwind CSS';
  });
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(() => {
    return (localStorage.getItem('careerpilot_projects_difficulty') as any) || 'Intermediate';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRecommendation[]>(() => {
    const saved = localStorage.getItem('careerpilot_projects_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('careerpilot_projects_tech_stack', techStack);
  }, [techStack]);

  useEffect(() => {
    localStorage.setItem('careerpilot_projects_difficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem('careerpilot_projects_list', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const handleReset = () => {
      setProjects([]);
      setTechStack('React, TypeScript, Node.js, Express, Tailwind CSS');
      setDifficulty('Intermediate');
      setError(null);
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, []);

  const handleGenerateProjects = async () => {
    if (!targetRole) {
      setError('Please enter a target job role or career goal.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProjectSuggestions(targetRole, techStack, difficulty, resumeText);
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to generate portfolio project ideas.');
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (bullet: string, idStr: string) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletIdx(idStr);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleExportPdf = () => {
    if (projects.length === 0) return;
    const htmlContent = `
      <div class="score-box">
        <div>
          <div class="badge">Target Role: ${targetRole}</div>
          <div style="font-size:18px; font-weight:800; color:#0f172a; margin-top:4px;">Portfolio Project Blueprints</div>
        </div>
        <div>
          <strong>Difficulty Level:</strong> ${difficulty}<br/>
          <strong>Tech Stack:</strong> ${techStack}
        </div>
      </div>

      <h2>Recommended Production Projects</h2>
      ${projects.map((p, idx) => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:15px; color:#0f172a;">${idx + 1}. ${p.title}</strong>
            <span class="badge">${p.difficulty} • ${p.estimatedHours}</span>
          </div>
          <p style="font-weight:600; color:#475569; margin-bottom:8px;">${p.tagline}</p>
          <p>${p.problemStatement}</p>

          <h3>Tech Stack:</h3>
          <p style="font-weight:600; color:#0284c7;">${p.techStack.join(' • ')}</p>

          <h3>Key Architectural Features:</h3>
          <ul>
            ${p.keyFeatures.map(f => `<li>${f}</li>`).join('')}
          </ul>

          <h3>Pre-written Resume Bullet Points:</h3>
          <ul>
            ${p.resumeBulletPoints.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    `;

    exportAsPdf(
      `portfolio_projects_${targetRole.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      `Portfolio Project Recommendations: ${targetRole}`,
      htmlContent
    );
  };

  return (
    <div id="project-recommendations-page" className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-rose-600" />
            AI Portfolio Project Recommendations
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Discover production-grade portfolio project ideas tailored to your target role, with architecture notes and pre-written resume bullet points.
          </p>
        </div>

        {projects.length > 0 && (
          <button
            id="export-portfolio-projects-pdf-btn"
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export Projects (.pdf)
          </button>
        )}
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label htmlFor="proj-target-role" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Target Role Goal <span className="text-red-500">*</span>
            </label>
            <input
              id="proj-target-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Junior Frontend Dev, Full Stack Engineer..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="proj-tech-stack" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Preferred Tech Stack
            </label>
            <input
              id="proj-tech-stack"
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. React, Next.js, Node.js, Python..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Difficulty Level
            </label>
            <select
              id="proj-difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-rose-500"
            >
              <option value="Beginner">Beginner (1-2 weeks)</option>
              <option value="Intermediate">Intermediate (2-4 weeks)</option>
              <option value="Advanced">Advanced (1-2 months, production scale)</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            id="generate-projects-btn"
            onClick={handleGenerateProjects}
            disabled={loading || !targetRole}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Designing Portfolio Projects...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Recommend Portfolio Projects
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Project Cards */}
      {projects.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-rose-600" /> Recommended Standout Portfolio Projects ({projects.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj, pIdx) => (
              <div key={proj.id || pIdx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-300 transition-all">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {proj.difficulty} • {proj.estimatedHours}
                    </span>
                    <Code className="w-4 h-4 text-slate-400" />
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 leading-snug">{proj.title}</h4>
                  <p className="text-xs font-medium text-rose-700 italic">{proj.tagline}</p>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {proj.problemStatement}
                  </p>

                  {/* Tech Stack Badges */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Recommended Tech Stack:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack.map((tech, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Core Features to Build:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {proj.keyFeatures.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Architecture Overview */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <strong className="block text-slate-900 font-bold">🏛️ Architecture & API Notes:</strong>
                    <p className="text-[11px] font-mono leading-relaxed">{proj.architectureOverview}</p>
                  </div>
                </div>

                {/* Resume Bullets */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Pre-written Resume Bullet Points:
                  </span>
                  {proj.resumeBulletPoints.map((bullet, bIdx) => {
                    const keyStr = `${pIdx}-${bIdx}`;
                    const isCopied = copiedBulletIdx === keyStr;
                    return (
                      <div key={bIdx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-start justify-between gap-2">
                        <span className="font-medium text-[11px] leading-relaxed">• {bullet}</span>
                        <button
                          id={`copy-proj-bullet-${pIdx}-${bIdx}`}
                          onClick={() => copyBullet(bullet, keyStr)}
                          className="px-2 py-1 text-[10px] font-bold bg-white border border-emerald-300 text-emerald-800 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors flex-shrink-0"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
