import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null); // null, 'error', 'success'
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock authentication
    if ((username === 'admin' && password === 'admin123') || 
        (username === 'analyst' && password === 'banksecure')) {
      setStatus('success');
      setTimeout(() => navigate('/admin/dashboard'), 500);
    } else {
      setStatus('error');
    }
  };

  return (
    <section id="login" className="py-24 bg-slate-950 relative border-t border-slate-800/50">
      <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 z-10 relative">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-200">Admin Platform</h2>
            <p className="text-slate-400 mt-2 text-sm">Access the defense console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {status === 'error' && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex items-center gap-2 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Invalid credentials. Please try again.
              </div>
            )}
            
            {status === 'success' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Login successful (mock authentication)
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
            >
              Sign In to Console
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-mono">
            Requires hardware token verification in production.
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
