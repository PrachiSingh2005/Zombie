import React from 'react';
import { ExternalLink, CheckCircle, ShieldAlert } from 'lucide-react';

const ApiHistory = () => {
  const historyData = [
    { url: 'https://www.onlinesbi.sbi', date: 'Oct 24, 2025 · 14:30', total: 1042, zombie: 14, score: 68, status: 'Failed' },
    { url: 'https://www.hdfcbank.com', date: 'Oct 20, 2025 · 09:15', total: 856, zombie: 3, score: 94, status: 'Passed' },
    { url: 'https://retail.axisbank.co.in', date: 'Sep 12, 2025 · 11:00', total: 412, zombie: 0, score: 99, status: 'Passed' },
    { url: 'https://www.icicibank.com', date: 'Aug 05, 2025 · 16:45', total: 1205, zombie: 8, score: 82, status: 'Warning' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Scan History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Log of all historical threat detection sweeps across targets.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Target URL</th>
                <th className="px-6 py-4 font-semibold">Scan Date</th>
                <th className="px-6 py-4 font-semibold text-center">Total APIs</th>
                <th className="px-6 py-4 font-semibold text-center">Zombie APIs</th>
                <th className="px-6 py-4 font-semibold">Compliance Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {historyData.map((scan, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{scan.url}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{scan.date}</td>
                  <td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-400">{scan.total}</td>
                  <td className="px-6 py-4 text-center font-mono">
                     <span className={scan.zombie > 0 ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md' : 'text-slate-500'}>
                       {scan.zombie}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {scan.status === 'Passed' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className={`w-4 h-4 ${scan.status === 'Warning' ? 'text-amber-500' : 'text-rose-500'}`} />}
                       <span className={`font-semibold ${
                         scan.status === 'Passed' ? 'text-emerald-600 dark:text-emerald-400' : 
                         scan.status === 'Warning' ? 'text-amber-600 dark:text-amber-400' : 
                         'text-rose-600 dark:text-rose-400'
                       }`}>{scan.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
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

export default ApiHistory;
