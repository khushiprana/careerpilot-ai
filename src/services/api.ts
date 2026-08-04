import {
  ResumeReviewResult,
  AtsCheckResult,
  RoadmapResult,
  InterviewQuestion,
  InterviewEvaluationResult,
  CoverLetterResult,
  ProjectRecommendation,
  ChatMessage
} from '../types';

export async function checkServerHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return await res.json();
}

export async function extractPdfText(file: File): Promise<{ text: string; fileName: string }> {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch('/api/extract-pdf', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to extract text from PDF');
  }
  return data;
}

export async function fetchResumeReview(
  resumeText: string,
  targetRole: string,
  experienceLevel: string
): Promise<ResumeReviewResult> {
  const res = await fetch('/api/resume-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, targetRole, experienceLevel }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch resume review');
  return data;
}

export async function fetchAtsCheck(
  resumeText: string,
  jobDescription: string,
  targetRole: string
): Promise<AtsCheckResult> {
  const res = await fetch('/api/ats-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jobDescription, targetRole }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch ATS check');
  return data;
}

export async function fetchRoadmap(
  targetGoal: string,
  currentLevel: string,
  weeklyHours: number,
  timeframeWeeks: number,
  resumeText?: string
): Promise<RoadmapResult> {
  const res = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetGoal, currentLevel, weeklyHours, timeframeWeeks, resumeText }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch roadmap');
  return data;
}

export async function fetchInterviewQuestions(
  targetRole: string,
  interviewType: string,
  resumeText?: string
): Promise<{ questions: InterviewQuestion[] }> {
  const res = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetRole, interviewType, action: 'generate', resumeText }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch interview questions');
  return data;
}

export async function evaluateInterviewAnswer(
  targetRole: string,
  questionToEvaluate: string,
  userAnswer: string,
  resumeText?: string
): Promise<InterviewEvaluationResult> {
  const res = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetRole,
      action: 'evaluate_answer',
      questionToEvaluate,
      userAnswer,
      resumeText,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to evaluate interview answer');
  return data;
}

export async function fetchCoverLetter(
  resumeText: string,
  jobDescription: string,
  targetRole: string,
  companyName: string,
  tone: string,
  focusAreas?: string
): Promise<CoverLetterResult> {
  const res = await fetch('/api/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jobDescription, targetRole, companyName, tone, focusAreas }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate cover letter');
  return data;
}

export async function fetchProjectSuggestions(
  targetGoal: string,
  techStack: string,
  difficulty: string,
  resumeText?: string
): Promise<{ projects: ProjectRecommendation[] }> {
  const res = await fetch('/api/project-suggestion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetGoal, techStack, difficulty, resumeText }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch project suggestions');
  return data;
}

export async function streamCareerChat(
  messages: ChatMessage[],
  userContext: any,
  onChunk: (textChunk: string) => void,
  onDone: () => void,
  onError: (err: any) => void
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userContext }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Chat request failed');
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Response body reader not available');

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const rawData = trimmed.slice(6);
          if (rawData === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // Ignore json parse error for partial lines
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
}
