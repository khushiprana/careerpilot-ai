import React, { useState, useEffect } from 'react';
import { exportAsPdf } from '../utils/pdfExport';
import {
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Download,
  Info,
  Check,
  Zap,
  Tag
} from 'lucide-react';
import { fetchAtsCheck } from '../services/api';
import { AtsCheckResult } from '../types';
import { ResumeUploader } from '../components/ResumeUploader';
import { SAMPLE_PRESETS } from '../data/sampleResumes';

interface Props {
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  onResetSession?: () => void;
}

export const AtsCheckerPage: React.FC<Props> = ({
  resumeText,
  setResumeText,
  targetRole,
  setTargetRole,
  onResetSession,
}) => {
  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('careerpilot_ats_job_desc') || '';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsCheckResult | null>(() => {
    const saved = localStorage.getItem('careerpilot_ats_result');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('careerpilot_ats_job_desc', jobDescription);
  }, [jobDescription]);

  useEffect(() => {
    if (result) {
      localStorage.setItem('careerpilot_ats_result', JSON.stringify(result));
    } else {
      localStorage.removeItem('careerpilot_ats_result');
    }
  }, [result]);

  useEffect(() => {
    const handleReset = () => {
      setResult(null);
      setJobDescription('');
      setError(null);
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, []);

  const handleRunAtsCheck = async () => {
    if (!resumeText) {
      setError('Please upload or paste your resume text first.');
      return;
    }
    if (!jobDescription || jobDescription.length < 30) {
      setError('Please enter a target Job Description to compare against.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAtsCheck(resumeText, jobDescription, targetRole);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error processing ATS compatibility check.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJobDesc = () => {
    const matched = SAMPLE_PRESETS.find(p => p.role.toLowerCase().includes(targetRole.toLowerCase())) || SAMPLE_PRESETS[0];
    setJobDescription(matched.jobDescription);
    if (!resumeText) setResumeText(matched.resumeText);
    if (!targetRole) setTargetRole(matched.role);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const handleExportPdf = () => {
    if (!result) return;
    const htmlContent = `
      <div class="score-box">
        <div>
          <div class="badge">ATS Match Score</div>
          <div class="score-value">${result.matchScore}% (${result.matchLevel} Match)</div>
        </div>
        <div>
          <strong>Target Role:</strong> ${targetRole || 'Target Position'}<br/>
        </div>
      </div>

      <h2>Executive Audit Summary</h2>
      <p>${result.summary}</p>

      <h2>Missing Critical Skills & Keywords</h2>
      <ul>
        ${result.missingHardSkills.concat(result.missingSoftSkills).map(k => `<li><strong>${k}</strong></li>`).join('')}
      </ul>

      <h2>Matched Keywords & Skills</h2>
      <ul>
        ${result.matchedHardSkills.concat(result.matchedSoftSkills).map(k => `<li>${k}</li>`).join('')}
      </ul>

      <h2>Formatting & ATS Compatibility Checks</h2>
      <ul>
        ${result.atsFormattingCheck.map(f => `<li><strong>[${f.status.toUpperCase()}] ${f.item}:</strong> ${f.note}</li>`).join('')}
      </ul>

      <h2>Actionable Optimization Plan</h2>
      <ul>
        ${result.actionableOptimizations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    `;

    exportAsPdf(
      `ats_report_${(targetRole || 'role').toLowerCase().replace(/\s+/g, '_')}.pdf`,
      `ATS Match Report: ${targetRole || 'Role'}`,
      htmlContent
    );
  };

  return (
    <div id="ats-checker-page" className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-600" />
            ATS Resume Compatibility Checker
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Compare your resume against any job description to discover missing keywords, hard skills gap, and parser compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {result && (
            <button
              id="download-ats-report-pdf-btn"
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Export ATS Report (.pdf)
            </button>
          )}

          <button
            id="load-sample-jd-btn"
            onClick={loadSampleJobDesc}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Auto-Fill Sample Job Description
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        
        {/* Job Description TextArea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="ats-job-description" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Target Job Description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400">{jobDescription.length} characters</span>
          </div>
          <textarea
            id="ats-job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={7}
            placeholder="Paste the full job posting/description here (including responsibilities, technical requirements, and qualifications)..."
            className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all leading-relaxed"
          />
        </div>

        {/* Resume Uploader widget */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Your Resume Source
          </label>
          <ResumeUploader
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            hideTargetRole={true}
            onResetSession={onResetSession}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="run-ats-check-btn"
            onClick={handleRunAtsCheck}
            disabled={loading || !resumeText || !jobDescription}
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Calculating ATS Score & Skill Match...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 text-white" />
                Calculate ATS Match Score
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

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* ATS Match Gauge */}
            <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center space-y-2 ${getScoreBadge(result.matchScore)}`}>
              <Target className="w-8 h-8" />
              <div>
                <span className="text-4xl font-extrabold">{result.matchScore}%</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 border">
                ATS Match: {result.matchLevel} Alignment
              </span>
            </div>

            {/* Match Summary */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" /> ATS Parser Overview
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {result.summary}
              </p>
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                💡 <strong>Keyword Density Note:</strong> {result.keywordDensityNotes}
              </p>
            </div>

          </div>

          {/* Skill Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Hard Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> Technical / Hard Skills Breakdown
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-2">
                    ✓ Matched Hard Skills ({result.matchedHardSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedHardSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                    {result.matchedHardSkills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No hard skills matched.</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-2">
                    ⚠ Missing Hard Skills ({result.missingHardSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingHardSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200 text-xs font-semibold">
                        + {s}
                      </span>
                    ))}
                    {result.missingHardSkills.length === 0 && (
                      <span className="text-xs text-emerald-600 font-medium">All key hard skills present!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Soft Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-600" /> Soft Skills & Core Competencies
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-2">
                    ✓ Matched Soft Skills ({result.matchedSoftSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSoftSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-2">
                    ⚠ Missing Soft Skills ({result.missingSoftSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSoftSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Formatting & Parser Compliance Audit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" /> ATS Structural & Formatting Audit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.atsFormattingCheck.map((check, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{check.item}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      check.status === 'pass' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      check.status === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{check.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Optimizations */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-4">
            <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Actionable Step-by-Step ATS Optimization Roadmap
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-200">
              {result.actionableOptimizations.map((opt, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
