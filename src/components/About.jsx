import React from 'react';
import { Sparkles, Shield, Cpu, Zap, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
          <Sparkles size={14} />
          About MatchAI
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Next-Generation AI Resume & Job Matching
        </h1>
        <p className="text-muted max-w-2xl mx-auto">
          MatchAI bridges the gap between candidates and opportunities using intelligent skill extraction, semantic matching, and personalized job recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Cpu size={20} />
          </div>
          <h3 className="font-bold text-lg">Intelligent Parsing</h3>
          <p className="text-muted text-sm leading-relaxed">
            Extracts technical skills, years of experience, education degrees, and project achievements from PDF and DOCX files.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-lg">Dual Matching Engine</h3>
          <p className="text-muted text-sm leading-relaxed">
            Powered by Google Gemini AI with seamless offline local fallback matching algorithms when no API key is set.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <h3 className="font-bold text-lg">Personalized Jobs</h3>
          <p className="text-muted text-sm leading-relaxed">
            Real-time ranked job listings calculated specifically against your candidate profile, skill gaps, and strengths.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-bold text-lg">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-text">1. Resume Analysis</p>
              <p className="text-muted text-xs">Upload your resume to extract candidate attributes and compare against any role.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-text">2. Profile Extraction</p>
              <p className="text-muted text-xs">Skills, education, and experience are extracted and persisted in your browser profile.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-text">3. Dynamic Job Ranking</p>
              <p className="text-muted text-xs">Every job is evaluated with real mathematical match scoring tailored to you.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-text">4. Actionable Insights</p>
              <p className="text-muted text-xs">Identify missing skills and recommendations to boost your candidacy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
