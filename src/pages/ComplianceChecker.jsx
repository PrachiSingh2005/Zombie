import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle, XCircle, Loader2, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { postComplianceCheckWebsite, fetchAuditableWebsites } from '../api';
import { useCompliance } from '../context/ComplianceContext';

const CHECK_LABELS = {
  https_enforced: 'HTTPS Enforced',
  auth_required: 'Authentication Required',
  api_lifecycle: 'API Lifecycle Status',
  documentation: 'API Documentation',
  security_headers: 'Security Headers',
  rate_limiting: 'Rate Limiting',
  data_exposure: 'Sensitive Data Exposure',
  cors_policy: 'CORS Policy',
  risk_assessment: 'Risk Score Assessment',
};

const RULE_DESCRIPTIONS = {
  https_enforced: 'All API traffic must use TLS 1.2+ encryption. No plaintext HTTP.',
  auth_required: 'Endpoints must require authentication (OAuth 2.0, JWT, API Key).',
  api_lifecycle: 'APIs must be actively maintained. Zombie/Shadow/Orphaned APIs fail this check.',
  documentation: 'Endpoints must be documented in Swagger/OpenAPI specification.',
  security_headers: 'Response must include HSTS, CSP, X-Frame-Options, X-Content-Type-Options.',
  rate_limiting: 'Rate limiting headers must be present to prevent DDoS/brute-force attacks.',
  data_exposure: 'Response must not contain PII, credentials, or secret keys.',
  cors_policy: 'CORS must not allow wildcard (*) origins.',
  risk_assessment: 'Calculated risk score must be below acceptable threshold (< 50).',
};

const StatusBadge = ({ status }) => {
  if (status === 'PASS') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"><CheckCircle className="w-3 h-3" /> PASS</span>;
  if (status === 'FAIL') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"><XCircle className="w-3 h-3" /> FAIL</span>;
  if (status === 'WARN') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"><AlertTriangle className="w-3 h-3" /> WARN</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">{status}</span>;
};

