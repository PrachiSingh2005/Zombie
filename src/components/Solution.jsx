import React from 'react';
import { Radar, Server, ShieldCheck, Activity } from 'lucide-react';

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
            Complete Visibility. <span className="text-emerald-400">Proactive Defense.</span>
          </h2>
          <p className="text-xl text-slate-400">
            Our platform connects directly to your network traffic to map, classify, and secure every API endpoint, whether you know it exists or not.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Radar,
              title: "Continuous Discovery",
              desc: "Automatically map your entire API landscape analyzing live traffic without agents."
            },
            {
              icon: Server,
              title: "Shadow API Detection",
              desc: "Compare runtime traffic against your Swagger/OpenAPI specs to find discrepancies."
            },
            {
              icon: Activity,
              title: "Behavioral Analysis",
              desc: "Establish baseline behavior and detect anomalies that indicate BOLA/BFLA attacks."
            },
            {
              icon: ShieldCheck,
              title: "Automated Blocking",
              desc: "Integrate with your API Gateway and WAF to automatically block malicious actors."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700/50 group-hover:border-emerald-500/50 transition-colors">
                <feature.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Dashboard Preview Mock */}
        <div className="mt-20 relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
             <div className="w-3 h-3 rounded-full bg-rose-500" />
             <div className="w-3 h-3 rounded-full bg-amber-500" />
             <div className="w-3 h-3 rounded-full bg-emerald-500" />
             <span className="text-xs font-mono text-slate-500 ml-4">zombie-defense-console ~ active</span>
          </div>
          
          <div className="grid grid-cols-4 gap-4 pb-12">
            <div className="col-span-1 border border-slate-800 rounded-lg p-4 bg-slate-950">
              <div className="text-sm text-slate-400 mb-2">Total Discovered APIs</div>
              <div className="text-3xl font-mono text-emerald-400">1,402</div>
            </div>
            <div className="col-span-1 border border-slate-800 rounded-lg p-4 bg-slate-950">
              <div className="text-sm text-slate-400 mb-2">Zombie APIs Detected</div>
              <div className="text-3xl font-mono text-rose-400">89</div>
            </div>
            <div className="col-span-2 border border-slate-800 rounded-lg p-4 bg-slate-950 flex flex-col justify-center">
               <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
                 <span>Traffic Analysis</span>
                 <span className="text-cyan-400">100% Core</span>
               </div>
               <div className="h-1 bg-slate-800 rounded-full w-full overflow-hidden">
                 <div className="h-full bg-cyan-400 w-full" />
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Solution;
