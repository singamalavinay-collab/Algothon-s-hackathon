import React, { useState } from 'react';
import { UploadCloud, File, X, ArrowRight, Zap, Target, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Dashboard = ({ onAnalyze, candidateProfile }) => {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.type.includes('wordprocessingml')) {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF or DOCX file.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = () => {
    if (file && jobDesc.trim()) {
      onAnalyze(file, jobDesc);
    }
  };

  return (
    <div className="animate-fade-in space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Find your perfect match with <span className="text-primary">AI</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Upload your resume and the job description. Our advanced AI will analyze your compatibility, identify skill gaps, and provide actionable recommendations.
        </p>
      </div>
{candidateProfile && (
  <div className="glass-panel p-4 my-6 text-center mx-auto max-w-lg">
    <h2 className="text-xl font-bold text-text mb-2">Resume Analysis Complete! 🎉</h2>
    <p className="text-muted">Your resume has been successfully analyzed. You can now explore personalized job recommendations.</p>
  </div>
)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="font-bold">1</span>
            </div>
            <h2 className="text-xl font-semibold">Upload Resume</h2>
          </div>
          
          <div 
            className={cn(
              "glass-panel p-8 text-center border-2 border-dashed transition-all duration-300 relative h-64 flex flex-col items-center justify-center cursor-pointer",
              isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-surface/90"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById('file-upload').click()}
          >
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-4 animate-fade-in w-full">
                <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center">
                  <File size={32} />
                </div>
                <div className="space-y-1 w-full px-4">
                  <p className="text-text font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                  className="mt-2 text-sm text-danger hover:text-danger/80 flex items-center gap-1"
                >
                  <X size={16} /> Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-surface border border-border rounded-full flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                  <UploadCloud size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-text font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted">PDF or DOCX (MAX. 5MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Description Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold">Job Description</h2>
          </div>
          
          <div className="glass-panel p-1 flex-1 h-64">
            <textarea
              className="w-full h-full bg-transparent border-none resize-none text-text p-5 focus:outline-none focus:ring-0 placeholder:text-muted/60"
              placeholder="Paste the full job description here... Our AI will extract key requirements, skills, and experience needed."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>
        {/* Empty area informational message */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-3xl font-extrabold text-text">
            Your resume, your next opportunity.
            <span className="block w-24 h-1 bg-primary mx-auto mt-2"></span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            Upload your resume and add a job description to discover your match, identify skill gaps, and get personalized recommendations.
          </p>
        </div>
        <div className="glass-panel p-8 mt-12 space-y-6 border border-border">
          <h2 className="text-2xl font-extrabold text-text text-center">Ready to discover your job match?</h2>
          <p className="text-center text-muted max-w-2xl mx-auto">
            Upload your resume and add a job description to get a personalized compatibility analysis.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="flex flex-col items-center text-center">
              <UploadCloud className="text-primary mb-2" size={32} />
              <h3 className="font-semibold text-text">Upload your resume</h3>
              <p className="text-sm text-muted">PDF or DOCX, up to 5 MB</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <File className="text-primary mb-2" size={32} />
              <h3 className="font-semibold text-text">Add the job description</h3>
              <p className="text-sm text-muted">Paste the complete job requirements</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Zap className="text-primary mb-2" size={32} />
              <h3 className="font-semibold text-text">Analyze your match</h3>
              <p className="text-sm text-muted">Get your match score, skill gaps, and personalized recommendations</p>
            </div>
          </div>
          <p className="text-xs text-muted flex items-center mt-4"><span className="mr-2">💡 Tip:</span> For the most accurate results, use the complete job description including required skills, qualifications, and experience.</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex justify-center pt-8">
        <button
          onClick={handleSubmit}
          disabled={!file || !jobDesc.trim()}
          className={cn(
            "btn-primary text-lg px-8 py-4 w-full md:w-auto min-w-[240px] group shadow-xl shadow-primary/20",
            (!file || !jobDesc.trim()) && "opacity-50 cursor-not-allowed shadow-none"
          )}
        >
          <Zap className="mr-2 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" />
          Analyze Match
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
        {[
          { icon: Target, title: "Precision Matching", desc: "Our AI compares your profile against specific job requirements with deep semantic understanding." },
          { icon: Search, title: "Gap Analysis", desc: "Identify exactly which skills you're missing to land your dream role." },
          { icon: Zap, title: "Actionable Insights", desc: "Get personalized recommendations on how to improve your resume for this specific job." }
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="glass-panel p-6 hover:bg-surface/60 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-surface border border-border flex items-center justify-center text-primary mb-4">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
