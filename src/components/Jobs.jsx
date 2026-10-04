import React, { useState, useMemo } from 'react';
import {
  Briefcase, MapPin, Clock, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, FileText, ArrowRight,
  SlidersHorizontal, X, Star, Sparkles, GraduationCap,
  FolderGit2, Award, Lightbulb, Check, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { JOB_LISTINGS } from '../data/jobs';


import { rankJobsForCandidate, getMatchCategory } from '../utils/jobMatcher';

const cn = (...inputs) => twMerge(clsx(inputs));



// ── Circular Score Ring ───────────────────────────────────────
const ScoreRing = ({ score, size = 56 }) => {
  const { color, ringColor } = getMatchCategory(score);
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-xs font-bold leading-none", color)}>{score}%</span>
        <span className="text-[9px] text-muted leading-tight mt-0.5">Match</span>
      </div>
    </div>
  );
};

// ── Detailed Candidate vs Job Comparison Modal ────────────────
const JobDetailModal = ({ job, profile, onClose }) => {
  if (!job) return null;
  const { label, color, bg } = getMatchCategory(job.score);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md p-6 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", bg, color)}>
                <Star size={12} />
                {label} ({job.score}%)
              </span>
              <span className="text-xs text-muted">ID: #{job.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-text">{job.title}</h2>
            <p className="text-sm text-muted mt-0.5">{job.company} · {job.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <ScoreRing score={job.score} size={64} />
            <button
              onClick={onClose}
              className="text-muted hover:text-text p-2 rounded-lg bg-surface/60 hover:bg-surface border border-border transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Overview Callout */}
          <div className="bg-primary/10 border border-primary/25 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-primary text-sm">Why This Job Matches You</h4>
              <p className="text-text/90 text-sm mt-1 leading-relaxed">{job.whyItMatches}</p>
            </div>
          </div>

          {/* Section: Candidate vs Job Comparison Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text uppercase tracking-wider text-xs text-muted flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-primary" />
              Detailed Comparison: Candidate vs Job
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Experience Comparison */}
              <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Clock size={14} className="text-purple-400" /> Experience
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    {job.experienceScore}%
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted">Job Requirement:</span>
                    <span className="font-medium text-text">{job.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Candidate Detected:</span>
                    <span className="font-medium text-text">
                      {profile.experienceYears > 0 ? `${profile.experienceYears} year(s)` : "Entry level / Not specified"}
                    </span>
                  </div>
                  <p className="text-xs text-muted/90 pt-1 italic">{job.experienceStatus}</p>
                </div>
              </div>

              {/* Education Comparison */}
              <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-emerald-400" /> Education
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {job.educationScore}%
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted">Job Requirement:</span>
                    <span className="font-medium text-text capitalize">{job.education} Degree</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Candidate Detected:</span>
                    <span className="font-medium text-text capitalize">{profile.education}</span>
                  </div>
                  <p className="text-xs text-muted/90 pt-1 italic">{job.educationStatus}</p>
                </div>
              </div>
            </div>

            {/* Projects Comparison */}
            <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <FolderGit2 size={14} className="text-blue-400" /> Projects & Practical Experience
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  {job.projectScore}%
                </span>
              </div>
              {profile.projects && profile.projects.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted">Detected Resume Projects:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.projects.map((proj, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface border border-border rounded-lg text-xs text-text font-medium flex items-center gap-1.5">
                        <FolderGit2 size={12} className="text-primary" /> {proj}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">
                  No dedicated project section explicitly titled in resume, but foundational coursework and practical skills were evaluated.
                </p>
              )}
            </div>
          </div>

          {/* Matching Skills */}
          <div>
            <h4 className="font-semibold mb-2.5 text-xs text-muted uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Matching Skills ({job.matchedSkills.length} of {job.requiredSkills.length} Required)
            </h4>
            {job.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Check size={12} className="text-emerald-400" /> {s}
                  </span>
                ))}
                {job.matchedPreferred?.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Star size={12} className="text-blue-400" /> {s} (Preferred)
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No direct overlap with required skills detected.</p>
            )}
          </div>

          {/* Missing Skills */}
          {job.missingSkills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2.5 text-xs text-muted uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-400" />
                Missing Required Skills ({job.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <AlertCircle size={12} className="text-rose-400" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {job.strengths && job.strengths.length > 0 && (
            <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2">
              <h4 className="font-semibold text-xs text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-yellow-400" /> Candidate Strengths for this Role
              </h4>
              <ul className="space-y-1 text-sm text-text/90">
                {job.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {job.recommendations && job.recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-surface/50 border border-border space-y-2">
              <h4 className="font-semibold text-xs text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={14} className="text-primary" /> Personalized Recommendations
              </h4>
              <ul className="space-y-1.5 text-sm text-text/90">
                {job.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* About the Role */}
          <div className="pt-2 border-t border-border">
            <h4 className="font-semibold text-xs text-muted uppercase tracking-wider mb-2">Job Description</h4>
            <p className="text-sm text-text/80 leading-relaxed">{job.description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-surface/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-muted hover:text-text hover:bg-surface transition-colors"
          >
            Close
          </button>
          <a
            href="#apply"
            onClick={(e) => {
              e.preventDefault();
              showToast('Application started successfully!');
            }}
            className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
          >
            Apply for Role <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Job Card ──────────────────────────────────────────────────
const JobCard = ({ job, onViewMatch, rankNumber }) => {
  const { label, color, bg } = getMatchCategory(job.score);

  return (
    <div className="glass-panel overflow-hidden hover:border-primary/40 transition-all duration-200 flex flex-col justify-between">
      <div className="p-5 space-y-4">
        {/* Top bar: Rank, Title, Company, Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary font-extrabold text-base flex-shrink-0">
              #{rankNumber}
            </div>
            <div>
              <h3 className="text-base font-bold text-text leading-snug">{job.title}</h3>
              <p className="text-xs text-muted mt-0.5">{job.company} · {job.location}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", bg, color)}>
                  {label}
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock size={12} /> {job.experience}
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Briefcase size={12} /> {job.type}
                </span>
              </div>
            </div>
          </div>
          <ScoreRing score={job.score} size={54} />
        </div>

        {/* Why it matches */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
          <p className="text-xs text-primary font-semibold mb-1">Why it matches:</p>
          <p className="text-xs text-text/80 leading-relaxed italic">"{job.whyItMatches}"</p>
        </div>

        {/* Matching Skills */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> Matching Skills:
            </span>
            <span className="text-muted text-[11px]">
              {job.matchedSkills.length} of {job.requiredSkills.length} required
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.matchedSkills.length > 0 ? (
              job.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded text-xs flex items-center gap-1"
                >
                  <Check size={11} className="text-emerald-400" /> {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted italic">None detected</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        {job.missingSkills.length > 0 && (
          <div>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 mb-1.5">
              <AlertTriangle size={13} /> Missing Skills:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {job.missingSkills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded text-xs flex items-center gap-1"
                >
                  ⚠ {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-3 border-t border-border/80 bg-surface/30 flex items-center justify-between gap-2">
        <div className="text-xs text-muted">
          <span className="text-text font-medium">{job.requiredSkills.length}</span> required skills
        </div>
        <button
          onClick={() => onViewMatch(job)}
          className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 rounded-lg font-semibold"
        >
          View Match <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Main Jobs Component ───────────────────────────────────────
const FILTER_OPTIONS = [
  { id: "all",       label: "All Jobs" },
  { id: "excellent", label: "Excellent Match", min: 90 },
  { id: "strong",    label: "Strong Match",    min: 75, max: 89 },
  { id: "good",      label: "Good Match",      min: 60, max: 74 },
];

const SORT_OPTIONS = [
  { id: "best",  label: "Best Match" },
  { id: "worst", label: "Lowest Match" },
  { id: "title", label: "Job Title" },
];

const Jobs = ({ candidateProfile, setActiveTab, showToast }) => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("best");
  const [selectedJob, setSelectedJob] = useState(null);

  // 1. Calculate REAL match scores for every job against candidate profile
  const rankedJobs = useMemo(() => {
    if (!candidateProfile) return [];
    return rankJobsForCandidate(JOB_LISTINGS, candidateProfile);
  }, [candidateProfile]);

  // 2. Filter & Sort
  const displayedJobs = useMemo(() => {
    let jobs = [...rankedJobs];

    // Filter
    const opt = FILTER_OPTIONS.find((o) => o.id === filter);
    if (opt && opt.min !== undefined) {
      jobs = jobs.filter((j) => j.score >= opt.min && (opt.max === undefined || j.score <= opt.max));
    }

    // Sort
    if (sort === "best") {
      jobs.sort((a, b) => b.score - a.score);
    } else if (sort === "worst") {
      jobs.sort((a, b) => a.score - b.score);
    } else if (sort === "title") {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    }

    return jobs;
  }, [rankedJobs, filter, sort]);

  // ── Empty State when no resume has been analyzed ────────────
  if (!candidateProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 animate-fade-in max-w-xl mx-auto">
        <div className="h-20 w-20 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary shadow-lg">
          <Briefcase size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text">
            Analyze your resume first to get personalized job recommendations.
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Upload your resume on the Analyze page. Our AI matching engine will extract your skills, education, and experience to calculate real-time match scores against active software engineering roles.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="btn-primary px-6 py-3 text-base flex items-center gap-2 shadow-lg"
        >
          <FileText size={18} />
          Analyze Resume
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">
              Recommended Jobs For You
            </h1>
            <p className="text-muted text-sm mt-1">
              Based on your resume and detected skills
            </p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs text-muted hover:text-text px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface/80 transition-colors flex items-center gap-1.5"
          >
            <FileText size={14} /> Re-analyze Another Resume
          </button>
        </div>

        {/* Candidate Profile Summary Banner */}
        <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text flex items-center gap-1">
              <Sparkles size={13} className="text-primary" /> Profile Snapshot:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
              {candidateProfile.skills?.length || 0} skills detected
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-muted">
              {candidateProfile.experienceYears > 0 ? `${candidateProfile.experienceYears} yr(s) exp` : "Experience unstated"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-muted capitalize">
              {candidateProfile.education !== "unknown" ? candidateProfile.education : "Education unstated"}
            </span>
            {candidateProfile.roles && candidateProfile.roles.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Role: {candidateProfile.roles[0]}
              </span>
            )}
          </div>
          <div className="text-muted">
            Scores dynamically calculated against {JOB_LISTINGS.length} curated roles
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Match Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((opt) => {
            const count = opt.id === "all"
              ? rankedJobs.length
              : rankedJobs.filter((j) => j.score >= opt.min && (opt.max === undefined || j.score <= opt.max)).length;

            return (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5",
                  filter === opt.id
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-surface border-border text-muted hover:text-text hover:border-primary/40"
                )}
              >
                {opt.label}
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  filter === opt.id ? "bg-white/20 text-white" : "bg-surface border border-border text-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <SlidersHorizontal size={14} className="text-muted" />
          <span className="text-muted font-medium mr-1">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSort(opt.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                sort === opt.id
                  ? "bg-surface border-primary/50 text-text font-semibold shadow-sm"
                  : "border-transparent text-muted hover:text-text hover:bg-surface/40"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Showing results count */}
      <div className="text-xs text-muted flex items-center justify-between">
        <span>Showing {displayedJobs.length} of {rankedJobs.length} ranked positions</span>
        <span className="text-[11px] text-muted">
          Ranking: Highest real match score ({rankedJobs[0]?.score || 0}%) to lowest ({rankedJobs[rankedJobs.length - 1]?.score || 0}%)
        </span>
      </div>

      {/* Job Grid */}
      {displayedJobs.length === 0 ? (
        <div className="glass-panel text-center py-16 px-4 rounded-2xl border border-border space-y-3">
          <p className="text-base font-semibold text-text">No jobs found in this category.</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try selecting "All Jobs" or expanding your resume with additional technical skills to qualify for higher match tiers.
          </p>
          <button
            onClick={() => setFilter("all")}
            className="text-xs text-primary font-medium hover:underline pt-2"
          >
            Show All Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedJobs.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              rankNumber={index + 1}
              onViewMatch={setSelectedJob}
            />
          ))}
        </div>
      )}

      {/* Detected Skills Drawer */}
      {candidateProfile.skills && candidateProfile.skills.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
              Detected Resume Skills ({candidateProfile.skills.length})
            </h3>
            <span className="text-[11px] text-muted">Extracted from your resume</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidateProfile.skills.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          profile={candidateProfile}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* Application Form Modal */}
      
    </div>
  );
};

export default Jobs;
