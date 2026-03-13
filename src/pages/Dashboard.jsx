import React from 'react';
import { Globe, Database, Ghost, ShieldAlert, ShieldCheck } from 'lucide-react';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const websites = [
    { url: 'https://www.onlinesbi.sbi', total: 1042, zombie: 14, risk: 'High', score: 68 },
    { url: 'https://www.hdfcbank.com', total: 856, zombie: 3, risk: 'Low', score: 94 },
    { url: 'https://www.icicibank.com', total: 1205, zombie: 8, risk: 'Medium', score: 82 },
    { url: 'https://www.axisbank.com', total: 640, zombie: 0, risk: 'Secure', score: 98 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Executive dashboard for API threat landscape across banking infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Websites Scanned" value="24" icon={Globe} color="indigo" />
        <StatCard title="Total APIs Detected" value="8,402" icon={Database} color="cyan" />
        <StatCard title="Zombie APIs Active" value="89" icon={Ghost} color="rose" trend="up" trendValue={12} />
        <StatCard title="Critical Risks" value="14" icon={ShieldAlert} color="amber" trend="down" trendValue={3} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Monitored Institutions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Website URL</th>
                <th className="px-6 py-4 font-semibold text-center">Total APIs</th>
                <th className="px-6 py-4 font-semibold text-center">Zombie APIs</th>
                <th className="px-6 py-4 font-semibold">Risk Level</th>
                <th className="px-6 py-4 font-semibold w-1/4">Security Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {websites.map((site, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{site.url}</td>
                  <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300 font-mono">{site.total}</td>
                  <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300 font-mono">
                    <span className={site.zombie > 0 ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md' : 'text-slate-500'}>
                      {site.zombie}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold
                      ${site.risk === 'Secure' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        site.risk === 'Low' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                        site.risk === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {site.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            site.score >= 90 ? 'bg-emerald-500' : 
                            site.score >= 75 ? 'bg-amber-500' : 
                            'bg-rose-500'
                          }`}
                          style={{ width: `${site.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[3rem]">
                        {site.score} / 100
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
