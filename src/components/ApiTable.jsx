import React from 'react';

const ApiTable = ({ data }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-4 font-semibold">API Endpoint</th>
            <th className="px-6 py-4 font-semibold">Method</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Owner</th>
            <th className="px-6 py-4 font-semibold">Last Used</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.map((api, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-400">{api.endpoint}</td>
              <td className="px-6 py-4">
                 <span className={`px-2.5 py-1 rounded-md text-xs font-semibold
                   ${api.method === 'GET' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 
                     api.method === 'POST' ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400' : 
                     api.method === 'DELETE' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : 
                     'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                   {api.method}
                 </span>
              </td>
              <td className="px-6 py-4">
                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                   ${api.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                     api.status === 'Zombie' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : 
                     api.status === 'Shadow' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 
                     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                   {api.status === 'Zombie' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                   {api.status}
                 </span>
              </td>
              <td className="px-6 py-4">{api.owner}</td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-500">{api.lastUsed}</td>
            </tr>
          ))}
          {data.length === 0 && (
             <tr>
               <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                 No APIs detected yet. Scan a website to populate this table.
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApiTable;
