import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumeReviewPage } from './pages/ResumeReviewPage';
import { AtsCheckerPage } from './pages/AtsCheckerPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { InterviewCoachPage } from './pages/InterviewCoachPage';
import { CoverLetterPage } from './pages/CoverLetterPage';
import { ProjectRecommendationsPage } from './pages/ProjectRecommendationsPage';
import { CareerChatPage } from './pages/CareerChatPage';

export default function App() {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return localStorage.getItem('careerpilot_active_tab') || 'landing';
  });

  const [resumeText, setResumeTextState] = useState<string>(() => {
    return localStorage.getItem('careerpilot_resume_text') || '';
  });

  const [fileName, setFileName] = useState<string>(() => {
    return localStorage.getItem('careerpilot_filename') || '';
  });

  const [targetRole, setTargetRoleState] = useState<string>(() => {
    return localStorage.getItem('careerpilot_target_role') || '';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('careerpilot_active_tab', tab);
  };

  const setResumeText = (text: string) => {
    setResumeTextState(text);
    localStorage.setItem('careerpilot_resume_text', text);
  };

  const setTargetRole = (role: string) => {
    setTargetRoleState(role);
    localStorage.setItem('careerpilot_target_role', role);
  };

  const handleResetSession = () => {
    setResumeTextState('');
    setFileName('');
    setTargetRoleState('');

    const keysToRemove = [
      'careerpilot_resume_text',
      'careerpilot_filename',
      'careerpilot_target_role',
      'careerpilot_active_tab',
      'careerpilot_review_exp_level',
      'careerpilot_review_result',
      'careerpilot_ats_job_desc',
      'careerpilot_ats_result',
      'careerpilot_roadmap_level',
      'careerpilot_roadmap_hours',
      'careerpilot_roadmap_weeks',
      'careerpilot_roadmap_result',
      'careerpilot_interview_category',
      'careerpilot_interview_questions',
      'careerpilot_interview_active_q_id',
      'careerpilot_interview_user_answer',
      'careerpilot_interview_eval_result',
      'careerpilot_interview_eval_map',
      'careerpilot_cl_job_desc',
      'careerpilot_cl_company',
      'careerpilot_cl_tone',
      'careerpilot_cl_focus',
      'careerpilot_cl_result',
      'careerpilot_cl_editable_text',
      'careerpilot_projects_tech_stack',
      'careerpilot_projects_difficulty',
      'careerpilot_projects_list',
      'careerpilot_chat_messages'
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    window.dispatchEvent(new Event('careerpilot_reset_session'));

    setActiveTabState('landing');
  };

  useEffect(() => {
    if (fileName) {
      localStorage.setItem('careerpilot_filename', fileName);
    } else {
      localStorage.removeItem('careerpilot_filename');
    }
  }, [fileName]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-cyan-200 selection:text-cyan-900">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetRole={targetRole}
        hasResume={Boolean(resumeText)}
        onResetSession={handleResetSession}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={activeTab === 'landing' ? 'block' : 'hidden'}>
          <LandingPage
            setActiveTab={setActiveTab}
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            onResetSession={handleResetSession}
          />
        </div>

        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <DashboardPage
            setActiveTab={setActiveTab}
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            fileName={fileName}
            onResetSession={handleResetSession}
          />
        </div>

        <div className={activeTab === 'resume-review' ? 'block' : 'hidden'}>
          <ResumeReviewPage
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            onResetSession={handleResetSession}
          />
        </div>

        <div className={activeTab === 'ats-checker' ? 'block' : 'hidden'}>
          <AtsCheckerPage
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            onResetSession={handleResetSession}
          />
        </div>

        <div className={activeTab === 'roadmap' ? 'block' : 'hidden'}>
          <RoadmapPage
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
          />
        </div>

        <div className={activeTab === 'interview' ? 'block' : 'hidden'}>
          <InterviewCoachPage
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
          />
        </div>

        <div className={activeTab === 'cover-letter' ? 'block' : 'hidden'}>
          <CoverLetterPage
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
          />
        </div>

        <div className={activeTab === 'projects' ? 'block' : 'hidden'}>
          <ProjectRecommendationsPage
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
          />
        </div>

        <div className={activeTab === 'chat' ? 'block' : 'hidden'}>
          <CareerChatPage
            resumeText={resumeText}
            targetRole={targetRole}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}
