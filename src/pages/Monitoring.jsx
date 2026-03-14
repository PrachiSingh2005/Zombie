import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Bell, Shield, BellRing, RefreshCw } from 'lucide-react';
import { fetchMonitoringAlerts, fetchDashboardWebsites } from '../api';

const Monitoring = () => {
  const [alerts, setAlerts] = useState([]);
  const [monitoredSites, setMonitoredSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [alertsData, sitesData] = await Promise.all([
        fetchMonitoringAlerts(),
        fetchDashboardWebsites(),
      ]);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setMonitoredSites(Array.isArray(sitesData) ? sitesData : []);
    } catch {
      // silently fail — monitoring is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Poll every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const clearAlerts = () => setAlerts([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-500" />
            Continuous Monitoring
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Real-time passive scanning and drift detection.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
           </span>
           <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Live Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monitored Targets */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Active Targets
              </h2>
            </div>
            <div className="p-0">
               <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                 {loading ? (
                   <li className="p-8 text-center text-slate-400">Loading...</li>
                 ) : monitoredSites.length === 0 ? (
                   <li className="p-8 text-center text-slate-400">No websites being monitored yet.</li>
                 ) : (
                   monitoredSites.map((site) => (
                     <li key={site.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between flex-wrap gap-4">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{site.url}</p>
                            <p className="text-xs text-slate-500">
                              Last scan: {site.last_scan ? new Date(site.last_scan).toLocaleString() : 'Never'}
                            </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                          <span>APIs: {site.total_apis}</span>
                          <button onClick={loadData} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors" title="Refresh">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                       </div>
                     </li>
                   ))
                 )}
               </ul>
            </div>
          </div>
        </div>

        {/* Live Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center sticky top-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {alerts.length > 0 ? (
                  <BellRing className="w-5 h-5 text-rose-500 animate-pulse" />
                ) : (
                  <Bell className="w-5 h-5 text-slate-400" />
                )}
                Alert Feed
              </h2>
              {alerts.length > 0 && (
                <button onClick={clearAlerts} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Clear All
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/30">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-slate-500 dark:text-slate-400">
                  <Shield className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No new anomalies detected.</p>
                </div>
              ) : (
                alerts.map((alert, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 p-4 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded">
                        {alert.type || 'Alert'}
                      </span>
                      <span className="text-xs text-slate-500">{alert.timestamp || ''}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-1">{alert.message || JSON.stringify(alert)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Monitoring;
