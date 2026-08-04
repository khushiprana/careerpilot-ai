import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw, FileCode, Sparkles } from 'lucide-react';
import { extractPdfText } from '../services/api';
import { SAMPLE_PRESETS } from '../data/sampleResumes';

interface Props {
  resumeText: string;
  setResumeText: (text: string) => void;
  fileName?: string;
  setFileName?: (name: string) => void;
  targetRole?: string;
  setTargetRole?: (role: string) => void;
  hideTargetRole?: boolean;
  onContinue?: () => void;
  onResetSession?: () => void;
}

export const ResumeUploader: React.FC<Props> = ({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  targetRole = '',
  setTargetRole = () => {},
  hideTargetRole = false,
  onContinue,
  onResetSession
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'presets'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await extractPdfText(file);
      setResumeText(result.text);
      if (setFileName) setFileName(result.fileName || file.name);
      setActiveTab('paste'); // show text view once parsed
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAutoFillSample = () => {
    const sample = SAMPLE_PRESETS[0];
    setResumeText(sample.resumeText);
    if (setTargetRole) setTargetRole(sample.role);
    if (setFileName) setFileName(`${sample.name} (Sample PDF)`);
    setError(null);
    setActiveTab('paste');
  };

  return (
    <div id="resume-uploader-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
      
      {/* Target Role & Single Sample Autofill Button */}
      {!hideTargetRole && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex-1">
            <label htmlFor="target-role-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Job Title / Role
            </label>
            <input
              id="target-role-input"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole && setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Analyst, Product Manager..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            id="autofill-sample-data-btn"
            type="button"
            onClick={handleAutoFillSample}
            title="Auto-fill sample resume & role for testing"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 text-blue-700 hover:text-blue-900 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap self-stretch sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Auto-fill Sample Data</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            id="uploader-tab-upload"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload PDF
          </button>
          <button
            id="uploader-tab-paste"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'paste' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Text Editor {resumeText && '✓'}
          </button>
        </div>

        {hideTargetRole && (
          <button
            id="autofill-sample-data-btn"
            type="button"
            onClick={handleAutoFillSample}
            title="Auto-fill sample resume for testing"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 text-blue-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Auto-fill Sample Resume</span>
          </button>
        )}
      </div>

      {/* Tab 1: Upload Box */}
      {activeTab === 'upload' && (
        <div
          id="pdf-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            id="pdf-file-input"
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Parsing PDF & Extracting Text...</p>
              <p className="text-xs text-slate-500">Extracting skills, experience, and contact details with AI</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Drag and drop your PDF resume here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PDF up to 10MB. Or click to browse files.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Text Editor View */}
      {activeTab === 'paste' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold flex items-center gap-1.5 truncate max-w-[250px] sm:max-w-md">
              <FileCode className="w-4 h-4 text-blue-600 flex-shrink-0" />
              {fileName ? `Resume: ${fileName}` : 'Resume Content'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{resumeText.length} chars</span>
          </div>
          <textarea
            id="resume-text-area"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={9}
            placeholder="Paste or type your resume text here (Summary, Experience, Skills, Education)..."
            className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
          />
        </div>
      )}

      {/* Status & Errors */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resumeText && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Resume ready for AI Analysis ({resumeText.split(/\s+/).length} words)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onResetSession && (
              <button
                id="uploader-reset-btn"
                onClick={onResetSession}
                className="py-2 px-3.5 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-semibold transition-all flex items-center justify-center gap-1"
              >
                Reset Session
              </button>
            )}

            {onContinue && (
              <button
                id="uploader-continue-btn"
                onClick={onContinue}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                Analyze Resume Now →
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
