import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Results from './components/Results';
import LoadingState from './components/LoadingState';
import Jobs from './components/Jobs';
import About from './components/About';

const PROFILE_KEY = 'matchai_candidate_profile';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(() => { try { const stored = sessionStorage.getItem('analysisResults'); return stored ? JSON.parse(stored) : null; } catch { return null; } });
  const [candidateProfile, setCandidateProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  // Toast state for brief notifications
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load persisted analysis results on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('analysisResults');
      if (stored) {
        setResults(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Persist results when they change
  useEffect(() => {
    if (results) {
      try {
        sessionStorage.setItem('analysisResults', JSON.stringify(results));
      } catch {}
    }
  }, [results]);

  const saveCandidateProfile = (profile) => {
    setCandidateProfile(profile);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  };

  const handleAnalyze = async (resumeFile, jobDescription) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze resume.');
      }

      const mappedResults = {
        overallMatch: data.matchScore,
        skillsMatch: data.breakdown?.skills || 0,
        experienceMatch: data.breakdown?.experience || 0,
        educationMatch: data.breakdown?.education || 0,
        projectMatch: data.breakdown?.projects || 0,
        matchingSkills: data.matchedSkills || [],
        missingSkills: data.missingSkills || [],
        explanation: data.explanation || 'No explanation provided.',
        recommendations: data.recommendations || [],
        analysisMode: data.analysisMode || 'local',
        jobTitle: data.jobTitle || '',
      };

  

  

      // Build and persist the candidate profile for the Jobs page
      saveCandidateProfile({
        skills:          data.candidateSkills || data.matchedSkills || [],
        technologies:    data.candidateSkills || data.matchedSkills || [],
        education:       data.candidateEducation || 'unknown',
        experienceYears: data.candidateExperienceYears || 0,
        experience:      data.candidateExperienceYears > 0 ? `${data.candidateExperienceYears} year(s)` : 'Not specified',
        projects:        data.candidateProjects || [],
        certifications:  data.candidateCertifications || [],
        roles:           data.candidateRoles || [],
        analyzedJobTitle: data.jobTitle || '',
        lastAnalyzedAt:  new Date().toISOString(),
      });

      setResults(mappedResults);
      sessionStorage.setItem('analysisResults', JSON.stringify(mappedResults));
      setActiveTab('analyze');
    } catch (error) {
      console.error('Analysis error:', error);
      showToast('Error during analysis: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
  setResults(null);
  sessionStorage.removeItem('analysisResults');
  setActiveTab('dashboard');
};

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} hasProfile={!!candidateProfile} showToast={showToast} />
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === 'dashboard' && !isAnalyzing && (
          <Dashboard onAnalyze={handleAnalyze} candidateProfile={candidateProfile} />
        )}

        {isAnalyzing && <LoadingState />}

        {activeTab === 'analyze' && !isAnalyzing && (
          <Results 
            results={results} 
            onReset={handleReset} 
            onViewJobs={() => setActiveTab('jobs')}
          />
        )}

        {activeTab === 'jobs' && (
          <Jobs candidateProfile={candidateProfile} setActiveTab={setActiveTab} showToast={showToast} />
        )}

        {activeTab === 'about' && <About />}
      </main>
    </div>
  );
}

export default App;
