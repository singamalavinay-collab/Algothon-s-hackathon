import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Database, Cpu, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LoadingState = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: Database, text: "Extracting resume data..." },
    { icon: Cpu, text: "Analyzing semantic context..." },
    { icon: Sparkles, text: "Matching skills and experience..." },
    { icon: CheckCircle2, text: "Generating insights..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative mb-12">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
        
        <div className="relative h-24 w-24 bg-surface border-2 border-primary/50 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.2)]">
          <Bot size={48} className="text-primary animate-pulse" />
        </div>
        
        {/* Orbiting particles could go here */}
      </div>

      <h2 className="text-2xl font-bold mb-8 tracking-tight">AI is analyzing your profile</h2>

      <div className="w-full max-w-md space-y-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isPast = i < step;
          
          return (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                isActive ? "bg-surface border-primary/50 scale-105 shadow-lg shadow-primary/5 text-text" :
                isPast ? "bg-surface/50 border-border text-text/70" : "bg-background border-transparent text-muted opacity-50"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                isActive ? "bg-primary/20 text-primary" :
                isPast ? "bg-success/20 text-success" : "bg-surface text-muted"
              )}>
                {isPast ? <CheckCircle2 size={20} /> : <Icon size={20} className={isActive ? "animate-pulse" : ""} />}
              </div>
              <span className="font-medium">{s.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingState;
