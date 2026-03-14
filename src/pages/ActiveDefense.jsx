import React, { useState, useCallback } from 'react';
import { Shield, ShieldOff, ShieldAlert, ShieldCheck, Zap, Lock, Unlock, AlertTriangle, RefreshCw, Loader2, Globe, Clock } from 'lucide-react';
import { fetchDefenseStats, fetchBlockedApis, postAutoRemediate, postUnblockApi, fetchAuditableWebsites } from '../api';
import usePolling from '../hooks/usePolling';

const StatusBadge = ({ status }) => {
  const map = {
    BLOCKED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    QUARANTINED: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || map.ACTIVE}`}>
      {status === 'BLOCKED' && <ShieldOff className="w-3 h-3" />}
      {status === 'QUARANTINED' && <ShieldAlert className="w-3 h-3" />}
      {status === 'ACTIVE' && <ShieldCheck className="w-3 h-3" />}
      {status}
    </span>
  );
};

const ActiveDefense = () => {
  const [stats, setStats] = useState(null);
  const [blockedApis, setBlockedApis] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [remediating, setRemediating] = useState(false);
  const [remediateResult, setRemediateResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [statsData, blocked, sites] = await Promise.all([
        fetchDefenseStats(),
        fetchBlockedApis(),
        fetchAuditableWebsites(),
      ]);
      setStats(statsData);
      setBlockedApis(blocked);
      setWebsites(sites);
      if (sites.length > 0 && !selectedWebsite) setSelectedWebsite(sites[0].id);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite]);

  // Poll every 30 seconds for real-time defense updates
  usePolling(loadData, 30000);

  const handleAutoRemediate = async () => {
    if (!selectedWebsite) return;
    setRemediating(true);
    setError(null);
    setRemediateResult(null);
    try {
      const result = await postAutoRemediate(Number(selectedWebsite));
      setRemediateResult(result);
      await loadData(); // Refresh stats
    } catch (err) {
      setError(err.message);
    } finally {
      setRemediating(false);
    }
  };

  const handleUnblock = async (apiId) => {
    try {
      await postUnblockApi(apiId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-rose-500" />
            Active Defense
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Block zombie APIs and auto-remediate security threats.
          </p>
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
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.total_apis}</div>
            <div className="text-sm text-slate-500 mt-1">Total APIs</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
            <div className="text-sm text-slate-500 mt-1">Active</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.blocked}</div>
            <div className="text-sm text-slate-500 mt-1">Blocked</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.quarantined}</div>
            <div className="text-sm text-slate-500 mt-1">Quarantined</div>
          </div>
        </div>
      )}

      {/* Auto-Remediate Section */}
      <div className="bg-gradient-to-r from-rose-500/5 to-amber-500/5 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-rose-500" /> Auto-Remediate
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Automatically block Zombie/Orphaned APIs and quarantine Shadow/Deprecated APIs for a website.
        </p>
        {websites.length === 0 ? (
          <p className="text-sm text-slate-400">No scanned websites with APIs found. Run a scan first.</p>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={selectedWebsite}
              onChange={(e) => setSelectedWebsite(e.target.value)}
              className="flex-1 min-w-[250px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {websites.map(w => (
                <option key={w.id} value={w.id}>{w.url} ({w.api_count} APIs)</option>
              ))}
            </select>
            <button
              onClick={handleAutoRemediate}
              disabled={remediating}
              className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              {remediating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {remediating ? 'Remediating...' : 'Auto-Remediate Now'}
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Auto-Remediate Results */}
      {remediateResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Remediation Report
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Globe className="w-4 h-4" /> {remediateResult.website_url}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">{remediateResult.total_scanned}</div>
              <div className="text-xs text-slate-500">Scanned</div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-rose-600">{remediateResult.blocked}</div>
              <div className="text-xs text-slate-500">Blocked</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-amber-600">{remediateResult.quarantined}</div>
              <div className="text-xs text-slate-500">Quarantined</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-600">{remediateResult.safe}</div>
              <div className="text-xs text-slate-500">Safe</div>
            </div>
          </div>

          {remediateResult.actions && remediateResult.actions.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {remediateResult.actions.map((action, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={action.action} />
                    <code className="font-mono text-slate-700 dark:text-slate-300">{action.endpoint}</code>
                  </div>
                  <span className="text-xs text-slate-400">{action.reason?.slice(0, 60)}</span>
                </div>
              ))}
            </div>
          )}

          {remediateResult.actions && remediateResult.actions.length === 0 && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> All APIs are already clean — no remediation needed.
            </div>
          )}
        </div>
      )}

      {/* Blocked / Quarantined APIs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" /> Blocked & Quarantined APIs
          </h2>
          <span className="text-sm text-slate-500">{blockedApis.length} endpoints</span>
        </div>
        {blockedApis.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No blocked APIs. Run auto-remediate to scan for threats.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {blockedApis.map(api => (
              <div key={api.id} className="px-6 py-4 flex items-center justify-between flex-wrap gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <StatusBadge status={api.status} />
                    <code className="font-mono text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{api.method} {api.endpoint}</code>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      api.classification === 'Zombie API' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                      api.classification === 'Shadow API' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>{api.classification}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{api.website_url}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{api.blocked_at ? new Date(api.blocked_at).toLocaleString() : ''}</span>
                    <span className="text-rose-500">{api.blocked_reason}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(api.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <Unlock className="w-4 h-4" /> Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Defense Actions */}
      {stats && stats.recent_actions && stats.recent_actions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Recent Defense Activity
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {[...stats.recent_actions].reverse().map((action, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <StatusBadge status={action.action} />
                  <code className="font-mono text-slate-600 dark:text-slate-400">{action.endpoint}</code>
                </div>
                <span className="text-xs text-slate-400">{action.timestamp ? new Date(action.timestamp).toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveDefense;
