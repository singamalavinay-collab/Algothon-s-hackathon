// ============================================================
//  Local Matching Engine — Fallback when Gemini is unavailable
//  Performs real text-based analysis of resume vs job description
// ============================================================

// ── Skill Dictionary ─────────────────────────────────────────
const SKILL_DICTIONARY = [
  // Languages
  { name: "Java",           aliases: ["java"] },
  { name: "JavaScript",     aliases: ["javascript", "js", "es6", "es2015", "ecmascript"] },
  { name: "TypeScript",     aliases: ["typescript", "ts"] },
  { name: "Python",         aliases: ["python", "py"] },
  { name: "C",              aliases: [" c ", " c,", " c.", "(c)", "/c", "c/"] },
  { name: "C++",            aliases: ["c++", "cpp", "c plus plus"] },
  { name: "C#",             aliases: ["c#", "csharp", "c sharp"] },
  { name: "Go",             aliases: [" go ", "golang"] },
  { name: "Rust",           aliases: ["rust"] },
  { name: "Kotlin",         aliases: ["kotlin"] },
  { name: "Swift",          aliases: ["swift"] },
  { name: "PHP",            aliases: ["php"] },
  { name: "Ruby",           aliases: ["ruby", "ruby on rails", "rails"] },
  { name: "Scala",          aliases: ["scala"] },
  { name: "R",              aliases: [" r ", " r,", " r."] },

  // Frontend
  { name: "React",          aliases: ["react", "reactjs", "react.js"] },
  { name: "Angular",        aliases: ["angular", "angularjs"] },
  { name: "Vue.js",         aliases: ["vue", "vuejs", "vue.js"] },
  { name: "Next.js",        aliases: ["next.js", "nextjs"] },
  { name: "HTML",           aliases: ["html", "html5"] },
  { name: "CSS",            aliases: ["css", "css3", "scss", "sass", "styled-components", "tailwind"] },
  { name: "Redux",          aliases: ["redux", "redux-toolkit"] },

  // Backend
  { name: "Node.js",        aliases: ["node.js", "nodejs", "node js"] },
  { name: "Express.js",     aliases: ["express", "express.js", "expressjs"] },
  { name: "Spring Boot",    aliases: ["spring boot", "spring", "springboot"] },
  { name: "Django",         aliases: ["django"] },
  { name: "Flask",          aliases: ["flask"] },
  { name: "FastAPI",        aliases: ["fastapi"] },
  { name: "REST API",       aliases: ["rest api", "restful", "rest", "api", "graphql"] },

  // Databases
  { name: "SQL",            aliases: ["sql"] },
  { name: "MySQL",          aliases: ["mysql"] },
  { name: "PostgreSQL",     aliases: ["postgresql", "postgres"] },
  { name: "MongoDB",        aliases: ["mongodb", "mongo"] },
  { name: "Redis",          aliases: ["redis"] },
  { name: "SQLite",         aliases: ["sqlite"] },
  { name: "Oracle",         aliases: ["oracle"] },
  { name: "Firebase",       aliases: ["firebase"] },

  // Cloud & DevOps
  { name: "AWS",            aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"] },
  { name: "Azure",          aliases: ["azure", "microsoft azure"] },
  { name: "GCP",            aliases: ["gcp", "google cloud", "google cloud platform"] },
  { name: "Docker",         aliases: ["docker"] },
  { name: "Kubernetes",     aliases: ["kubernetes", "k8s"] },
  { name: "CI/CD",          aliases: ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci", "travis"] },
  { name: "Linux",          aliases: ["linux", "unix", "bash", "shell scripting"] },

  // Version Control
  { name: "Git",            aliases: ["git"] },
  { name: "GitHub",         aliases: ["github"] },
  { name: "GitLab",         aliases: ["gitlab"] },

  // CS Fundamentals
  { name: "Data Structures", aliases: ["data structures", "data structure"] },
  { name: "Algorithms",      aliases: ["algorithms", "algorithm"] },
  { name: "OOP",             aliases: ["oop", "object-oriented", "object oriented"] },
  { name: "System Design",   aliases: ["system design", "distributed systems"] },
  { name: "Design Patterns", aliases: ["design patterns", "design pattern"] },

  // AI/ML
  { name: "Machine Learning", aliases: ["machine learning", "ml"] },
  { name: "Deep Learning",    aliases: ["deep learning", "dl"] },
  { name: "TensorFlow",       aliases: ["tensorflow"] },
  { name: "PyTorch",          aliases: ["pytorch"] },
  { name: "scikit-learn",     aliases: ["scikit-learn", "sklearn"] },
  { name: "NLP",              aliases: ["nlp", "natural language processing"] },
  { name: "Computer Vision",  aliases: ["computer vision", "cv"] },
  { name: "Pandas",           aliases: ["pandas"] },
  { name: "NumPy",            aliases: ["numpy"] },

  // Testing
  { name: "Unit Testing",     aliases: ["unit testing", "jest", "mocha", "junit", "pytest", "testing"] },

  // Tools / Other
  { name: "Agile/Scrum",      aliases: ["agile", "scrum", "kanban", "jira"] },
  { name: "Figma",            aliases: ["figma"] },
  { name: "Postman",          aliases: ["postman"] },
  { name: "Webpack",          aliases: ["webpack", "vite"] },
  { name: "GraphQL",          aliases: ["graphql"] },
];

// ── Education Keywords ────────────────────────────────────────
const EDUCATION_KEYWORDS = {
  phd:      ["ph.d", "phd", "doctor of philosophy", "doctorate"],
  masters:  ["m.tech", "m.e", "m.s.", "msc", "m.sc", "master", "mba"],
  bachelors:["b.tech", "b.e", "b.s.", "bsc", "b.sc", "bachelor", "be ", "btech", "undergraduate"],
  diploma:  ["diploma", "associate"],
};

const EDUCATION_DEGREE_RANK = { phd: 4, masters: 3, bachelors: 2, diploma: 1, none: 0 };

// ── Experience Keywords ───────────────────────────────────────
const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)/gi,
  /experience[:\s]+(\d+)\+?\s*years?/gi,
  /(\d+)\+?\s*years?\s*(?:of\s*)?(?:work|industry|professional|relevant)/gi,
];

