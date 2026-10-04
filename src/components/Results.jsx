import React from 'react';
import { ArrowLeft, CheckCircle2, TrendingUp, AlertTriangle, Lightbulb, Briefcase, GraduationCap, Code, Sparkles, Cpu } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ProgressBar = ({ label, value, colorClass, icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2 text-muted">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-text">{value}%</span>
    </div>
    <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
      <div 
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass)}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const Results = ({ results, onReset, onViewJobs }) => {
  if (!results) return null;

  const chartData = [{ name: 'Match', value: results.overallMatch }];
  
  // Determine color based on score
  let scoreColor = "text-success";
  let scoreStroke = "#10b981"; // success
  if (results.overallMatch < 70) {
    scoreColor = "text-warning";
    scoreStroke = "#f59e0b"; // warning
  }
  if (results.overallMatch < 50) {
    scoreColor = "text-danger";
    scoreStroke = "#ef4444"; // danger
  }

  const isLocal = results.analysisMode !== 'gemini';

  return (
    <div className="animate-slide-up space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button 
          onClick={onReset}
          className="text-muted hover:text-text transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
{results && (
  <div className="mt-4 text-center">
    <h3 className="text-xl font-bold text-text mb-2">Resume Analysis Complete! 🎉</h3>
    <p className="text-muted">Your resume has been successfully analyzed. You can now explore personalized job recommendations.</p>
  </div>
)}

        </div>
        <div className="flex items-center gap-2">
          {onViewJobs && (
            <button
              onClick={onViewJobs}
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 rounded-lg"
            >
              <Briefcase size={14} /> Recommended Jobs
            </button>
          )}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
            isLocal
              ? "bg-warning/10 border-warning/30 text-warning"
              : "bg-success/10 border-success/30 text-success"
          )}>
            {isLocal ? <Cpu size={13} /> : <Sparkles size={13} />}
            {isLocal ? "Local Engine" : "Gemini AI"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="glass-panel p-8 lg:col-span-1 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
          
          <h3 className="text-lg font-semibold text-muted mb-4">Overall Match Score</h3>
          
          <div className="h-48 w-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="80%" outerRadius="100%" 
                barSize={10} 
                data={chartData} 
                startAngle={90} endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  minAngle={15}
                  background={{ fill: '#121214' }}
                  clockWise
                  dataKey="value"
                  fill={scoreStroke}
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-5xl font-extrabold", scoreColor)}>{results.overallMatch}%</span>
            </div>
          </div>
          
          <p className="mt-4 text-center text-sm text-muted">
             Based on comprehensive semantic analysis of your profile against the job description.
          </p>
        </div>

        {/* Detailed Breakdown Card */}
        <div className="glass-panel p-8 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Compatibility Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProgressBar 
              label="Skills Match" 
              value={results.skillsMatch} 
              colorClass="bg-blue-500" 
              icon={Code}
            />
            <ProgressBar 
              label="Experience Match" 
              value={results.experienceMatch} 
              colorClass="bg-purple-500"
              icon={Briefcase}
            />
            <ProgressBar 
              label="Education Match" 
              value={results.educationMatch} 
              colorClass="bg-green-500"
              icon={GraduationCap}
            />
            <ProgressBar 
              label="Project Match" 
              value={results.projectMatch} 
              colorClass="bg-yellow-500"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* AI Insights - Explanation */}
        <div className="glass-panel p-8 lg:col-span-3 border-l-4 border-l-primary">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            AI Assessment
          </h3>
          <p className="text-text/90 leading-relaxed text-lg">
            {results.explanation}
          </p>
        </div>

        {/* Skills Analysis */}
        <div className="glass-panel p-8 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6">Skills Analysis</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 text-success font-medium">
                <CheckCircle2 size={18} />
                <h4>Matching Skills Found</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.matchingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-success/10 border border-success/20 text-success rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="w-full h-[1px] bg-border"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-3 text-danger font-medium">
                <AlertTriangle size={18} />
                <h4>Missing Key Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-danger/10 border border-danger/20 text-danger rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-panel p-8 lg:col-span-1 bg-gradient-to-br from-surface to-primary/5">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
            <Lightbulb size={20} />
            Action Plan
          </h3>
          <ul className="space-y-4">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-text/80 text-sm leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Personalized Jobs Callout Banner */}
      <div className="glass-panel p-6 border border-primary/30 bg-primary/5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-base text-text flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Personalized Job Recommendations Ready!
          </h4>
          <p className="text-xs text-muted max-w-xl">
            Your candidate profile is saved. Explore real-time software engineering roles ranked specifically for your detected skills, experience, and education.
          </p>
        </div>
        {onViewJobs && (
          <button
            onClick={onViewJobs}
            className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-lg"
          >
            <Briefcase size={15} />
            Explore Recommended Jobs
          </button>
        )}
      </div>
    </div>
  );
};

export default Results;