const VerdictBadge = ({ verdict }) => {
  const map = {
    PASS: { bg: 'bg-emerald-500', icon: ShieldCheck, text: 'COMPLIANT' },
    PARTIAL: { bg: 'bg-amber-500', icon: ShieldAlert, text: 'PARTIAL' },
    FAIL: { bg: 'bg-rose-500', icon: ShieldX, text: 'NON-COMPLIANT' },
  };
  const v = map[verdict] || map.FAIL;
  const Icon = v.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm ${v.bg}`}>
      <Icon className="w-5 h-5" /> {v.text}
    </span>
  );
};

const ApiResultCard = ({ result, index }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const checks = result.checks || {};
  const failCount = Object.values(checks).filter(v => v === 'FAIL').length;
  const passCount = Object.values(checks).filter(v => v === 'PASS').length;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`w-2 h-2 rounded-full ${result.overall_status === 'PASS' ? 'bg-emerald-500' : result.overall_status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'}`} />
          <code className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">{result.method} {result.endpoint}</code>
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
            result.classification === 'Active API' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
            result.classification === 'Shadow API' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
            result.classification === 'Zombie API' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          }`}>{result.classification}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{passCount}P / {failCount}F</span>
          <StatusBadge status={result.overall_status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase">
                <th className="text-left pb-3 font-semibold">Compliance Rule</th>
                <th className="text-right pb-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {Object.entries(checks).map(([key, status]) => (
                <tr key={key} className="group">
                  <td className="py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{CHECK_LABELS[key] || key}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{RULE_DESCRIPTIONS[key] || ''}</div>
                  </td>
                  <td className="py-3 text-right"><StatusBadge status={status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.issues && result.issues.length > 0 && (
            <div className="mt-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg p-4">
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Issues Found ({result.issues.length})
              </h4>
              <ul className="space-y-1">
                {result.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ComplianceChecker = () => {
  // Persisted state lives in the global context — survives tab navigation
  const {
    inputType, setInputType,
    selectedWebsite, setSelectedWebsite,
    manualWebsiteId, setManualWebsiteId,
    auditResult, setAuditResult,
    loading, setLoading,
    error, setError,
  } = useCompliance();

  // Page-local state: always refetched fresh from server
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);

  useEffect(() => {
    fetchAuditableWebsites()
      .then(data => {
        setWebsites(data);
        // Only pre-select if the user hasn't already picked one in a prior visit
        if (data.length > 0 && !selectedWebsite) setSelectedWebsite(data[0].id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingWebsites(false));
  }, []);

  const handleAudit = async () => {
    const targetId = inputType === 'dropdown' ? selectedWebsite : manualWebsiteId;
    if (!targetId) return;
    setLoading(true);
    setError(null);
    setAuditResult(null);
    try {
      const data = await postComplianceCheckWebsite(Number(targetId));
      setAuditResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Compliance Engine</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Real-time security audit against RBI/GDPR cybersecurity regulations.</p>
      </div>

      {/* Rule cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { key: 'https_enforced', label: 'HTTPS', color: 'emerald' },
          { key: 'auth_required', label: 'Auth', color: 'blue' },
          { key: 'security_headers', label: 'Headers', color: 'purple' },
          { key: 'rate_limiting', label: 'Rate Limit', color: 'amber' },
          { key: 'api_lifecycle', label: 'Lifecycle', color: 'rose' },
        ].map(rule => (
          <div key={rule.key} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{rule.label}</div>
            <div className="text-xs text-slate-400 mt-1">{RULE_DESCRIPTIONS[rule.key]?.slice(0, 60)}...</div>
          </div>
        ))}
      </div>

      {/* Audit controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Select Target to Audit</h2>
        
        <div className="flex items-center gap-6 mb-5">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            <input type="radio" checked={inputType === 'dropdown'} onChange={() => setInputType('dropdown')} className="accent-indigo-600 w-4 h-4" />
            <span>Select from Auditable List</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            <input type="radio" checked={inputType === 'manual'} onChange={() => setInputType('manual')} className="accent-indigo-600 w-4 h-4" />
            <span>Enter Website ID manually (History)</span>
          </label>
        </div>

        {inputType === 'dropdown' ? (
          loadingWebsites ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading websites...</div>
          ) : websites.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400">No websites with APIs found. Run a scan first from the Scanner page.</div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <select
                  value={selectedWebsite}
                  onChange={(e) => setSelectedWebsite(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {websites.map(w => (
                    <option key={w.id} value={w.id}>{w.url} ({w.api_count} APIs)</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAudit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {loading ? 'Auditing...' : 'Run Compliance Audit'}
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <input
                type="number"
                placeholder="Enter Website ID (e.g. 1)"
                value={manualWebsiteId}
                onChange={(e) => setManualWebsiteId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && manualWebsiteId && handleAudit()}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleAudit}
              disabled={loading || !manualWebsiteId}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? 'Auditing...' : 'Run Compliance Audit'}
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

      {/* Audit results */}
      {auditResult && (
        <div className="space-y-6">
          {/* Summary banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                  <Globe className="w-4 h-4" /> {auditResult.website_url}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compliance Audit Report</h2>
              </div>
              <VerdictBadge verdict={auditResult.summary.overall_verdict} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{auditResult.summary.total_apis}</div>
                <div className="text-xs text-slate-500 mt-1">Total APIs</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{auditResult.summary.pass_count}</div>
                <div className="text-xs text-slate-500 mt-1">Compliant</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{auditResult.summary.partial_count}</div>
                <div className="text-xs text-slate-500 mt-1">Partial</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{auditResult.summary.fail_count}</div>
                <div className="text-xs text-slate-500 mt-1">Non-Compliant</div>
              </div>
            </div>
          </div>

          {/* Per-API results */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Per-API Audit Results</h3>
            <div className="space-y-3">
              {auditResult.api_results.map((result, i) => (
                <ApiResultCard key={i} result={result} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceChecker;
