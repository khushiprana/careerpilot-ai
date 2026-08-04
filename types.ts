export interface ResumeData {
  text: string;
  fileName?: string;
  parsedAt?: string;
}

export interface UserTarget {
  role: string;
  jobDescription: string;
  experienceLevel: 'Entry' | 'Mid-Level' | 'Senior' | 'Executive';
  industry: string;
  weeklyHours: number;
}

export interface ResumeReviewResult {
  overallScore: number;
  summary: string;
  keyStrengths: string[];
  criticalWeaknesses: string[];
  sectionFeedback: {
    section: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  bulletPointImprovements: {
    original: string;
    improved: string;
    reason: string;
  }[];
  formattingAdvice: string[];
}

export interface AtsCheckResult {
  matchScore: number;
  matchLevel: 'High' | 'Medium' | 'Low';
  summary: string;
  matchedHardSkills: string[];
  missingHardSkills: string[];
  matchedSoftSkills: string[];
  missingSoftSkills: string[];
  keywordDensityNotes: string;
  atsFormattingCheck: {
    item: string;
    status: 'pass' | 'warning' | 'fail';
    note: string;
  }[];
  actionableOptimizations: string[];
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  goal: string;
  topics: string[];
  dailyTasks: string[];
  recommendedResources: {
    title: string;
    type: 'Documentation' | 'Course' | 'Tutorial' | 'Practice';
    url: string;
  }[];
  milestoneProject: string;
}

export interface RoadmapResult {
  role: string;
  level: string;
  totalWeeks: number;
  overview: string;
  weeks: RoadmapWeek[];
}

export interface InterviewQuestion {
  id: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'System Design';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  contextWhyAsked: string;
  starGuide: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  sampleAnswer: string;
  keyKeywordsToInclude: string[];
}

export interface InterviewEvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  modelAnswerSuggestion: string;
}

export interface CoverLetterResult {
  applicantName: string;
  targetCompany: string;
  targetRole: string;
  coverLetterText: string;
  keyHighlights: string[];
  tipsForCustomization: string[];
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: string;
  techStack: string[];
  problemStatement: string;
  keyFeatures: string[];
  architectureOverview: string;
  portfolioPresentationTips: string;
  resumeBulletPoints: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
