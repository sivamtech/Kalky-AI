import React, { useState } from 'react';
import { Button } from './Button';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      if (username === 'kalky' && password === 'Sivam@111') {
        onLogin();
      } else {
        setError('Incorrect username or password.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 relative overflow-hidden bg-[#f5f5f7]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="glass-panel w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/60 backdrop-blur-2xl relative z-10 animate-fade-in-up">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 p-5 transform hover:scale-105 transition-transform duration-500">
            <img 
              src="https://www.kalkydigital.com/kalky-w.png" 
              alt="Kalky" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-[#000044] tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sign in to Kalky Digital Workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/60 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all outline-none text-slate-800 placeholder-slate-400 text-lg shadow-sm"
              placeholder="kalky"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/60 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 transition-all outline-none text-slate-800 placeholder-slate-400 text-lg shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
              <div className="bg-red-100 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
              </div>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            className="w-full h-14 text-lg font-semibold shadow-xl shadow-blue-900/20 mt-2 hover:shadow-blue-900/30"
          >
            Sign In
          </Button>
        </form>
        
        <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Authorized Personnel Only • Kalky Digital System
            </p>
        </div>
      </div>
    </div>
  );
};
