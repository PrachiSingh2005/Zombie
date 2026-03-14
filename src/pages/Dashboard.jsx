import React, { useState, useCallback } from 'react';
import { Globe, Database, Ghost, ShieldAlert, ShieldCheck, Loader2, Radar, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchDashboardOverview, fetchDashboardWebsites } from '../api';
import usePolling from '../hooks/usePolling';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const load = useCallback(async () => {
    try {
      const [ov, ws] = await Promise.all([
        fetchDashboardOverview(),
        fetchDashboardWebsites(),
      ]);
      setOverview(ov);
      setWebsites(ws);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 15 seconds for real-time updates
  usePolling(load, 15000);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-6 text-rose-700 dark:text-rose-400">
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Executive dashboard for API threat landscape across banking infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Auto-refresh · {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>
          )}
          <button
            onClick={load}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatCard title="Total Scans" value={overview?.total_scans ?? 0} icon={Radar} color="emerald" />
        <StatCard title="Unique Targets" value={overview?.total_websites ?? 0} icon={Globe} color="indigo" />
        <StatCard title="Total APIs Detected" value={overview?.total_apis ?? 0} icon={Database} color="cyan" />
        <StatCard title="Zombie APIs Active" value={overview?.zombie_apis ?? 0} icon={Ghost} color="rose" />
        <StatCard title="Critical Risks" value={overview?.security_risks ?? 0} icon={ShieldAlert} color="amber" />
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
                <th className="px-6 py-4 font-semibold">Last Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {websites.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                    No websites scanned yet. Run a scan from the Scanner page first.
                  </td>
                </tr>
              ) : (
                websites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{site.url}</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300 font-mono">{site.total_apis}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {site.last_scan ? new Date(site.last_scan).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
