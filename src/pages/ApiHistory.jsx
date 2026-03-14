import React, { useEffect, useState, useCallback } from 'react';
import { ExternalLink, CheckCircle, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { fetchScanHistory } from '../api';

const ApiHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadHistory = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await fetchScanHistory();
      setHistoryData(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHistory(true);
  }, [loadHistory]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => loadHistory(false), 10000);
    return () => clearInterval(interval);
  }, [loadHistory]);

  const getStatusInfo = (scan) => {
    if (scan.status === 'COMPLETED' && (scan.zombie_apis ?? 0) === 0) {
      return { label: 'COMPLETED', color: 'emerald', icon: CheckCircle };
    }
    if (scan.status === 'COMPLETED' && (scan.zombie_apis ?? 0) > 0) {
      return { label: 'COMPLETED', color: 'amber', icon: ShieldAlert };
    }
    if (scan.status?.startsWith('FAILED')) {
      return { label: 'FAILED', color: 'rose', icon: ShieldAlert };
    }
    return { label: scan.status || 'UNKNOWN', color: 'slate', icon: ShieldAlert };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Scan History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Log of all historical threat detection sweeps across targets.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Auto-refresh · {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => loadHistory(false)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && historyData.length === 0 && (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-6 text-rose-700 dark:text-rose-400 mb-4">
          Failed to load history: {error}
        </div>
      )}

      {!loading || historyData.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Scan ID</th>
                  <th className="px-6 py-4 font-semibold">Target URL</th>
                  <th className="px-6 py-4 font-semibold">Scan Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Total APIs</th>
                  <th className="px-6 py-4 font-semibold text-center">Zombie APIs</th>
                  <th className="px-6 py-4 font-semibold text-center">Risk Score</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {historyData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No scans recorded yet. Run a scan from the Scanner page.
                    </td>
                  </tr>
                ) : (
                  historyData.map((scan) => {
                    const statusInfo = getStatusInfo(scan);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={scan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">#{scan.id}</td>
                        <td className="px-6 py-4">
                          <a
                            href={scan.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            {scan.website_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {scan.scan_date ? new Date(scan.scan_date).toLocaleString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-slate-600 dark:text-slate-400">{scan.total_apis ?? 0}</td>
                        <td className="px-6 py-4 text-center font-mono">
                           <span className={(scan.zombie_apis ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md' : 'text-slate-500'}>
                             {scan.zombie_apis ?? 0}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-mono font-bold ${
                            (scan.risk_score ?? 0) > 50 ? 'text-rose-600 dark:text-rose-400' :
                            (scan.risk_score ?? 0) > 20 ? 'text-amber-600 dark:text-amber-400' :
                            'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {scan.risk_score ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <StatusIcon className={`w-4 h-4 text-${statusInfo.color}-500`} />
                             <span className={`font-semibold text-${statusInfo.color}-600 dark:text-${statusInfo.color}-400`}>
                               {statusInfo.label}
                             </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ApiHistory;
