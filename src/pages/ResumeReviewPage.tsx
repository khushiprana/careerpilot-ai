import React, { useState, useEffect } from 'react';
import { exportAsPdf } from '../utils/pdfExport';
import {
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  RefreshCw,
  Award,
  Layers,
  Check
} from 'lucide-react';
import { fetchResumeReview } from '../services/api';
import { ResumeReviewResult } from '../types';
import { ResumeUploader } from '../components/ResumeUploader';

interface Props {
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  onResetSession?: () => void;
}

export const ResumeReviewPage: React.FC<Props> = ({
  resumeText,
  setResumeText,
  targetRole,
  setTargetRole,
  onResetSession
}) => {
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid-Level' | 'Senior'>(() => {
    return (localStorage.getItem('careerpilot_review_exp_level') as any) || 'Entry';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeReviewResult | null>(() => {
    const saved = localStorage.getItem('careerpilot_review_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('careerpilot_review_exp_level', experienceLevel);
  }, [experienceLevel]);

  useEffect(() => {
    if (result) {
      localStorage.setItem('careerpilot_review_result', JSON.stringify(result));
    } else {
      localStorage.removeItem('careerpilot_review_result');
    }
  }, [result]);

  useEffect(() => {
    const handleReset = () => {
      setResult(null);
      setExperienceLevel('Entry');
      setError(null);
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, []);

  const handleRunReview = async () => {
    if (!resumeText) {
      setError('Please upload or paste your resume text first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchResumeReview(resumeText, targetRole, experienceLevel);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error executing AI resume review.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIndex(index);
    setTimeout(() => setCopiedBulletIndex(null), 2000);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const htmlContent = `
      <div class="score-box">
        <div>
          <div class="badge">Overall Score</div>
          <div class="score-value">${result.overallScore} / 100</div>
        </div>
        <div>
          <strong>Target Role:</strong> ${targetRole || 'Candidate'}<br/>
          <strong>Experience Level:</strong> ${experienceLevel}
        </div>
      </div>

      <h2>Executive Summary</h2>
      <p>${result.summary}</p>

      <h2>Key Strengths</h2>
      <ul>
        ${result.keyStrengths.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <h2>Critical Areas for Improvement</h2>
      <ul>
        ${result.criticalWeaknesses.map(w => `<li>${w}</li>`).join('')}
      </ul>

      <h2>Section Breakdown</h2>
      ${result.sectionFeedback.map(s => `
        <div class="card">
          <div style="display:flex; justify-content:space-between;">
            <strong>${s.section}</strong>
            <span class="badge">Score: ${s.score}/100</span>
          </div>
          <p>${s.feedback}</p>
          <div style="font-size:11px; font-weight:600; color:#475569; margin-top:6px;">Actionable Suggestions:</div>
          <ul>
            ${s.suggestions.map(sg => `<li>${sg}</li>`).join('')}
          </ul>
        </div>
      `).join('')}

      <h2>Bullet Point Rewrites</h2>
      ${result.bulletPointImprovements.map((b, i) => `
        <div class="card">
          <div style="font-size:11px; font-weight:700; color:#0284c7; margin-bottom:4px;">BULLET #${i + 1}</div>
          <div style="margin-bottom:6px;"><strong>Original:</strong> <span style="color:#64748b;">${b.original}</span></div>
          <div style="margin-bottom:6px;"><strong>Improved:</strong> <span style="color:#0f172a; font-weight:600;">${b.improved}</span></div>
          <div style="font-size:11px; color:#475569;"><strong>Reasoning:</strong> ${b.reason}</div>
        </div>
      `).join('')}

      <h2>Formatting & ATS Layout Advice</h2>
      <ul>
        ${result.formattingAdvice.map(f => `<li>${f}</li>`).join('')}
      </ul>
    `;

    exportAsPdf(
      `resume_review_${(targetRole || 'candidate').toLowerCase().replace(/\s+/g, '_')}.pdf`,
      `Resume Review Report: ${targetRole || 'Candidate'}`,
      htmlContent
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div id="resume-review-page" className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            AI Resume Audit & Feedback
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Get an in-depth analysis of your resume content, section scoring, and actionable bullet point rewrites.
          </p>
        </div>

        {result && (
          <button
            id="download-review-report-btn"
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export Review Report (.pdf)
          </button>
        )}
      </div>

      {/* Input controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Target Experience Level
          </label>
          <div className="flex gap-2 max-w-md">
            {(['Entry', 'Mid-Level', 'Senior'] as const).map((lvl) => (
              <button
                key={lvl}
                id={`exp-level-btn-${lvl}`}
                type="button"
                onClick={() => setExperienceLevel(lvl)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  experienceLevel === lvl
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Uploader / Drawer */}
        <ResumeUploader
          resumeText={resumeText}
          setResumeText={setResumeText}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
          onResetSession={onResetSession}
        />

        <div className="flex justify-end pt-2">
          <button
            id="run-resume-review-btn"
            onClick={handleRunReview}
            disabled={loading || !resumeText}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Analyzing Resume with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                Run AI Resume Audit
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

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          
          {/* Top Gauge & Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score Radial Box */}
            <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center space-y-3 ${getScoreColor(result.overallScore)}`}>
              <Award className="w-8 h-8" />
              <div>
                <span className="text-4xl font-extrabold">{result.overallScore}</span>
                <span className="text-sm font-bold text-slate-500">/100</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 border">
                Overall Quality Score
              </span>
            </div>

            {/* Executive Summary */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Candidate Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {result.summary}
              </p>
            </div>

          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
              </h3>
              <ul className="space-y-2">
                {result.keyStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Critical Areas to Improve
              </h3>
              <ul className="space-y-2">
                {result.criticalWeaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Section Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> Section-by-Section Feedback
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.sectionFeedback.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{sec.section}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      sec.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      sec.score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sec.score}/100
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        sec.score >= 80 ? 'bg-emerald-500' :
                        sec.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${sec.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{sec.feedback}</p>

                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action Items:</span>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {sec.suggestions.map((sug, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">›</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric-driven Bullet Point Improver */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Action-Verb & Metric Bullet Point Rewrites
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Replace weak descriptive lines with high-impact, quantitative accomplishment bullets.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {result.bulletPointImprovements.map((bullet, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    
                    <div className="p-3 rounded-lg bg-red-50/80 border border-red-100 text-slate-800">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">
                        Original Bullet
                      </span>
                      <p>{bullet.original}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-slate-900 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Improved High-Impact Bullet
                        </span>
                        <button
                          id={`copy-bullet-btn-${idx}`}
                          onClick={() => handleCopyBullet(bullet.improved, idx)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded flex items-center gap-1 transition-colors"
                        >
                          {copiedBulletIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Bullet
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-medium text-emerald-950">{bullet.improved}</p>
                    </div>

                  </div>

                  <p className="text-xs text-slate-500 italic">
                    💡 <strong>Why this is better:</strong> {bullet.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Formatting Advice */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-3">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Formatting & Layout Recommendations
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              {result.formattingAdvice.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
