import React, { useState, useEffect } from 'react';
import { exportAsPdf } from '../utils/pdfExport';
import {
  FileSearch,
  Sparkles,
  Loader2,
  Copy,
  Download,
  Check,
  XCircle,
  Building2,
  FileText,
  Sliders
} from 'lucide-react';
import { fetchCoverLetter } from '../services/api';
import { CoverLetterResult } from '../types';
import { ResumeUploader } from '../components/ResumeUploader';
import { SAMPLE_PRESETS } from '../data/sampleResumes';

interface Props {
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
}

export const CoverLetterPage: React.FC<Props> = ({
  resumeText,
  setResumeText,
  targetRole,
  setTargetRole,
}) => {
  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('careerpilot_cl_job_desc') || '';
  });
  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem('careerpilot_cl_company') || 'Apex Innovations';
  });
  const [tone, setTone] = useState<string>(() => {
    return localStorage.getItem('careerpilot_cl_tone') || 'Professional & Confident';
  });
  const [focusAreas, setFocusAreas] = useState<string>(() => {
    return localStorage.getItem('careerpilot_cl_focus') || 'Key technical achievements and team collaboration';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoverLetterResult | null>(() => {
    const saved = localStorage.getItem('careerpilot_cl_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [editableText, setEditableText] = useState<string>(() => {
    return localStorage.getItem('careerpilot_cl_editable_text') || '';
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('careerpilot_cl_job_desc', jobDescription);
  }, [jobDescription]);

  useEffect(() => {
    localStorage.setItem('careerpilot_cl_company', companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('careerpilot_cl_tone', tone);
  }, [tone]);

  useEffect(() => {
    localStorage.setItem('careerpilot_cl_focus', focusAreas);
  }, [focusAreas]);

  useEffect(() => {
    if (result) {
      localStorage.setItem('careerpilot_cl_result', JSON.stringify(result));
    } else {
      localStorage.removeItem('careerpilot_cl_result');
    }
  }, [result]);

  useEffect(() => {
    localStorage.setItem('careerpilot_cl_editable_text', editableText);
  }, [editableText]);

  useEffect(() => {
    const handleReset = () => {
      setResult(null);
      setJobDescription('');
      setCompanyName('Apex Innovations');
      setTone('Professional & Confident');
      setFocusAreas('Key technical achievements and team collaboration');
      setEditableText('');
      setError(null);
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, []);

  const handleGenerateCoverLetter = async () => {
    if (!resumeText) {
      setError('Please upload or paste your resume text first.');
      return;
    }
    if (!jobDescription || jobDescription.length < 20) {
      setError('Please enter a target Job Description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCoverLetter(
        resumeText,
        jobDescription,
        targetRole,
        companyName,
        tone,
        focusAreas
      );
      setResult(data);
      setEditableText(data.coverLetterText);
    } catch (err: any) {
      setError(err.message || 'Error generating cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!editableText) return;
    const formattedParagraphs = editableText
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const htmlContent = `
      <div class="card" style="margin-bottom:20px;">
        <strong>Target Role:</strong> ${result?.targetRole || targetRole}<br/>
        <strong>Company:</strong> ${result?.targetCompany || companyName || 'Hiring Manager'}<br/>
        <strong>Tone:</strong> ${tone}
      </div>

      <div style="font-family:'Times New Roman', Georgia, serif; font-size:13px; line-height:1.7; color:#1e293b;">
        ${formattedParagraphs}
      </div>
    `;

    exportAsPdf(
      `cover_letter_${(companyName || 'application').toLowerCase().replace(/\s+/g, '_')}.pdf`,
      `Cover Letter: ${result?.targetRole || targetRole} at ${result?.targetCompany || companyName || 'Company'}`,
      htmlContent
    );
  };

  const loadSampleJd = () => {
    const matched = SAMPLE_PRESETS.find(p => p.role.toLowerCase().includes(targetRole.toLowerCase())) || SAMPLE_PRESETS[0];
    setJobDescription(matched.jobDescription);
    if (!resumeText) setResumeText(matched.resumeText);
    if (!targetRole) setTargetRole(matched.role);
  };

  return (
    <div id="cover-letter-page" className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-amber-600" />
            AI Cover Letter Writer
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Generate custom, highly persuasive cover letters tailored to your resume and specific job postings.
          </p>
        </div>

        <button
          id="autofill-jd-coverletter-btn"
          onClick={loadSampleJd}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-500" /> Auto-Fill Sample Posting
        </button>
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="cl-target-role" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Target Role Title <span className="text-red-500">*</span>
            </label>
            <input
              id="cl-target-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="cl-company-name" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Company Name
            </label>
            <input
              id="cl-company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Google, Acme Corp..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Writing Tone
            </label>
            <select
              id="cl-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="Professional & Confident">Professional & Confident</option>
              <option value="Enthusiastic & Passionate">Enthusiastic & Passionate</option>
              <option value="Modern & Concise">Modern & Concise</option>
              <option value="Executive & Leadership">Executive & Leadership</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="cl-job-desc" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Target Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cl-job-desc"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Paste job posting text here..."
            className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <ResumeUploader
          resumeText={resumeText}
          setResumeText={setResumeText}
          targetRole={targetRole}
          setTargetRole={setTargetRole}
        />

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            id="generate-cover-letter-btn"
            onClick={handleGenerateCoverLetter}
            disabled={loading || !resumeText || !jobDescription}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Drafting Custom Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                Generate Tailored Cover Letter
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
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-md">
                  Tone: {tone}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Cover Letter for {result.targetRole} at {result.targetCompany}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="copy-cover-letter-btn"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>

                <button
                  id="download-cl-pdf-btn"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" /> Export Cover Letter (.pdf)
                </button>
              </div>
            </div>

            {/* Editable Text Area */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Live Editable Cover Letter Draft:
              </label>
              <textarea
                id="editable-cover-letter-text"
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                rows={16}
                className="w-full p-5 rounded-xl border border-slate-300 text-xs font-serif leading-relaxed text-slate-900 bg-amber-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>

            {/* Key Highlights & Customization Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-800 block">✓ Key Highlights Included:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {result.keyHighlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                <span className="font-bold text-amber-800 block">💡 Tips Before Sending:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {result.tipsForCustomization.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
