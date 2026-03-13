import React, { useState } from 'react';
import { Search, ShieldCheck, FileKey, Lock, Server, CheckCircle, XCircle } from 'lucide-react';

const ComplianceChecker = () => {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState(null);

  const rules = [
    { id: 1, title: 'HTTPS Mandatory', icon: Lock, desc: 'Every API endpoint must enforce TLS 1.2 or higher. No plaintext HTTP allowed.' },
    { id: 2, title: 'Authentication Present', icon: FileKey, desc: 'OAuth 2.0 or JWT validation required on sensitive routes. No unauthorized access.' },
    { id: 3, title: 'Rate Limiting', icon: Server, desc: 'DDoS protection and throttling limits must be explicitly set.' },
    { id: 4, title: 'Data Protection', icon: ShieldCheck, desc: 'Strict masking and tokenization for PII/PHI payloads in requests and responses.' }
  ];

  const handleAudit = (e) => {
    e.preventDefault();
    if (!url) return;
    
    // Mock simulation
    setReport({
      url,
      overall: 'FAIL',
      encryptionStatus: 'HTTPS (Secure)',
      checks: [
        { api: '/api/v1/payments', enc: 'PASS', auth: 'PASS', rate: 'PASS' },
        { api: '/api/v1/user-data', enc: 'FAIL', auth: 'FAIL', rate: 'PASS' },
        { api: '/api/v0/mock-bypass', enc: 'FAIL', auth: 'FAIL', rate: 'FAIL' },
        { api: '/v2/auth/callback', enc: 'PASS', auth: 'PASS', rate: 'FAIL' },
      ]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Compliance Engine</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Evaluate banking APIs against RBI/GDPR cybersecurity regulations.</p>
      </div>

      {/* Rules Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
              <rule.icon className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{rule.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{rule.desc}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-10">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <input 
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Target URL to audit (e.g. https://api.bank.com)"
            className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md whitespace-nowrap"
          >
            Audit Compliance
          </button>
        </form>
      </div>

      {/* Output Results */}
      {report && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Audit Report: {report.url}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Base Encryption:</span>
                <span className={report.encryptionStatus.includes('Secure') ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
                  {report.encryptionStatus}
                </span>
                {!report.encryptionStatus.includes('Secure') && <span className="text-rose-500/70 text-xs font-mono ml-2">WARNING: HTTP DETECTED</span>}
              </div>
            </div>
            <div className={`px-6 py-2 rounded-xl border font-bold text-lg
                ${report.overall === 'PASS' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                  : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
              Verdict: {report.overall}
            </div>
          </div>

          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Evaluated API</th>
                <th className="px-6 py-4 font-semibold text-center">Encryption</th>
                <th className="px-6 py-4 font-semibold text-center">Authentication</th>
                <th className="px-6 py-4 font-semibold text-center">Rate Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {report.checks.map((chk, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{chk.api}</td>
                  
                  <td className="px-6 py-4 text-center">
                    {chk.enc === 'PASS' ? <span className="inline-flex bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">PASS</span> : <span className="inline-flex bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-1 rounded text-xs font-bold">FAIL</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {chk.auth === 'PASS' ? <span className="inline-flex bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">PASS</span> : <span className="inline-flex bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-1 rounded text-xs font-bold">FAIL</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {chk.rate === 'PASS' ? <span className="inline-flex bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">PASS</span> : <span className="inline-flex bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-1 rounded text-xs font-bold">FAIL</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ComplianceChecker;
