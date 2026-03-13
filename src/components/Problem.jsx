import React from 'react';
import { Ghost, ShieldAlert, KeyRound } from 'lucide-react';

const Problem = () => {
  return (
    <section id="problem" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl mix-blend-screen opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-emerald-400 text-sm font-semibold mb-8 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            The Silent Threat in Your Architecture
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-8 tracking-tight">
            Stop <span className="text-emerald-400">Zombie APIs</span> Before They Strike.
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto">
            Zombie APIs are forgotten, deprecated, or unmanaged endpoints that attackers exploit to bypass modern security controls. Traditional WAFs can't see them. We can.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group backdrop-blur-sm">
            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Ghost className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Undocumented Endpoints</h3>
            <p className="text-slate-400">APIs deployed by developers that bypass your central API gateway and documentation pipelines.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Legacy Versions</h3>
            <p className="text-slate-400">Old API versions (v1) left running for backward compatibility, containing known vulnerabilities.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group backdrop-blur-sm">
            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <KeyRound className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Broken Authentication</h3>
            <p className="text-slate-400">Forgotten endpoints that lack modern authentication protocols like OAuth 2.0 or JWT validation.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
