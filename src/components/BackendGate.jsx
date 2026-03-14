import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { checkBackendHealth } from '../api';

/**
 * BackendGate
 *
 * Wraps the entire admin dashboard. On mount it pings /api/health and
 * only renders children when the backend responds successfully.
 *
 * If the backend takes more than 10 seconds it shows an error card
 * with a manual retry button.
 *
 * This prevents "Failed to fetch" from ever appearing permanently —
 * instead the user sees a smooth "Connecting…" state.
 */
const BackendGate = ({ children }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'ready' | 'timeout'

  const check = async () => {
    setStatus('checking');
    const ok = await checkBackendHealth(12000); // 12 second window
    setStatus(ok ? 'ready' : 'timeout');
  };

  useEffect(() => { check(); }, []);

  if (status === 'ready') return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center max-w-sm">
        {status === 'checking' ? (
          <>
            {/* Animated connecting indicator */}
            <div className="relative inline-flex h-16 w-16 mb-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
              <span className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500">
                <Wifi className="w-7 h-7 text-emerald-500" />
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Connecting to backend…
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The API server is starting up. This usually takes 2–5 seconds after a code change.
            </p>
          </>
        ) : (
          <>
            <div className="relative inline-flex h-16 w-16 mb-6">
              <span className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 border-2 border-rose-400">
                <WifiOff className="w-7 h-7 text-rose-400" />
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Backend unreachable
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The FastAPI server did not respond within 12 seconds. Make sure{' '}
              <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">npm run dev:all</code>{' '}
              is running in your terminal.
            </p>
            <button
              onClick={check}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow"
            >
              <RefreshCw className="w-4 h-4" />
              Retry connection
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BackendGate;
