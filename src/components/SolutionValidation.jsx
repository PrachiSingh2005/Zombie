import React from 'react';
import { CheckCircle2, Navigation, Layers, ShieldCheck } from 'lucide-react';

const SolutionValidation = () => {
  return (
    <section id="solution-validation" className="py-20 bg-slate-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-200 mb-6">
              Proven Results. <br/>
              <span className="text-emerald-400">Zero False Positives.</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Don't just take our word for it. Our platform delivers measurable impact across enterprise deployments, ensuring your API landscape is mapped and secured rapidly.
            </p>

            <ul className="space-y-4">
              {[
                "100% Shadow API Discovery in under 24 hours.",
                "Zero False Positives on behavioral modeling.",
                "Real-time mitigation of BOLA & BFLA attacks.",
                "Seamless CI/CD & API Gateway integration."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Navigation className="text-emerald-400 w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-slate-200">100%</h4>
              <p className="text-sm text-slate-400 mt-2">Discovery Rate</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Layers className="text-emerald-400 w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-slate-200">2B+</h4>
              <p className="text-sm text-slate-400 mt-2">Requests Analyzed Daily</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center -mt-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <ShieldCheck className="text-emerald-400 w-6 h-6" />
              </div>
              <h4 className="text-3xl font-bold text-slate-200">0</h4>
              <p className="text-sm text-slate-400 mt-2">False Positives</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400 font-bold text-xl">
                &lt;1s
              </div>
              <h4 className="text-3xl font-bold text-slate-200">Speed</h4>
              <p className="text-sm text-slate-400 mt-2">Mitigation Time</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SolutionValidation;
