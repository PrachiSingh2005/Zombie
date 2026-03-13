import React from 'react';
import { Building2, Landmark, Briefcase } from 'lucide-react';

const CaseStudies = () => {
  return (
    <section id="cases" className="py-20 bg-slate-900/40 relative border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-200 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-slate-400">
            See how organizations are eliminating their API attack surface and preventing massive breaches.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 transition-colors">
            <Landmark className="text-emerald-400 w-10 h-10 mb-6" />
            <h3 className="text-xl font-bold text-slate-200 mb-3">Tier 1 Global Bank</h3>
            <p className="text-slate-400 mb-6 flex-grow">
              Blocked a massive data exfiltration attempt by identifying and mitigating a BOLA attack on an undocumented legacy account API.
            </p>
            <div className="mt-auto border-t border-slate-800 pt-4 text-emerald-400 font-semibold text-sm">
              Saved an estimated $5M in breach costs.
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 transition-colors">
            <Building2 className="text-cyan-400 w-10 h-10 mb-6" />
            <h3 className="text-xl font-bold text-slate-200 mb-3">Healthcare Provider</h3>
            <p className="text-slate-400 mb-6 flex-grow">
              Discovered 24 undocumented endpoints exposing PHI (Protected Health Information) within the first 48 hours of deployment.
            </p>
            <div className="mt-auto border-t border-slate-800 pt-4 text-cyan-400 font-semibold text-sm">
              Secured 1M+ patient records instantly.
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 transition-colors">
            <Briefcase className="text-purple-400 w-10 h-10 mb-6" />
            <h3 className="text-xl font-bold text-slate-200 mb-3">Fintech Unicorn</h3>
            <p className="text-slate-400 mb-6 flex-grow">
              Mapped their entire sprawling microservices architecture and deprecated 150+ dormant APIs that were increasing their attack surface.
            </p>
            <div className="mt-auto border-t border-slate-800 pt-4 text-purple-400 font-semibold text-sm">
              Reduced API attack surface by 40%.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
