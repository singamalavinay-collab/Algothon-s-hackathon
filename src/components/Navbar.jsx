import React from 'react';
import { Briefcase, FileText, Home, Info, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = ({ activeTab, setActiveTab, hasProfile, showToast }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analyze', label: 'Analyze Resume', icon: FileText },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={24} className="text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              MatchAI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { if ((item.id === 'analyze' || item.id === 'jobs') && !hasProfile) { showToast('Please upload your resume first.'); } else { setActiveTab(item.id); } }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    activeTab === item.id 
                      ? "bg-surface text-white shadow-sm" 
                      : "text-muted hover:text-text hover:bg-surface/50"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
          
          <div className="md:hidden flex items-center">
             {/* Mobile menu button could go here */}
             <button className="text-muted hover:text-text">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
