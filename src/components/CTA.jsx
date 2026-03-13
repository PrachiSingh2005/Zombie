import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section id="cta" className="py-24 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-emerald-500/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Secure your APIs today.
        </h2>
        <p className="text-xl text-emerald-100/80 mb-10 max-w-2xl mx-auto">
          Deploy ZombieDefend in 15 minutes and instantly illuminate your API blind spots. Prevent breaches before they happen.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <span>Request a Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all">
            Read the Documentation
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
