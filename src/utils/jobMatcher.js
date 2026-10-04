// ── Client-side Job Matcher ───────────────────────────────────
// Compares a candidate profile (from analysis) against each job.
// Returns real scores and insights that change depending on the resume.

const EDUCATION_RANK = { phd: 4, masters: 3, bachelors: 2, diploma: 1, none: 0, unknown: 1 };

const clamp = (n) => Math.min(100, Math.max(0, Math.round(n)));

/** Calculate a match score and detailed comparison for one job given the candidate profile. */
export const scoreJobForCandidate = (job, profile) => {
  const candidateSkills = (profile.skills || []).map((s) => s.trim());
  const required = job.requiredSkills || [];
  const preferred = job.preferredSkills || [];

  // ── Skill score ────────────────────────────────────────────
  const matchedRequired = required.filter((s) =>
    candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const matchedPreferred = preferred.filter((s) =>
    candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missingRequired = required.filter(
    (s) => !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );
  const missingPreferred = preferred.filter(
    (s) => !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  // Required skills have 80% weight, preferred have 20%
  const reqScore = required.length > 0 ? (matchedRequired.length / required.length) * 80 : 80;
  const prefScore = preferred.length > 0 ? (matchedPreferred.length / preferred.length) * 20 : 10;
  const skillsScore = clamp(reqScore + prefScore);

  // ── Experience score ───────────────────────────────────────
  const candidateYears = profile.experienceYears || 0;
  const jobYears = job.experienceYears || 0;
  let experienceScore = 75;
  let experienceStatus = "Aligned";

  if (jobYears > 0 && candidateYears > 0) {
    const ratio = candidateYears / jobYears;
    if (ratio >= 1) {
      experienceScore = clamp(85 + (ratio - 1) * 10);
      experienceStatus = "Meets or Exceeds Requirement";
    } else {
      experienceScore = clamp(ratio * 80);
      experienceStatus = "Slight Experience Gap";
    }
  } else if (candidateYears === 0 && jobYears === 0) {
    experienceScore = 80;
    experienceStatus = "Entry Level / Open";
  } else if (candidateYears === 0) {
    experienceScore = 60;
    experienceStatus = "Not Explicitly Detected";
  }

  // ── Education score ────────────────────────────────────────
  const candidateEdu = (profile.education || "unknown").toLowerCase();
  const jobEdu = (job.education || "bachelors").toLowerCase();
  const candidateEduRank = EDUCATION_RANK[candidateEdu] ?? 1;
  const jobEduRank = EDUCATION_RANK[jobEdu] ?? 2;
  let educationScore = 100;
  let educationStatus = "Matches Requirement";

  if (candidateEduRank >= jobEduRank) {
    educationScore = 100;
    educationStatus = "Meets or Exceeds Degree Requirement";
  } else if (candidateEduRank === jobEduRank - 1) {
    educationScore = 70;
    educationStatus = "Comparable Qualification";
  } else {
    educationScore = 50;
    educationStatus = "Below Recommended Degree";
  }

  // ── Project relevance score ────────────────────────────────
  const candidateProjects = profile.projects || [];
  const candidateRoles = profile.roles || [];
  let projectScore = 70;
  if (candidateProjects.length > 0) {
    projectScore = 85;
  }

  // ── Overall weighted score ─────────────────────────────────
  const overall = clamp(
    skillsScore * 0.55 +
    experienceScore * 0.25 +
    educationScore * 0.10 +
    projectScore * 0.10
  );

  // ── Dynamic "Why It Matches" explanation ───────────────────
  let whyItMatches = "";
  const matchedLow = matchedRequired.map((s) => s.toLowerCase());
  const hasFrontend = matchedLow.some((s) => ["react", "angular", "vue.js", "html", "css", "javascript"].includes(s));
  const hasBackend = matchedLow.some((s) => ["node.js", "express.js", "java", "spring boot", "python", "django", "flask"].includes(s));
  const hasDb = matchedLow.some((s) => ["sql", "mysql", "mongodb", "postgresql"].includes(s));
  const hasDevops = matchedLow.some((s) => ["docker", "kubernetes", "aws", "git", "ci/cd"].includes(s));

  if (hasFrontend && hasBackend && hasDb) {
    whyItMatches = "Your resume strongly matches the frontend, backend, and database requirements of this role.";
  } else if (hasFrontend && hasBackend) {
    whyItMatches = "Your background demonstrates hands-on capabilities across both frontend and backend technologies needed for this position.";
  } else if (hasFrontend) {
    whyItMatches = `Your profile aligns closely with the core UI/UX stack (${matchedRequired.slice(0, 3).join(", ")}) required for this role.`;
  } else if (hasBackend) {
    whyItMatches = `Your resume highlights solid backend and systems experience with ${matchedRequired.slice(0, 3).join(", ")}.`;
  } else if (hasDevops) {
    whyItMatches = `Your technical profile shows relevant infrastructure, tooling, and pipeline skills (${matchedRequired.slice(0, 3).join(", ")}).`;
  } else if (matchedRequired.length > 0) {
    whyItMatches = `Your resume matches ${matchedRequired.length} key requirement${matchedRequired.length > 1 ? "s" : ""} for this role (${matchedRequired.join(", ")}).`;
  } else {
    whyItMatches = "This role presents a growth opportunity with adjacent software development skills.";
  }

  // ── Strengths ──────────────────────────────────────────────
  const strengths = [];
  if (matchedRequired.length > 0) {
    strengths.push(`Direct match on essential skills: ${matchedRequired.slice(0, 4).join(", ")}`);
  }
  if (matchedPreferred.length > 0) {
    strengths.push(`Bonus preferred qualification: ${matchedPreferred.join(", ")}`);
  }
  if (experienceScore >= 80) {
    strengths.push(`Experience level (${candidateYears > 0 ? candidateYears + " yrs" : "entry-level"}) aligns well with the ${job.experience} requirement.`);
  }
  if (candidateEduRank >= jobEduRank && candidateEdu !== "unknown") {
    strengths.push(`Formal education (${profile.education}) satisfies job criteria.`);
  }
  if (candidateProjects.length > 0) {
    strengths.push(`${candidateProjects.length} relevant project highlight(s) documented.`);
  }

  // ── Recommendations ────────────────────────────────────────
  const recommendations = [];
  if (missingRequired.length > 0) {
    recommendations.push(`Prioritize mastering required skill(s): ${missingRequired.slice(0, 3).join(", ")}.`);
  }
  if (missingPreferred.length > 0) {
    recommendations.push(`Pick up preferred technology: ${missingPreferred.slice(0, 2).join(", ")} to stand out among candidates.`);
  }
  if (experienceScore < 75 && jobYears > 0) {
    recommendations.push(`Demonstrate depth by building a production-grade portfolio project targeting ${job.title} responsibilities.`);
  }
  if (recommendations.length === 0) {
    recommendations.push("Your profile is a top-tier fit for this position. Customize your cover letter to emphasize your matching projects.");
  }

  return {
    score: overall,
    skillsScore,
    experienceScore,
    educationScore,
    projectScore,
    matchedSkills: matchedRequired,
    matchedPreferred,
    missingSkills: missingRequired,
    missingPreferred,
    whyItMatches,
    strengths,
    recommendations,
    experienceStatus,
    educationStatus,
    candidateYears,
    candidateEdu: profile.education || "Not specified",
    candidateProjects,
  };
};

/** Score all jobs and return them sorted by score descending. */
export const rankJobsForCandidate = (jobs, profile) => {
  return jobs
    .map((job) => ({
      ...job,
      ...scoreJobForCandidate(job, profile),
    }))
    .sort((a, b) => b.score - a.score);
};

/** Return the match category label and colour classes for a score. */
export const getMatchCategory = (score) => {
  if (score >= 90) {
    return {
      label: "Excellent Match",
      badgeText: "90–100% Match",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/30",
      ringColor: "#34d399",
    };
  }
  if (score >= 75) {
    return {
      label: "Strong Match",
      badgeText: "75–89% Match",
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/30",
      ringColor: "#60a5fa",
    };
  }
  if (score >= 60) {
    return {
      label: "Good Match",
      badgeText: "60–74% Match",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/30",
      ringColor: "#facc15",
    };
  }
  if (score >= 40) {
    return {
      label: "Partial Match",
      badgeText: "40–59% Match",
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/30",
      ringColor: "#fb923c",
    };
  }
  return {
    label: "Low Match",
    badgeText: "0–39% Match",
    color: "text-rose-400",
    bg: "bg-rose-400/10 border-rose-400/30",
    ringColor: "#f43f5e",
  };
};