const YEAR_WORD_MAP = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

// ── Helpers ───────────────────────────────────────────────────
const normalise = (text) => (text || "").toLowerCase();

const extractSkills = (text) => {
  const norm = normalise(text);
  const found = [];
  for (const skill of SKILL_DICTIONARY) {
    for (const alias of skill.aliases) {
      // Use word-boundary-aware match
      const pattern = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<![a-z0-9])${pattern}(?![a-z0-9])`, "i");
      if (regex.test(norm)) {
        found.push(skill.name);
        break; // skill matched, no need to check other aliases
      }
    }
  }
  return [...new Set(found)];
};

const extractEducationLevel = (text) => {
  const norm = normalise(text);
  for (const [level, keywords] of Object.entries(EDUCATION_KEYWORDS)) {
    if (keywords.some((kw) => norm.includes(kw))) return level;
  }
  return "none";
};

const extractYearsOfExperience = (text) => {
  const norm = normalise(text);
  let maxYears = 0;
  for (const pattern of EXPERIENCE_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(norm)) !== null) {
      const num = parseInt(match[1] || match[2], 10);
      if (!isNaN(num) && num > maxYears) maxYears = num;
    }
  }
  // Also try word forms: "three years of experience"
  for (const [word, num] of Object.entries(YEAR_WORD_MAP)) {
    if (new RegExp(`${word}\\s+years?\\s+(?:of\\s+)?exp`, "i").test(norm)) {
      if (num > maxYears) maxYears = num;
    }
  }
  return maxYears;
};

const extractJobTitle = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // Look for role/title/position indicator
  const titlePatterns = [
    /(?:job\s*title|position|role)[:\s]+([^\n,]+)/i,
    /(?:looking\s+for|hiring|seeking)[:\s]+(?:a\s+)?([^\n,]+)/i,
    /(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Engineer|Developer|Analyst|Manager|Designer|Architect|Consultant|Scientist|Lead|Intern))/m,
  ];
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim().slice(0, 80);
  }
  // Fall back to first non-empty line of the job description (usually the title)
  return lines[0]?.slice(0, 80) || "Software Position";
};

// ── Additional Candidate Profile Extractors ───────────────────
const CERTIFICATION_KEYWORDS = [
  "AWS Certified", "AWS Solutions Architect", "AWS Developer", "AWS Cloud Practitioner",
  "Azure Fundamentals", "Azure Solutions Architect", "GCP Professional", "Google Cloud Certified",
  "Certified Kubernetes Administrator", "CKA", "CKAD", "Docker Certified Associate",
  "Oracle Certified", "Java SE Certified", "OCPJP", "Cisco CCNA", "CCNP", "CompTIA Security+",
  "CompTIA Network+", "Certified Scrum Master", "CSM", "PMP", "Meta Frontend Developer",
  "IBM Data Science", "Coursera", "Udemy", "HackerRank"
];

const extractCertifications = (text) => {
  const norm = normalise(text);
  const found = [];
  for (const cert of CERTIFICATION_KEYWORDS) {
    if (norm.includes(cert.toLowerCase())) {
      found.push(cert);
    }
  }
  return [...new Set(found)];
};

const extractProjects = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const projects = [];
  let inProjectSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(academic |personal )?projects?:?$/i.test(line)) {
      inProjectSection = true;
      continue;
    }
    if (inProjectSection) {
      if (/^(education|experience|skills|certifications|awards|summary|work history):?$/i.test(line)) {
        inProjectSection = false;
        break;
      }
      if ((line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.length < 60) && projects.length < 5) {
        const cleaned = line.replace(/^[•\-*#\d\.\s]+/, "").trim();
        if (cleaned.length > 5 && !cleaned.toLowerCase().startsWith("used") && !cleaned.toLowerCase().startsWith("technologies")) {
          projects.push(cleaned.slice(0, 80));
        }
      }
    }
  }

  if (projects.length === 0) {
    const projRegex = /(?:project|application)[:\s]+([^\n.,]+)/gi;
    let m;
    while ((m = projRegex.exec(text)) !== null && projects.length < 4) {
      if (m[1].trim().length > 3) projects.push(m[1].trim().slice(0, 60));
    }
  }

  return [...new Set(projects)];
};

const inferCandidateRoles = (skills = [], text = "") => {
  const roles = [];
  const sSet = new Set(skills.map((s) => s.toLowerCase()));
  
  if (sSet.has("react") && (sSet.has("node.js") || sSet.has("express.js") || sSet.has("mongodb") || sSet.has("sql"))) {
    roles.push("Junior Full Stack Developer");
  }
  if (sSet.has("react") || sSet.has("angular") || sSet.has("vue.js") || (sSet.has("html") && sSet.has("css") && sSet.has("javascript"))) {
    roles.push("Frontend Developer");
  }
  if (sSet.has("node.js") || sSet.has("express.js") || sSet.has("spring boot") || sSet.has("django") || sSet.has("flask") || (sSet.has("sql") && sSet.has("python"))) {
    roles.push("Backend Developer");
  }
  if (sSet.has("java") || sSet.has("spring boot")) {
    roles.push("Java Developer");
  }
  if (sSet.has("python") && (sSet.has("machine learning") || sSet.has("deep learning") || sSet.has("tensorflow") || sSet.has("pytorch"))) {
    roles.push("Machine Learning Engineer");
  }
  if (sSet.has("python") || (sSet.has("sql") && (sSet.has("pandas") || sSet.has("numpy")))) {
    roles.push("Data Analyst / Python Developer");
  }
  if (sSet.has("docker") || sSet.has("kubernetes") || sSet.has("aws") || sSet.has("ci/cd") || sSet.has("linux")) {
    roles.push("DevOps Engineer");
  }

  if (roles.length === 0) {
    roles.push("Software Engineer");
  }

  return [...new Set(roles)];
};

// ── Score Calculators ─────────────────────────────────────────
const scoreClamp = (n) => Math.min(100, Math.max(0, Math.round(n)));

const calcSkillsScore = (matched, required) => {
  if (required.length === 0) return 70;
  return scoreClamp((matched.length / required.length) * 100);
};

const calcEducationScore = (resumeEdu, jobEdu) => {
  const resumeRank = EDUCATION_DEGREE_RANK[resumeEdu] ?? 0;
  const jobRank = EDUCATION_DEGREE_RANK[jobEdu] ?? 0;
  if (jobRank === 0) return 90; // Not specified
  if (resumeRank >= jobRank) return 100;
  if (resumeRank === jobRank - 1) return 70;
  return 50;
};

const calcExperienceScore = (resumeYears, jobYears) => {
  if (jobYears === 0) return 80; // Not explicitly required
  if (resumeYears === 0) return 60; // Resume didn't state years clearly
  const ratio = resumeYears / jobYears;
  if (ratio >= 1) return Math.min(100, scoreClamp(85 + (ratio - 1) * 10));
  return scoreClamp(ratio * 85);
};

const calcProjectScore = (resumeText, jobSkills) => {
  const norm = normalise(resumeText);
  const hasProjects = /project|built|developed|implemented|created|designed/i.test(norm);
  if (!hasProjects) return 55;
  const projectSection = norm.match(/projects?[\s\S]{0,2000}/i)?.[0] || norm;
  const hits = jobSkills.filter((skill) =>
    new RegExp(skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(projectSection)
  ).length;
  const base = 60;
  const bonus = jobSkills.length > 0 ? (hits / jobSkills.length) * 40 : 20;
  return scoreClamp(base + bonus);
};

// ── Main Local Matcher ────────────────────────────────────────
export const localMatchResumeAndJob = (resumeText, jobDescription) => {
  // 1. Extract skills from both
  const resumeSkills = extractSkills(resumeText);
  const jobSkills    = extractSkills(jobDescription);

  // 2. Categorise skill matches
  const matchedSkills = resumeSkills.filter((s) => jobSkills.includes(s));
  const missingSkills = jobSkills.filter((s) => !resumeSkills.includes(s));

  // Partial: skills in resume that are related but not in job (bonus context)
  const partialSkills = resumeSkills.filter((s) => !jobSkills.includes(s)).slice(0, 5);

  // 3. Extract education
  const resumeEducation = extractEducationLevel(resumeText);
  const jobEducation    = extractEducationLevel(jobDescription);

  // 4. Extract experience
  const resumeYears = extractYearsOfExperience(resumeText);
  const jobYears    = extractYearsOfExperience(jobDescription);

  // 5. Job title
  const jobTitle = extractJobTitle(jobDescription);

  // 6. Calculate scores
  const skillsScore     = calcSkillsScore(matchedSkills, jobSkills);
  const educationScore  = calcEducationScore(resumeEducation, jobEducation);
  const experienceScore = calcExperienceScore(resumeYears, jobYears);
  const projectScore    = calcProjectScore(resumeText, jobSkills);

  const overallScore = scoreClamp(
    skillsScore * 0.40 +
    experienceScore * 0.30 +
    educationScore  * 0.15 +
    projectScore    * 0.15
  );

  // 7. Build explanations
  const matchPct = matchedSkills.length > 0
    ? `${matchedSkills.length} of ${jobSkills.length} required skills matched (${matchedSkills.join(", ")})`
    : "No direct skill overlaps were detected";

  const expStatement = resumeYears > 0
    ? `The resume indicates approximately ${resumeYears} year(s) of experience.`
    : "Experience duration was not explicitly stated in the resume.";

  const jobExpStatement = jobYears > 0
    ? ` The job requires ${jobYears} year(s).`
    : " The job description does not specify a required experience duration.";

  const eduStatement = resumeEducation !== "none"
    ? `The candidate's highest detected education level is ${resumeEducation}.`
    : "No formal education level was detected in the resume.";

  const explanation = [
    `This candidate received an overall match score of ${overallScore}% for the ${jobTitle} position.`,
    `Skill Analysis: ${matchPct}.`,
    missingSkills.length > 0
      ? `Key skills not found in the resume: ${missingSkills.slice(0, 5).join(", ")}.`
      : "All required skills were found in the resume.",
    expStatement + jobExpStatement,
    eduStatement,
    "\n⚠ Analysis mode: Local matching engine (Gemini AI not configured).",
  ].join(" ");

  const experienceAnalysis = `${expStatement}${jobExpStatement} Experience match score: ${experienceScore}%.`;
  const educationAnalysis  = `${eduStatement} Education match score: ${educationScore}%.`;
  const projectAnalysis    = `Project-related content ${projectScore >= 65 ? "was" : "was not strongly"} detected in the resume. Project relevance score: ${projectScore}%.`;

  // 8. Build recommendations
  const recommendations = [];

  if (missingSkills.length > 0) {
    recommendations.push(
      `Learn or strengthen: ${missingSkills.slice(0, 3).join(", ")} — these are explicitly required by the job.`
    );
  }

  if (missingSkills.length > 3) {
    recommendations.push(
      `Also consider adding ${missingSkills.slice(3, 6).join(", ")} to your skill set for this role.`
    );
  }

  if (resumeYears < jobYears && jobYears > 0) {
    recommendations.push(
      `The job requires ${jobYears} years of experience. Build more project portfolio or internship experience to close this gap.`
    );
  }

  const hasProjects = /project|portfolio|built|developed|implemented/i.test(resumeText);
  if (!hasProjects) {
    recommendations.push(
      "Add a dedicated Projects section to your resume highlighting real-world applications of your skills."
    );
  }

  if (matchedSkills.length > 0 && missingSkills.length > matchedSkills.length) {
    recommendations.push(
      "Your matched skills are a good foundation. Focus on building projects that demonstrate the missing skills."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your profile aligns well with this job description. Tailor your resume summary to directly address this specific role.",
      "Quantify your achievements (e.g., 'Improved performance by 30%') to make your resume stand out.",
      "Ensure your LinkedIn profile mirrors the updated resume."
    );
  }

  // 9. Return structured result
  return {
    success: true,
    jobTitle,
    matchScore: overallScore,
    breakdown: {
      skills:     skillsScore,
      experience: experienceScore,
      education:  educationScore,
      projects:   projectScore,
    },
    matchedSkills,
    missingSkills,
    partialSkills,
    experienceAnalysis,
    educationAnalysis,
    projectAnalysis,
    explanation,
    recommendations,
    analysisMode: "local",
    // Candidate profile fields — used by the Jobs page
    candidateSkills:          resumeSkills,
    candidateEducation:       resumeEducation,
    candidateExperienceYears: resumeYears,
    candidateProjects:        extractProjects(resumeText),
    candidateCertifications:  extractCertifications(resumeText),
    candidateRoles:           inferCandidateRoles(resumeSkills, resumeText),
  };
};
