import React from 'react';
import { AlertTriangle, TrendingUp, Search } from 'lucide-react';

const Validation = () => {
  return (
    <section id="validation" className="py-20 bg-slate-950/50 border-y border-slate-800/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-200 mb-6">
              The Reality of <span className="text-cyan-400">API Blind Spots</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              In modern microservice architectures, API sprawl is inevitable. Our research and industry reports confirm that the majority of organizations have significant visibility gaps in their API attack surface.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                  <AlertTriangle className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-200 mb-1">94% of Organizations</h4>
                  <p className="text-slate-400">Experienced security incidents related to unsecured APIs in the past year.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                  <Search className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-200 mb-1">3x More Shadow APIs</h4>
                  <p className="text-slate-400">Enterprises have on average three times as many unmanaged APIs as known, documented APIs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-3xl rounded-full" />
            <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-slate-300">API Threat Landscape</h3>
                <TrendingUp className="text-cyan-400 w-5 h-5" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Documented APIs Secure</span>
                    <span className="text-emerald-400 font-mono">98%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98%]" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Zombie APIs Monitored</span>
                    <span className="text-rose-400 font-mono text-xl font-semibold">12%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[12%] animate-pulse" />
                  </div>
                  <p className="text-xs text-rose-400/70 mt-3 font-mono">CRITICAL VULNERABILITY DETECTED</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Validation;
