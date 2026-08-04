import React, { useState, useEffect } from 'react';
import {
  Map,
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  Award,
  Clock,
  Layers,
  XCircle,
  Download,
  FileText
} from 'lucide-react';
import { fetchRoadmap } from '../services/api';
import { RoadmapResult } from '../types';
import { exportAsPdf } from '../utils/pdfExport';

interface Props {
  resumeText?: string;
  setResumeText?: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
}

export const RoadmapPage: React.FC<Props> = ({ resumeText, setResumeText, targetRole, setTargetRole }) => {
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(() => {
    return (localStorage.getItem('careerpilot_roadmap_level') as any) || 'Beginner';
  });
  const [weeklyHours, setWeeklyHours] = useState<number>(() => {
    return Number(localStorage.getItem('careerpilot_roadmap_hours')) || 10;
  });
  const [timeframeWeeks, setTimeframeWeeks] = useState<number>(() => {
    return Number(localStorage.getItem('careerpilot_roadmap_weeks')) || 4;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(() => {
    const saved = localStorage.getItem('careerpilot_roadmap_result');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('careerpilot_roadmap_level', currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    localStorage.setItem('careerpilot_roadmap_hours', String(weeklyHours));
  }, [weeklyHours]);

  useEffect(() => {
    localStorage.setItem('careerpilot_roadmap_weeks', String(timeframeWeeks));
  }, [timeframeWeeks]);

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem('careerpilot_roadmap_result', JSON.stringify(roadmap));
    } else {
      localStorage.removeItem('careerpilot_roadmap_result');
    }
  }, [roadmap]);

  useEffect(() => {
    const handleReset = () => {
      setRoadmap(null);
      setCurrentLevel('Beginner');
      setWeeklyHours(10);
      setTimeframeWeeks(4);
      setError(null);
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!targetRole) {
      setError('Please specify your target career goal / role.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRoadmap(targetRole, currentLevel, weeklyHours, timeframeWeeks, resumeText);
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate learning roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRoadmap = () => {
    if (!roadmap) return;
    const htmlContent = `
      <div class="score-box">
        <div>
          <div class="badge">Learning Plan</div>
          <div style="font-size:18px; font-weight:800; color:#0f172a; margin-top:4px;">${roadmap.role}</div>
        </div>
        <div>
          <strong>Level:</strong> ${roadmap.level}<br/>
          <strong>Duration:</strong> ${roadmap.totalWeeks} Weeks
        </div>
      </div>

      <h2>Strategy Overview</h2>
      <p>${roadmap.overview}</p>

      <h2>Weekly Learning Roadmap</h2>
      ${roadmap.weeks.map(w => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:10px;">
            <strong style="font-size:15px; color:#0f172a;">Week ${w.weekNumber}: ${w.title}</strong>
            <span class="badge">Goal: ${w.goal}</span>
          </div>

          <h3>Core Topics to Master:</h3>
          <ul>
            ${w.topics.map(t => `<li><strong>${t}</strong></li>`).join('')}
          </ul>

          <h3>Actionable Daily Tasks:</h3>
          <ul>
            ${w.dailyTasks.map(t => `<li>${t}</li>`).join('')}
          </ul>

          <h3>Recommended Resources:</h3>
          <ul>
            ${w.recommendedResources.map(r => `<li><strong>${r.title}</strong> (${r.type})</li>`).join('')}
          </ul>

          <div style="margin-top:10px; background:#fffbeb; border:1px solid #fde68a; padding:8px 12px; border-radius:6px;">
            <strong style="color:#92400e;">🏆 Milestone Deliverable:</strong> ${w.milestoneProject}
          </div>
        </div>
      `).join('')}
    `;

    exportAsPdf(
      `roadmap_${roadmap.role.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      `Learning Roadmap: ${roadmap.role}`,
      htmlContent
    );
  };

  return (
    <div id="roadmap-page" className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-600" />
            AI Career Learning Roadmap
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Build a personalized week-by-week skill development curriculum tailored to your goal and schedule.
          </p>
        </div>

        {roadmap && (
          <button
            id="download-roadmap-btn"
            onClick={handleDownloadRoadmap}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export Roadmap (.pdf)
          </button>
        )}
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2">
            <label htmlFor="roadmap-role-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Target Role / Skill Goal <span className="text-red-500">*</span>
            </label>
            <input
              id="roadmap-role-input"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Engineer, Cloud Architect, AI Developer..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Skill Level
            </label>
            <select
              id="roadmap-level-select"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Beginner">Beginner (Starting fresh)</option>
              <option value="Intermediate">Intermediate (Has basics)</option>
              <option value="Advanced">Advanced (Refining edge)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Timeframe
            </label>
            <select
              id="roadmap-weeks-select"
              value={timeframeWeeks}
              onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value={4}>4 Weeks Sprint</option>
              <option value={8}>8 Weeks Intensive</option>
              <option value={12}>12 Weeks Mastery</option>
            </select>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Study Time:</span>
            <input
              id="roadmap-hours-range"
              type="range"
              min={5}
              max={30}
              step={5}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-32 accent-emerald-600"
            />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {weeklyHours} hrs/week
            </span>
          </div>

          <button
            id="generate-roadmap-btn"
            onClick={handleGenerateRoadmap}
            disabled={loading || !targetRole}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Designing Custom Curriculum...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Generate Learning Roadmap
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

      {/* Roadmap Content */}
      {roadmap && (
        <div className="space-y-6">
          
          {/* Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  {roadmap.level} Level Roadmap
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {roadmap.role} ({roadmap.totalWeeks} Weeks)
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {roadmap.overview}
            </p>
          </div>

          {/* Timeline of Weeks */}
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
            {roadmap.weeks.map((week, wIdx) => (
              <div key={wIdx} className="relative pl-12 space-y-3">
                
                {/* Timeline Circle */}
                <div className="absolute left-3.5 top-0 w-5 h-5 -translate-x-1/2 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center ring-4 ring-slate-50 shadow-sm">
                  {week.weekNumber}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Week {week.weekNumber} Focus
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{week.title}</h4>
                    </div>
                    <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 self-start sm:self-auto">
                      Goal: {week.goal}
                    </span>
                  </div>

                  {/* Topics Grid */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Core Topics to Study:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {week.topics.map((t, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actionable Daily Tasks as Clean List */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Actionable Daily Tasks:
                    </span>
                    <div className="space-y-2">
                      {week.dailyTasks.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs font-medium leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources & Milestone Project */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    
                    {/* Free Resources */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Free Learning Resources:
                      </span>
                      <div className="space-y-1.5">
                        {week.recommendedResources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url.startsWith('http') ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.url || res.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 text-xs font-semibold text-blue-700 transition-colors border border-slate-200"
                          >
                            <span className="truncate">{res.title} ({res.type})</span>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Milestone */}
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" /> Milestone Deliverable
                      </span>
                      <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                        {week.milestoneProject}
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
