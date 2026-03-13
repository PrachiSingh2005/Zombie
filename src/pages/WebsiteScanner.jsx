import React, { useState } from 'react';
import { Search, Radar, AlertTriangle, CheckCircle, Skull } from 'lucide-react';
import ApiTable from '../components/ApiTable';

const WebsiteScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsScanning(true);
    setScanResults(null);
    
    // Simulate scan delay
    setTimeout(() => {
      setScanResults({
        url: url,
        score: 72,
        stats: { active: 145, zombie: 3, shadow: 12, deprecated: 8 },
        apis: [
          { endpoint: '/api/v1/auth/login', method: 'POST', status: 'Active', owner: 'Identity Team', lastUsed: 'Just now' },
          { endpoint: '/api/v1/user/payments', method: 'GET', status: 'Active', owner: 'Payments', lastUsed: '5m ago' },
          { endpoint: '/api/v0/transfer/internal', method: 'POST', status: 'Zombie', owner: 'Unknown', lastUsed: '2 days ago' },
          { endpoint: '/api/dev/admin-bypass', method: 'GET', status: 'Shadow', owner: 'Vendor', lastUsed: '1 hr ago' },
          { endpoint: '/api/v2/cards/update', method: 'PUT', status: 'Deprecated', owner: 'Cards Team', lastUsed: '1 year ago' },
          { endpoint: '/api/v1/accounts/summary', method: 'GET', status: 'Active', owner: 'Core Banking', lastUsed: '2m ago' },
        ]
      });
      setIsScanning(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Website Scanner</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Initialize deep surface mapping and behavior analysis on target infrastructure.</p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <form onSubmit={handleScan} className="relative z-10">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Enter Target Environment URL
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Radar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isScanning ? 'text-emerald-500 animate-spin' : 'text-slate-400'}`} />
              <input 
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.onlinesbi.sbi"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
            </div>
            <button 
              type="submit"
              disabled={isScanning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 min-w-[160px]"
            >
              {isScanning ? (
                <>Scanning...</>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Scan Website
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {isScanning && (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analyzing endpoint traffic...</h3>
          <p className="text-slate-500">Mapping API architecture and detecting anomalies.</p>
        </div>
      )}

      {scanResults && !isScanning && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 fade-in">
          
          {/* Risk Score */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="text-amber-500 w-6 h-6" />
                Diagnostic Risk Analysis
              </h2>
              <p className="text-slate-500 text-sm max-w-md">
                AI-based risk analysis factoring in detected Zombie APIs, unauthenticated routes, and deprecation schedules.
              </p>
            </div>
            <div className="flex flex-col items-center">
               <div className="relative w-32 h-32 flex items-center justify-center">
                 <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                      className="text-slate-200 dark:text-slate-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className={scanResults.score < 80 ? 'text-amber-500' : 'text-emerald-500'}
                      strokeDasharray={`${scanResults.score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center justify-center text-center">
                   <span className="text-3xl font-bold text-slate-900 dark:text-white">{scanResults.score}%</span>
                 </div>
               </div>
               <div className="text-slate-500 text-sm mt-3 font-semibold uppercase tracking-wider">Overall Score</div>
            </div>
          </div>

          {/* Classification Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-center">
              <CheckCircle className="text-emerald-500 w-8 h-8 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{scanResults.stats.active}</div>
              <div className="text-sm font-medium text-slate-500 uppercase">Active APIs</div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-5 rounded-xl text-center">
              <Skull className="text-rose-500 w-8 h-8 mx-auto mb-3" />
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">{scanResults.stats.zombie}</div>
              <div className="text-sm font-medium text-rose-500 uppercase">Zombie APIs</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-center">
              <AlertTriangle className="text-indigo-500 w-8 h-8 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{scanResults.stats.shadow}</div>
              <div className="text-sm font-medium text-slate-500 uppercase">Shadow APIs</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-center">
              <Search className="text-amber-500 w-8 h-8 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{scanResults.stats.deprecated}</div>
              <div className="text-sm font-medium text-slate-500 uppercase">Deprecated</div>
            </div>
          </div>

          {/* API List */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Detected Endpoints</h3>
            <ApiTable data={scanResults.apis} />
          </div>

        </div>
      )}
    </div>
  );
};

export default WebsiteScanner;
