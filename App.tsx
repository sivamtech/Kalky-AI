import React, { useState } from 'react';
import { GenAIView } from './components/GenAIView';
import { ChatView } from './components/ChatView';
import { Login } from './components/Login';

type AppMode = 'gpt' | 'genai';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>('gpt');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-6 overflow-x-hidden flex flex-col">
      
      {/* Mac-style Floating Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none animate-fade-in-down">
        <header className="pointer-events-auto bg-[#000044] rounded-full shadow-2xl shadow-blue-900/20 px-2 py-2 flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md">
          {/* Logo Section */}
          <div className="flex items-center pl-4 pr-2">
            <img 
              src="https://www.kalkydigital.com/kalky-w.png" 
              alt="Kalky Digital" 
              className="h-6 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Segmented Control */}
          <div className="bg-black/20 rounded-full p-1 flex relative">
            <button
              onClick={() => setMode('gpt')}
              className={`
                relative z-10 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300
                ${mode === 'gpt' ? 'text-[#000044] bg-white shadow-md' : 'text-blue-100 hover:text-white'}
              `}
            >
              Kalky GPT
            </button>
            <button
              onClick={() => setMode('genai')}
              className={`
                relative z-10 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300
                ${mode === 'genai' ? 'text-[#000044] bg-white shadow-md' : 'text-blue-100 hover:text-white'}
              `}
            >
              GEN AI
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-32 flex-grow w-full flex flex-col items-center">
        {mode === 'genai' ? <GenAIView /> : <ChatView />}
      </main>
      
      <footer className="w-full text-center py-8 z-0 mt-8">
        <div className="flex flex-wrap justify-center gap-6 mb-4 text-xs font-medium text-slate-500 tracking-wide uppercase">
          <a href="https://www.kalkyinterior.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#000044] transition-colors">Kalky Interior</a>
          <a href="https://www.kitzine.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#000044] transition-colors">Kitzine</a>
          <a href="https://www.kalkydigital.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#000044] transition-colors">Kalky Digital</a>
          <a href="https://www.kalky.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#000044] transition-colors">Kalky Infra</a>
        </div>
        <p className="text-slate-400 text-xs">
          © {new Date().getFullYear()} Kalky Digital. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;