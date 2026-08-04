import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Send,
  RefreshCw,
  Zap,
  BookOpen,
  Download,
  FileText
} from 'lucide-react';
import { fetchInterviewQuestions, evaluateInterviewAnswer } from '../services/api';
import { InterviewQuestion, InterviewEvaluationResult } from '../types';
import { exportAsPdf } from '../utils/pdfExport';

interface Props {
  resumeText?: string;
  setResumeText?: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
}

export const InterviewCoachPage: React.FC<Props> = ({ resumeText, setResumeText, targetRole, setTargetRole }) => {
  const [category, setCategory] = useState<'HR' | 'Technical' | 'Behavioral' | 'System Design'>(() => {
    return (localStorage.getItem('careerpilot_interview_category') as any) || 'Behavioral';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => {
    const saved = localStorage.getItem('careerpilot_interview_questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() => {
    return localStorage.getItem('careerpilot_interview_active_q_id') || null;
  });
  const [evaluationsMap, setEvaluationsMap] = useState<Record<string, { userAnswerText: string; evalResult: InterviewEvaluationResult }>>(() => {
    const saved = localStorage.getItem('careerpilot_interview_eval_map');
    return saved ? JSON.parse(saved) : {};
  });

  const [userAnswerText, setUserAnswerText] = useState<string>(() => {
    const activeId = localStorage.getItem('careerpilot_interview_active_q_id');
    const savedEvalMap = localStorage.getItem('careerpilot_interview_eval_map');
    if (activeId && savedEvalMap) {
      const parsed = JSON.parse(savedEvalMap);
      if (parsed[activeId]) return parsed[activeId].userAnswerText || '';
    }
    return localStorage.getItem('careerpilot_interview_user_answer') || '';
  });

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<InterviewEvaluationResult | null>(() => {
    const activeId = localStorage.getItem('careerpilot_interview_active_q_id');
    const savedEvalMap = localStorage.getItem('careerpilot_interview_eval_map');
    if (activeId && savedEvalMap) {
      const parsed = JSON.parse(savedEvalMap);
      if (parsed[activeId]) return parsed[activeId].evalResult || null;
    }
    const saved = localStorage.getItem('careerpilot_interview_eval_result');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('careerpilot_interview_category', category);
  }, [category]);

  useEffect(() => {
    localStorage.setItem('careerpilot_interview_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    if (activeQuestionId) {
      localStorage.setItem('careerpilot_interview_active_q_id', activeQuestionId);
    } else {
      localStorage.removeItem('careerpilot_interview_active_q_id');
    }
  }, [activeQuestionId]);

  useEffect(() => {
    localStorage.setItem('careerpilot_interview_user_answer', userAnswerText);
  }, [userAnswerText]);

  useEffect(() => {
    if (evalResult) {
      localStorage.setItem('careerpilot_interview_eval_result', JSON.stringify(evalResult));
    } else {
      localStorage.removeItem('careerpilot_interview_eval_result');
    }
  }, [evalResult]);

  useEffect(() => {
    localStorage.setItem('careerpilot_interview_eval_map', JSON.stringify(evaluationsMap));
  }, [evaluationsMap]);

  useEffect(() => {
    const handleReset = () => {
      setQuestions([]);
      setActiveQuestionId(null);
      setUserAnswerText('');
      setEvalResult(null);
      setEvaluationsMap({});
      setCategory('Behavioral');
      setError(null);
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, []);

  const handleSelectQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    if (evaluationsMap[qId]) {
      setUserAnswerText(evaluationsMap[qId].userAnswerText || '');
      setEvalResult(evaluationsMap[qId].evalResult || null);
    } else {
      setUserAnswerText('');
      setEvalResult(null);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!targetRole) {
      setError('Please specify your target role.');
      return;
    }

    setLoading(true);
    setError(null);
    setEvalResult(null);
    setActiveQuestionId(null);
    setUserAnswerText('');

    try {
      const data = await fetchInterviewQuestions(targetRole, category, resumeText);
      setQuestions(data.questions);
      if (data.questions.length > 0) {
        setActiveQuestionId(data.questions[0].id);
        if (evaluationsMap[data.questions[0].id]) {
          setUserAnswerText(evaluationsMap[data.questions[0].id].userAnswerText || '');
          setEvalResult(evaluationsMap[data.questions[0].id].evalResult || null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async (q: InterviewQuestion) => {
    if (!userAnswerText || userAnswerText.length < 15) {
      setError('Please type a more detailed practice answer before requesting AI evaluation.');
      return;
    }

    setEvaluating(true);
    setError(null);

    try {
      const res = await evaluateInterviewAnswer(targetRole, q.question, userAnswerText, resumeText);
      setEvalResult(res);
      setEvaluationsMap((prev) => ({
        ...prev,
        [q.id]: {
          userAnswerText,
          evalResult: res,
        },
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate practice answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleExportPdf = () => {
    if (questions.length === 0) return;
    const htmlContent = `
      <div class="score-box">
        <div>
          <div class="badge">Interview Category: ${category}</div>
          <div style="font-size:18px; font-weight:800; color:#0f172a; margin-top:4px;">Target Role: ${targetRole}</div>
        </div>
      </div>

      <h2>Prepared Questions & STAR Answering Guides</h2>
      ${questions.map((q, idx) => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:14px; color:#0f172a;">Q${idx + 1}. ${q.question}</strong>
            <span class="badge">${q.difficulty}</span>
          </div>
          <p style="font-size:11px; color:#64748b; margin-top:2px;"><strong>Why Asked:</strong> ${q.contextWhyAsked}</p>
          
          <h3>STAR Method Breakdown:</h3>
          <ul>
            <li><strong>Situation:</strong> ${q.starGuide.situation}</li>
            <li><strong>Task:</strong> ${q.starGuide.task}</li>
            <li><strong>Action:</strong> ${q.starGuide.action}</li>
            <li><strong>Result:</strong> ${q.starGuide.result}</li>
          </ul>

          <h3>Exemplary Sample Response:</h3>
          <p style="background:#f1f5f9; padding:8px 12px; border-radius:6px; font-style:italic;">${q.sampleAnswer}</p>
        </div>
      `).join('')}
    `;

    exportAsPdf(
      `interview_prep_${targetRole.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      `Interview Preparation Guide: ${targetRole}`,
      htmlContent
    );
  };

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  return (
    <div id="interview-coach-page" className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareCode className="w-6 h-6 text-purple-600" />
            AI Interview Coach & STAR Evaluator
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Master HR, Technical, Behavioral, and System Design questions with STAR guides and real-time AI answer grading.
          </p>
        </div>

        {questions.length > 0 && (
          <button
            id="export-interview-guide-pdf-btn"
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export Q&A Guide (.pdf)
          </button>
        )}
      </div>

      {/* Setup Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2">
            <label htmlFor="interview-target-role" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Target Role / Position <span className="text-red-500">*</span>
            </label>
            <input
              id="interview-target-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior React Developer, Product Manager, Data Scientist..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Interview Category
            </label>
            <select
              id="interview-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="Behavioral">Behavioral (STAR Method)</option>
              <option value="Technical">Technical & Coding Core</option>
              <option value="HR">HR & Cultural Fit</option>
              <option value="System Design">System Design & Architecture</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            id="generate-interview-questions-btn"
            onClick={handleGenerateQuestions}
            disabled={loading || !targetRole}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Curating Interview Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Generate Practice Questions
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

      {/* Main Practice Workspace */}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Question List Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Practice Questions ({questions.length})
            </h3>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isActive = q.id === activeQuestionId;
                return (
                  <button
                    key={q.id}
                    id={`question-card-btn-${q.id}`}
                    onClick={() => handleSelectQuestion(q.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {q.category} • {q.difficulty}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                    </div>
                    <p className="text-xs font-bold line-clamp-2">{q.question}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Detail & Practice Arena */}
          {activeQuestion && (
            <div className="lg:col-span-8 space-y-6">
              
              {/* Question Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                    {activeQuestion.category} Question
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Difficulty: {activeQuestion.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {activeQuestion.question}
                </h3>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900">
                  <strong>💡 Why Interviewers Ask This:</strong> {activeQuestion.contextWhyAsked}
                </div>

                {/* STAR Method Outline */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    STAR Framework Answer Guide:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-purple-700">S (Situation):</strong> {activeQuestion.starGuide.situation}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-purple-700">T (Task):</strong> {activeQuestion.starGuide.task}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-purple-700">A (Action):</strong> {activeQuestion.starGuide.action}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-purple-700">R (Result):</strong> {activeQuestion.starGuide.result}
                    </div>
                  </div>
                </div>

                {/* Keywords to weave in */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Keywords to Weave Into Your Response:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeQuestion.keyKeywordsToInclude.map((kw, kIdx) => (
                      <span key={kIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Collapsible Sample Answer */}
                <details className="group border border-slate-200 rounded-xl bg-slate-50/50 p-3 text-xs">
                  <summary className="font-bold text-purple-700 cursor-pointer flex items-center justify-between">
                    <span>View Ideal Sample Answer</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-lg border border-slate-200">
                    {activeQuestion.sampleAnswer}
                  </p>
                </details>

              </div>

              {/* Practice & Evaluate Answer Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" /> Practice Your Answer & Get AI Feedback
                </h3>

                <textarea
                  id="user-practice-answer-input"
                  value={userAnswerText}
                  onChange={(e) => setUserAnswerText(e.target.value)}
                  rows={5}
                  placeholder="Type your practice response here using the STAR method (e.g. In my previous role at Tech Corp, I was tasked with...)"
                  className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex justify-end">
                  <button
                    id="evaluate-answer-btn"
                    onClick={() => handleEvaluateAnswer(activeQuestion)}
                    disabled={evaluating || !userAnswerText}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Evaluating Your Answer...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        Evaluate My Answer with AI
                      </>
                    )}
                  </button>
                </div>

                {/* AI Answer Evaluation Output */}
                {evalResult && (
                  <div className="mt-6 p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-purple-600" /> Answer Quality Score
                      </span>
                      <span className="text-2xl font-extrabold text-purple-900 bg-white px-3 py-1 rounded-xl border border-purple-300">
                        {evalResult.score}/100
                      </span>
                    </div>

                    <p className="text-xs text-purple-950 font-medium leading-relaxed">
                      {evalResult.feedback}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 text-emerald-900 space-y-1">
                        <strong className="block text-emerald-700 font-bold">✓ What You Did Well:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {evalResult.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-amber-200 text-amber-900 space-y-1">
                        <strong className="block text-amber-700 font-bold">⚠ Areas for Improvement:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {evalResult.areasToImprove.map((a, idx) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-purple-200 text-xs space-y-1">
                      <strong className="block text-purple-800 font-bold">⭐ Exemplary Answer Rewrite:</strong>
                      <p className="text-slate-800 leading-relaxed font-mono">{evalResult.modelAnswerSuggestion}</p>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
